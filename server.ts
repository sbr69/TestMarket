import * as dotenv from 'dotenv';

dotenv.config();
dotenv.config({ path: '.env.local', override: true });
import express from 'express';
import crypto from 'crypto';
import path from 'path';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import swaggerUi from 'swagger-ui-express';
import fs from 'fs';
import { OAuth2Client } from 'google-auth-library';
import helmet from 'helmet';
import morgan from 'morgan';
import { PaymentVerificationUnavailableError, stellarHorizonVerifier } from './server/stellarHorizon';
import { assertCheckoutClaimed, validateCheckoutConfirmation } from './server/agentCheckoutPolicy';
import { toAgentCatalogProduct } from './server/agentCommerce';
import { buildCatalogFacets, expandCatalogSearchTerms, rankCatalogMatches } from './server/catalogTaxonomy';
import { serializePublicProduct } from './server/publicCatalog';
import { productHtmlFallback, renderProductMeta } from './server/seo';
import { searchOpenSearch, suggestOpenSearch } from './server/searchProvider';

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };
const prisma = globalForPrisma.prisma ?? new PrismaClient();
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

const isProduction = process.env.NODE_ENV === 'production';
const JWT_SECRET = process.env.JWT_SECRET || (!isProduction ? 'local-development-secret-change-me' : undefined);
if (!JWT_SECRET) throw new Error('JWT_SECRET must be configured in production');
const TESTNET_MERCHANT_STELLAR_ADDRESS = process.env.TESTNET_MERCHANT_STELLAR_ADDRESS || 'GAS7MXJI3CIRUPZTA75VBMJXAJGUYCLBPHCTZQWGC7OTVSAKZN553WYX';
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
// The Stellar SDK's CommonJS entrypoint is incompatible with Node 24's ESM
// dependency rules on Vercel. Load its ESM entrypoint only for wallet auth.
const loadStellarSdk = () => import('@stellar/stellar-sdk');

/**
 * Verifies a payment independently of the wallet implementation. Classic
 * wallets produce a Horizon `payment` operation; the agent's C... smart
 * wallet produces the native Stellar Asset Contract's canonical `transfer`
 * event. The merchant must accept either, but never trust a client-provided
 * transaction hash without checking the final on-chain result.
 */
async function verifyStellarTestnetPayment(stellarTxHash: string, expectedStroops: number): Promise<boolean> {
  let sorobanReadSucceeded = false;

  try {
    const StellarSdk = await loadStellarSdk();
    const rpcServer = new StellarSdk.rpc.Server(process.env.STELLAR_SOROBAN_RPC_URL || 'https://soroban-testnet.stellar.org');
    const transaction = await rpcServer.getTransaction(stellarTxHash);
    sorobanReadSucceeded = true;

    if (transaction.status === 'SUCCESS') {
      const nativeXlmContractId = StellarSdk.Asset.native().contractId(StellarSdk.Networks.TESTNET);
      const events = StellarSdk.humanizeEvents((transaction.events?.contractEventsXdr || []).flat());
      return events.some((event: any) => {
        if (event.contractId !== nativeXlmContractId || event.type !== 'contract') return false;
        // Native SAC transfer events have four topics:
        // ["transfer", source, destination, "native"].  Requiring three
        // topics rejected every valid payment emitted by the C... smart wallet.
        if (!Array.isArray(event.topics) || event.topics.length !== 4 || event.topics[0] !== 'transfer' || event.topics[3] !== 'native') return false;
        if (String(event.topics[2]) !== TESTNET_MERCHANT_STELLAR_ADDRESS) return false;
        try {
          return BigInt(event.data) === BigInt(expectedStroops);
        } catch {
          return false;
        }
      });
    }
  } catch {
    // Horizon remains a valid verification source for classic account payments.
    // If neither service can verify a Soroban payment, the request is retriable.
  }

  const horizonLookup = await stellarHorizonVerifier.fetchOperations(stellarTxHash);
  if (!horizonLookup.found) return false;
  const operations = horizonLookup.operations as any[];
  const hasClassicPayment = operations.some((operation) => operation.type === 'payment');
  const validClassicPayment = operations.some((operation) =>
    operation.type === 'payment' &&
    operation.asset_type === 'native' &&
    operation.to === TESTNET_MERCHANT_STELLAR_ADDRESS &&
    operation.transaction_successful === true &&
    Math.round(Number(operation.amount) * 10_000_000) === expectedStroops,
  );
  if (validClassicPayment || hasClassicPayment) return validClassicPayment;
  if (!sorobanReadSucceeded) throw new PaymentVerificationUnavailableError(3);
  return false;
}

const app = express();
const PORT = Number(process.env.PORT) || 3000;

  app.disable('x-powered-by');
  app.set('trust proxy', 1);
  app.use(helmet({
    crossOriginEmbedderPolicy: false,
    // Google Identity Services needs the browser to retain the local HTTP
    // referrer during development and to communicate with its sign-in popup.
    // See https://developers.google.com/identity/gsi/web/guides/get-google-api-clientid
    crossOriginOpenerPolicy: { policy: 'same-origin-allow-popups' },
    referrerPolicy: { policy: 'no-referrer-when-downgrade' },
    contentSecurityPolicy: isProduction ? {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", 'https://accounts.google.com', 'https://albedo.link'],
        frameSrc: ["'self'", 'https://accounts.google.com', 'https://albedo.link'],
        imgSrc: ["'self'", 'data:', 'https://images.unsplash.com', 'https://m.media-amazon.com', 'https://mughais.com'],
        connectSrc: ["'self'", 'https://accounts.google.com', 'https://horizon-testnet.stellar.org'],
        styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
        fontSrc: ["'self'", 'https://fonts.gstatic.com'],
        objectSrc: ["'none'"],
        baseUri: ["'self'"],
        formAction: ["'self'"],
      }
    } : false,
  }));
  app.use(morgan(isProduction ? 'combined' : 'dev'));
  app.use(express.json({ limit: '32kb' }));
  // OAuth token and revocation requests use application/x-www-form-urlencoded
  // by specification. Without this parser, dynamic OAuth clients always look
  // unauthenticated at these endpoints even when their credentials are valid.
  app.use(express.urlencoded({ extended: false, limit: '32kb' }));
  app.use((error: any, _req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (error instanceof SyntaxError && 'body' in error) {
      return res.status(400).json({ error: 'Invalid JSON request body', code: 'BAD_REQUEST', status: 400 });
    }
    return next(error);
  });

  type CacheEntry = { expiresAt: number; value?: unknown; pending?: Promise<unknown> };
  const queryCache = new Map<string, CacheEntry>();
  const MAX_CACHE_ENTRIES = 300;
  const cacheQuery = async <T,>(key: string, ttlMs: number, load: () => Promise<T>): Promise<T> => {
    const now = Date.now();
    const existing = queryCache.get(key);
    if (existing?.value !== undefined && existing.expiresAt > now) return existing.value as T;
    if (existing?.pending) return existing.pending as Promise<T>;

    const pending = load()
      .then((value) => {
        queryCache.set(key, { value, expiresAt: Date.now() + ttlMs });
        for (const [cacheKey, entry] of queryCache) {
          if (entry.expiresAt <= Date.now() && !entry.pending) queryCache.delete(cacheKey);
        }
        while (queryCache.size > MAX_CACHE_ENTRIES) {
          const oldest = queryCache.keys().next().value;
          if (!oldest) break;
          queryCache.delete(oldest);
        }
        return value;
      })
      .catch((error) => {
        queryCache.delete(key);
        throw error;
      });
    queryCache.set(key, { expiresAt: now + ttlMs, pending });
    return pending as Promise<T>;
  };
  const invalidateCache = (prefix: string) => {
    for (const key of queryCache.keys()) {
      if (key.startsWith(prefix)) queryCache.delete(key);
    }
  };
  const setPublicCache = (res: express.Response, browserSeconds: number, cdnSeconds: number) => {
    res.set('Cache-Control', `public, max-age=${browserSeconds}, s-maxage=${cdnSeconds}, stale-while-revalidate=${cdnSeconds}`);
  };

  const publicProductSelect = {
    id: true, slug: true, categoryId: true, name: true, brand: true, sellerName: true, description: true,
    mrp: true, price: true, stock: true, rating: true, reviewCount: true, createdAt: true,
    category: { select: { id: true, slug: true, name: true } },
    images: { select: { id: true, url: true }, orderBy: { sortOrder: 'asc' as const }, take: 12 },
    specs: { select: { id: true, key: true, value: true }, orderBy: { key: 'asc' as const }, take: 50 },
  };
  const toPublicProduct = (product: any, issuer: string) => serializePublicProduct({
    ...product,
    categorySlug: product.category?.slug || null,
    categoryName: product.category?.name || null,
    imageUrl: product.images?.[0]?.url || null,
  }, issuer);
  const getCookie = (req: express.Request, name: string) => {
    const match = req.headers.cookie?.split(';').map((part) => part.trim()).find((part) => part.startsWith(`${name}=`));
    return match ? decodeURIComponent(match.slice(name.length + 1)) : undefined;
  };
  const issueSession = (res: express.Response, userId: string) => {
    const token = jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' });
    res.cookie('tm_session', token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: isProduction,
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: '/',
    });
  };
  const rateLimit = (name: string, max: number, windowMs: number) => {
    const buckets = new Map<string, { count: number; resetAt: number }>();
    return (req: express.Request, res: express.Response, next: express.NextFunction) => {
      const now = Date.now();
      const key = `${name}:${req.ip}`;
      const bucket = buckets.get(key);
      if (!bucket || bucket.resetAt <= now) {
        if (buckets.size > 10_000) {
          for (const [bucketKey, candidate] of buckets) {
            if (candidate.resetAt <= now) buckets.delete(bucketKey);
          }
        }
        buckets.set(key, { count: 1, resetAt: now + windowMs });
        return next();
      }
      if (bucket.count >= max) {
        res.set('Retry-After', String(Math.ceil((bucket.resetAt - now) / 1000)));
        return res.status(429).json({ error: 'Too many requests. Please try again later.', code: 'RATE_LIMITED', status: 429 });
      }
      bucket.count += 1;
      return next();
    };
  };
  const authRateLimit = rateLimit('auth', 15, 15 * 60 * 1000);
  const writeRateLimit = rateLimit('write', 90, 60 * 1000);

  // --- Swagger API Docs ---
  if (!isProduction || process.env.ENABLE_API_DOCS === 'true') {
    const swaggerDocument = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'swagger.json'), 'utf8'));
    app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
  }

  // --- Auth Middleware ---
  const authenticateToken = async (req: any, res: any, next: any) => {
    const authHeader = req.headers['authorization'];
    const bearerToken = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : undefined;
    const token = bearerToken && bearerToken !== 'null' && bearerToken !== 'undefined' ? bearerToken : getCookie(req, 'tm_session');

    if (!token) return res.status(401).json({ error: 'Unauthorized', code: 'UNAUTHORIZED', status: 401 });

    try {
      const user: any = jwt.verify(token, JWT_SECRET);
      if (user?.isOAuth && user?.jti) {
        const activeToken = await (prisma as any).oAuthAccessToken.findFirst({
          where: { jti: user.jti, clientId: user.clientId, userId: user.userId, revokedAt: null, expiresAt: { gt: new Date() } },
          select: { id: true },
        });
        if (!activeToken) return res.status(403).json({ error: 'OAuth token has been revoked or expired', code: 'FORBIDDEN', status: 403 });
      }
      req.user = user;
      return next();
    } catch {
      return res.status(403).json({ error: 'Forbidden', code: 'FORBIDDEN', status: 403 });
    }
  };
  const normalizeEmail = (value: unknown) => typeof value === 'string' ? value.trim().toLowerCase() : '';
  const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && email.length <= 254;
  const getString = (value: unknown, maxLength: number) => typeof value === 'string' ? value.trim().slice(0, maxLength) : '';
  const publicUser = (user: { id: string; name: string; email: string; phone?: string | null }) => ({
    id: user.id,
    name: user.name,
    email: user.email,
    ...(user.phone ? { phone: user.phone } : {}),
  });
  const OAUTH_SCOPES = ['profile', 'cart:read', 'cart:write', 'checkout:prepare', 'checkout:confirm', 'orders:read'] as const;
  const DEFAULT_OAUTH_SCOPES = ['profile', 'cart:read', 'checkout:prepare', 'checkout:confirm', 'orders:read'];
  const scopeList = (value: unknown) => [...new Set(getString(value, 1_000).split(/\s+/).filter(Boolean))];
  const scopeString = (scopes: string[]) => scopes.join(' ');
  const clientScopes = (client: any) => scopeList(client.allowedScopes || scopeString(DEFAULT_OAUTH_SCOPES));
  const requestedScopes = (client: any, value: unknown) => {
    const requested = scopeList(value);
    const scopes = requested.length ? requested : DEFAULT_OAUTH_SCOPES;
    const allowed = new Set(clientScopes(client));
    return scopes.every((scope) => (OAUTH_SCOPES as readonly string[]).includes(scope) && allowed.has(scope)) ? scopes : undefined;
  };
  const getIssuer = (req: express.Request) => (process.env.OAUTH_ISSUER || `${req.protocol}://${req.get('host')}`).replace(/\/$/, '');
  const isSafeRedirectUri = (value: string) => {
    try {
      const uri = new URL(value);
      return uri.protocol === 'https:' || (uri.protocol === 'http:' && ['127.0.0.1', '[::1]', 'localhost'].includes(uri.hostname));
    } catch {
      return false;
    }
  };
  const hasScopes = (user: any, required: string[]) => {
    const granted = new Set(scopeList(user?.scope));
    return required.every((scope) => granted.has(scope));
  };
  const requireOAuthScopes = (...required: string[]) => (req: any, res: any, next: any) => {
    if (!req.user?.isOAuth || !hasScopes(req.user, required)) {
      return res.status(403).json({ error: 'Insufficient OAuth scope', code: 'INSUFFICIENT_SCOPE', required_scopes: required, status: 403 });
    }
    return next();
  };
  // Browser sessions remain fully functional. Newly issued OAuth tokens must
  // carry the route's permission even when they use the established API paths.
  const requireScopesWhenOAuth = (...required: string[]) => (req: any, res: any, next: any) => {
    if (req.user?.isOAuth && req.user?.jti && !hasScopes(req.user, required)) {
      return res.status(403).json({ error: 'Insufficient OAuth scope', code: 'INSUFFICIENT_SCOPE', required_scopes: required, status: 403 });
    }
    return next();
  };

  // --- Public Auth Endpoints ---
  app.post('/api/auth/google', authRateLimit, async (req, res) => {
    try {
      const credential = getString(req.body?.credential, 8_000);
      if (!credential || !process.env.GOOGLE_CLIENT_ID) return res.status(400).json({ error: 'Google sign-in is not configured' });
      const ticket = await googleClient.verifyIdToken({
        idToken: credential,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
      const payload = ticket.getPayload();
      
      if (!payload || !payload.email || !payload.email_verified) {
        return res.status(400).json({ error: 'Invalid Google token' });
      }

      const email = normalizeEmail(payload.email);
      const name = getString(payload.name, 100) || 'Google User';

      let user = await prisma.user.findUnique({ where: { email } });
      if (!user) {
        // Create user with random password since they authenticate via Google
        const randomPassword = crypto.randomBytes(16).toString('hex');
        const passwordHash = await bcrypt.hash(randomPassword, 10);
        user = await prisma.user.create({
          data: { name, email, passwordHash }
        });
      }

      issueSession(res, user.id);
      res.json({ user: publicUser(user) });
    } catch (err) {
      console.error(err);
      res.status(401).json({ error: 'Google authentication failed' });
    }
  });
  app.post('/api/auth/stellar/challenge', authRateLimit, async (req, res) => {
    const publicKey = getString(req.body?.publicKey, 56);
    try {
      const { Keypair } = await loadStellarSdk();
      Keypair.fromPublicKey(publicKey);
    } catch {
      return res.status(400).json({ error: 'Invalid Stellar public key' });
    }
    const challengeId = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
    try {
      await prisma.$transaction([
        prisma.walletLoginChallenge.deleteMany({ where: { expiresAt: { lte: new Date() } } }),
        prisma.walletLoginChallenge.create({ data: { id: challengeId, publicKey, expiresAt } }),
      ]);
      const challenge = jwt.sign({ type: 'stellar_login', publicKey }, JWT_SECRET, { expiresIn: '5m', jwtid: challengeId });
      return res.json({ challenge });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Unable to create wallet sign-in challenge' });
    }
  });
  app.post('/api/auth/stellar', authRateLimit, async (req, res) => {
    try {
      const { Keypair } = await loadStellarSdk();
      const publicKey = getString(req.body?.publicKey, 56);
      const challenge = getString(req.body?.challenge, 2_000);
      const signature = getString(req.body?.signature, 512);
      if (!publicKey || !challenge || !signature) {
        return res.status(400).json({ error: 'Wallet signature is required' });
      }

      const verifiedChallenge = jwt.verify(challenge, JWT_SECRET) as jwt.JwtPayload;
      if (verifiedChallenge.type !== 'stellar_login' || verifiedChallenge.publicKey !== publicKey || !verifiedChallenge.jti) {
        return res.status(401).json({ error: 'Invalid wallet sign-in challenge' });
      }
      const messageHash = crypto.createHash('sha256').update(`Stellar Signed Message:\n${challenge}`).digest();
      const signatureBuffer = Buffer.from(signature, 'base64');
      if (signatureBuffer.length === 0 || !Keypair.fromPublicKey(publicKey).verify(messageHash, signatureBuffer)) {
        return res.status(401).json({ error: 'Invalid wallet signature' });
      }
      const consumed = await prisma.walletLoginChallenge.deleteMany({
        where: { id: verifiedChallenge.jti, publicKey, expiresAt: { gt: new Date() } },
      });
      if (consumed.count !== 1) return res.status(401).json({ error: 'Wallet sign-in challenge has expired or was already used' });

      const email = `${publicKey}@stellar.wallet`;
      const name = `${publicKey.substring(0, 5)}...${publicKey.substring(publicKey.length - 4)}`;

      let user = await prisma.user.findUnique({ where: { email } });
      if (!user) {
        // Create user with random password
        const randomPassword = crypto.randomBytes(16).toString('hex');
        const passwordHash = await bcrypt.hash(randomPassword, 10);
        user = await prisma.user.create({
          data: { name, email, passwordHash }
        });
      }

      issueSession(res, user.id);
      res.json({ user: publicUser(user) });
    } catch (err) {
      console.error(err);
      res.status(401).json({ error: 'Wallet authentication failed' });
    }
  });

  app.post('/api/auth/register', authRateLimit, async (req, res) => {
    try {
      const name = getString(req.body?.name, 100);
      const email = normalizeEmail(req.body?.email);
      const password = typeof req.body?.password === 'string' ? req.body.password : '';
      if (!name || !isValidEmail(email) || password.length < 8 || password.length > 128) {
        return res.status(400).json({ error: 'Enter a name, valid email, and password of at least 8 characters', code: 'BAD_REQUEST', status: 400 });
      }
      const existingUser = await prisma.user.findUnique({ where: { email } });
      if (existingUser) {
        return res.status(409).json({ error: 'User already exists', code: 'USER_EXISTS', status: 409 });
      }
      
      const passwordHash = await bcrypt.hash(password, 10);
      const user = await prisma.user.create({
        data: { name, email, passwordHash }
      });
      
      issueSession(res, user.id);
      res.status(201).json({ user: publicUser(user) });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal Server Error', code: 'INTERNAL_ERROR', status: 500 });
    }
  });

  app.post('/api/auth/login', authRateLimit, async (req, res) => {
    try {
      const email = normalizeEmail(req.body?.email);
      const password = typeof req.body?.password === 'string' ? req.body.password : '';
      if (!isValidEmail(email) || !password) return res.status(400).json({ error: 'Invalid credentials', code: 'INVALID_CREDENTIALS', status: 400 });
      const user = await prisma.user.findUnique({ where: { email } });
      if (!user) return res.status(400).json({ error: 'Invalid credentials', code: 'INVALID_CREDENTIALS', status: 400 });
      
      const valid = await bcrypt.compare(password, user.passwordHash);
      if (!valid) return res.status(400).json({ error: 'Invalid credentials', code: 'INVALID_CREDENTIALS', status: 400 });
      
      issueSession(res, user.id);
      res.json({ user: publicUser(user) });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal Server Error', code: 'INTERNAL_ERROR', status: 500 });
    }
  });

  // Public browser-session probe: a signed-out visitor is a valid state, not
  // an authentication error. Keep /api/auth/me protected for API clients.
  app.get('/api/auth/session', async (req, res) => {
    res.set('Cache-Control', 'private, no-store');
    const token = getCookie(req, 'tm_session');
    if (!token) return res.json({ user: null });

    try {
      const session = jwt.verify(token, JWT_SECRET) as { userId?: string };
      if (!session.userId) throw new Error('Invalid browser session');
      const user = await prisma.user.findUnique({
        where: { id: session.userId },
        select: { id: true, name: true, email: true, phone: true },
      });
      if (!user) throw new Error('Session user not found');
      return res.json({ user: publicUser(user) });
    } catch {
      res.clearCookie('tm_session', { httpOnly: true, sameSite: 'lax', secure: isProduction, path: '/' });
      return res.json({ user: null });
    }
  });

  app.get('/api/auth/me', authenticateToken, requireScopesWhenOAuth('profile'), async (req: any, res: any) => {
    try {
      const user = await prisma.user.findUnique({ 
        where: { id: req.user.userId },
        select: { id: true, name: true, email: true, phone: true }
      });
      if (!user) return res.status(404).json({ error: 'User not found', code: 'NOT_FOUND', status: 404 });
      res.json(user);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal Server Error', code: 'INTERNAL_ERROR', status: 500 });
    }
  });

  // --- OAuth 2.0 / RFC 8414 Provider Endpoints ---
  const oauthError = (res: express.Response, status: number, error: string, errorDescription: string) =>
    res.status(status).json({ error, error_description: errorDescription });
  const oauthTokenHash = (token: string) => crypto.createHash('sha256').update(token).digest('hex');
  const oauthRandomToken = () => crypto.randomBytes(32).toString('base64url');
  const parseClientCredentials = (req: express.Request) => {
    const basic = req.headers.authorization?.match(/^Basic\s+(.+)$/i)?.[1];
    if (basic) {
      try {
        const [clientId, ...secretParts] = Buffer.from(basic, 'base64').toString('utf8').split(':');
        return { clientId: getString(clientId, 128), clientSecret: getString(secretParts.join(':'), 512) };
      } catch { /* fall through to request body */ }
    }
    return { clientId: getString((req.body as any)?.client_id, 128), clientSecret: getString((req.body as any)?.client_secret, 512) };
  };
  const verifyOAuthClient = async (clientId: string, clientSecret: string) => {
    const client = await (prisma as any).oAuthClient.findUnique({ where: { clientId } });
    if (!client) return undefined;
    if (client.tokenEndpointAuthMethod === 'none') return client;
    if (client.clientSecretHash) return (await bcrypt.compare(clientSecret, client.clientSecretHash)) ? client : undefined;
    const supplied = Buffer.from(clientSecret);
    const stored = Buffer.from(client.clientSecret || '');
    return supplied.length === stored.length && crypto.timingSafeEqual(supplied, stored) ? client : undefined;
  };
  const issueOAuthTokens = async (userId: string, clientId: string, scopes: string[]) => {
    const now = Date.now();
    const accessLifetimeSeconds = 15 * 60;
    const refreshLifetimeMs = 30 * 24 * 60 * 60 * 1000;
    const jti = oauthRandomToken();
    const scope = scopeString(scopes);
    await (prisma as any).oAuthAccessToken.create({
      data: { jti, userId, clientId, scope, expiresAt: new Date(now + accessLifetimeSeconds * 1000) },
    });
    const refreshToken = oauthRandomToken();
    await (prisma as any).oAuthRefreshToken.create({
      data: { tokenHash: oauthTokenHash(refreshToken), userId, clientId, scope, expiresAt: new Date(now + refreshLifetimeMs) },
    });
    const accessToken = jwt.sign({ sub: userId, userId, clientId, scope, jti, isOAuth: true }, JWT_SECRET, { expiresIn: accessLifetimeSeconds });
    return { access_token: accessToken, refresh_token: refreshToken, token_type: 'Bearer', expires_in: accessLifetimeSeconds, scope };
  };

  app.get('/.well-known/oauth-authorization-server', (req, res) => {
    const issuer = getIssuer(req);
    setPublicCache(res, 300, 3600);
    res.json({
      issuer,
      authorization_endpoint: `${issuer}/oauth/authorize`,
      token_endpoint: `${issuer}/oauth/token`,
      registration_endpoint: `${issuer}/oauth/register`,
      revocation_endpoint: `${issuer}/oauth/revoke`,
      response_types_supported: ['code'],
      grant_types_supported: ['authorization_code', 'refresh_token'],
      token_endpoint_auth_methods_supported: ['client_secret_post', 'client_secret_basic', 'none'],
      code_challenge_methods_supported: ['S256'],
      scopes_supported: OAUTH_SCOPES,
    });
  });

  app.get('/.well-known/agent-commerce', (req, res) => {
    const issuer = getIssuer(req);
    setPublicCache(res, 300, 3600);
    res.json({
      version: '1.0',
      oauth_authorization_server: `${issuer}/.well-known/oauth-authorization-server`,
      search_endpoint: `${issuer}/api/agent/commerce/v1/products/search`,
      product_detail_endpoint_template: `${issuer}/api/agent/commerce/v1/products/{product_id}`,
      checkout_prepare_endpoint: `${issuer}/api/agent/commerce/v1/checkout/prepare`,
      checkout_confirm_endpoint: `${issuer}/api/agent/commerce/v1/checkout/confirm`,
      orders_endpoint: `${issuer}/api/agent/commerce/v1/orders`,
      reviews_endpoint_template: `${issuer}/api/products/{product_id}/reviews`,
      catalog: {
        pagination: { type: 'offset', parameter: 'offset', default_limit: 20, max_limit: 48 },
        filters: ['category', 'brand', 'in_stock', 'min_price_xlm', 'max_price_xlm'],
        sort: ['relevance', 'price_asc', 'price_desc', 'rating_desc'],
        search: { mode: 'taxonomy_aware_lexical', response_facets: true, relevance_field: 'relevance' },
        product_fields: ['price_xlm', 'price_stroops', 'availability', 'category_name', 'product_type', 'taxonomy_path', 'search_aliases', 'tags', 'attributes'],
      },
      required_scopes: {
        checkout_prepare_endpoint: ['checkout:prepare'],
        checkout_confirm_endpoint: ['checkout:confirm'],
        orders_endpoint: ['orders:read'],
      },
      settlement: {
        network: 'testnet',
        asset: 'XLM',
        merchant_stellar_address: TESTNET_MERCHANT_STELLAR_ADDRESS,
        confirmation: 'Submit the Stellar testnet transaction hash to checkout_confirm_endpoint.',
      },
    });
  });

  // Public, read-only catalogue discovery for search engines and shopping
  // assistants. It exposes only the same product data already visible to a
  // browser; OAuth remains mandatory for profile, checkout, orders, and any
  // action that changes state.
  app.get('/.well-known/agent-catalog', (req, res) => {
    const issuer = getIssuer(req);
    setPublicCache(res, 300, 3600);
    res.json({
      version: '1.1',
      catalog_endpoint: `${issuer}/catalog.json`,
      search_endpoint: `${issuer}/api/agent/commerce/v1/products/search`,
      product_detail_endpoint_template: `${issuer}/api/agent/commerce/v1/products/{product_id}`,
      format: 'application/json',
      access: 'public-read-only',
      capabilities: ['taxonomy', 'structured_attributes', 'facets', 'pagination', 'xlm_pricing'],
    });
  });

  app.get(['/oauth/client', '/api/oauth/client'], async (req, res) => {
    try {
      const clientId = getString(req.query.client_id, 128);
      if (!clientId) return res.status(400).json({ error: 'client_id is required', code: 'BAD_REQUEST', status: 400 });
      const client = await (prisma as any).oAuthClient.findUnique({ where: { clientId } });
      if (!client) return res.status(404).json({ error: 'Client not found', code: 'NOT_FOUND', status: 404 });
      setPublicCache(res, 60, 300);
      res.json({ name: client.name, redirect_uris: client.redirectUris, allowed_scopes: clientScopes(client) });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  app.post(['/oauth/register', '/api/oauth/register'], authRateLimit, async (req, res) => {
    try {
    const redirectUris = Array.isArray(req.body?.redirect_uris) ? [...new Set(req.body.redirect_uris.map((uri: unknown) => getString(uri, 2_000)).filter(Boolean))] : [];
      const name = getString(req.body?.client_name, 160) || 'Dynamic OAuth Client';
      const authMethod = getString(req.body?.token_endpoint_auth_method, 64) || 'client_secret_post';
      const requested = scopeList(req.body?.scope);
      const scopes = requested.length ? requested : DEFAULT_OAUTH_SCOPES;
    if (!redirectUris.length || redirectUris.length > 10 || !redirectUris.every((uri) => typeof uri === 'string' && isSafeRedirectUri(uri))) {
        return oauthError(res, 400, 'invalid_client_metadata', 'redirect_uris must contain one to ten exact HTTPS or loopback callback URLs');
      }
      if (!['client_secret_post', 'none'].includes(authMethod) || !scopes.every((scope) => (OAUTH_SCOPES as readonly string[]).includes(scope))) {
        return oauthError(res, 400, 'invalid_client_metadata', 'Unsupported token endpoint authentication method or scope');
      }
      const clientId = `tm_${oauthRandomToken()}`;
      const clientSecret = authMethod === 'none' ? undefined : oauthRandomToken();
      const client = await (prisma as any).oAuthClient.create({
        data: {
          clientId,
          clientSecret: clientSecret ? '__hashed__' : '',
          ...(clientSecret ? { clientSecretHash: await bcrypt.hash(clientSecret, 12) } : {}),
          name,
          redirectUris: redirectUris.join(','),
          tokenEndpointAuthMethod: authMethod,
          allowedScopes: scopeString(scopes),
          isDynamic: true,
        },
      });
      res.status(201).json({ client_id: client.clientId, ...(clientSecret ? { client_secret: clientSecret } : {}), client_id_issued_at: Math.floor(Date.now() / 1000), token_endpoint_auth_method: authMethod, redirect_uris: redirectUris, scope: scopeString(scopes) });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'server_error', error_description: 'Unable to register client' });
    }
  });

  app.post(['/oauth/authorize', '/api/oauth/authorize'], authenticateToken, writeRateLimit, async (req: any, res: any) => {
    try {
      const clientId = getString(req.body?.client_id, 128);
      const redirectUri = getString(req.body?.redirect_uri, 2_000);
      const responseType = getString(req.body?.response_type, 32) || 'code';
      const codeChallenge = getString(req.body?.code_challenge, 128);
      const codeChallengeMethod = getString(req.body?.code_challenge_method, 16) || (codeChallenge ? 'S256' : '');
      if (!clientId || !redirectUri || responseType !== 'code') return oauthError(res, 400, 'invalid_request', 'client_id, redirect_uri and response_type=code are required');
      const client = await (prisma as any).oAuthClient.findUnique({ where: { clientId } });
      if (!client) return oauthError(res, 400, 'unauthorized_client', 'Unknown client_id');
      if (!client.redirectUris.split(',').map((uri: string) => uri.trim()).includes(redirectUri)) return oauthError(res, 400, 'invalid_request', 'redirect_uri is not registered for this client');
      const scopes = requestedScopes(client, req.body?.scope);
      if (!scopes) return oauthError(res, 400, 'invalid_scope', 'One or more requested scopes are not allowed');
      const requiresPkce = client.isDynamic || client.tokenEndpointAuthMethod === 'none';
      if ((requiresPkce && (!codeChallenge || codeChallengeMethod !== 'S256')) || (codeChallenge && (codeChallengeMethod !== 'S256' || !/^[A-Za-z0-9._~-]{43,128}$/.test(codeChallenge)))) {
        return oauthError(res, 400, 'invalid_request', 'PKCE S256 code_challenge is required for this client');
      }
      const code = oauthRandomToken();
      await (prisma as any).oAuthAuthCode.create({
        data: { code, clientId, userId: req.user.userId, redirectUri, scope: scopeString(scopes), ...(codeChallenge ? { codeChallenge, codeChallengeMethod } : {}), expiresAt: new Date(Date.now() + 5 * 60 * 1000) },
      });
      res.json({ code, expires_in: 300, scope: scopeString(scopes) });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'server_error', error_description: 'Unable to issue authorization code' });
    }
  });

  app.post(['/oauth/token', '/api/oauth/token'], authRateLimit, async (req, res) => {
    try {
      const grantType = getString(req.body?.grant_type, 64);
      const { clientId, clientSecret } = parseClientCredentials(req);
      const client = await verifyOAuthClient(clientId, clientSecret);
      if (!client) return oauthError(res, 401, 'invalid_client', 'Client authentication failed');
      if (grantType === 'authorization_code') {
        const code = getString(req.body?.code, 256);
        const redirectUri = getString(req.body?.redirect_uri, 2_000);
        const verifier = getString(req.body?.code_verifier, 256);
        const authCode = await (prisma as any).oAuthAuthCode.findUnique({ where: { code } });
        if (!authCode || authCode.clientId !== clientId || authCode.expiresAt < new Date() || authCode.usedAt) return oauthError(res, 400, 'invalid_grant', 'Authorization code is invalid or expired');
        if (redirectUri && authCode.redirectUri !== redirectUri) return oauthError(res, 400, 'invalid_grant', 'redirect_uri does not match the authorization request');
        if (authCode.codeChallenge) {
          const expected = crypto.createHash('sha256').update(verifier).digest('base64url');
          if (!verifier || !crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(authCode.codeChallenge))) return oauthError(res, 400, 'invalid_grant', 'PKCE code_verifier is invalid');
        }
        const consumed = await (prisma as any).oAuthAuthCode.updateMany({ where: { id: authCode.id, usedAt: null, expiresAt: { gte: new Date() } }, data: { usedAt: new Date() } });
        if (consumed.count !== 1) return oauthError(res, 400, 'invalid_grant', 'Authorization code has already been used');
        return res.json(await issueOAuthTokens(authCode.userId, clientId, scopeList(authCode.scope)));
      }
      if (grantType === 'refresh_token') {
        const refreshToken = getString(req.body?.refresh_token, 256);
        const existing = await (prisma as any).oAuthRefreshToken.findUnique({ where: { tokenHash: oauthTokenHash(refreshToken) } });
        if (!existing || existing.clientId !== clientId || existing.expiresAt < new Date() || existing.usedAt) return oauthError(res, 400, 'invalid_grant', 'Refresh token is invalid or expired');
        const rotated = await (prisma as any).oAuthRefreshToken.updateMany({ where: { id: existing.id, usedAt: null, expiresAt: { gte: new Date() } }, data: { usedAt: new Date() } });
        if (rotated.count !== 1) return oauthError(res, 400, 'invalid_grant', 'Refresh token has already been used');
        return res.json(await issueOAuthTokens(existing.userId, clientId, scopeList(existing.scope)));
      }
      return oauthError(res, 400, 'unsupported_grant_type', 'Supported grants are authorization_code and refresh_token');
    } catch (err) {
      console.error(err);
      return oauthError(res, 500, 'server_error', 'Unable to issue token');
    }
  });

  app.post(['/oauth/revoke', '/api/oauth/revoke'], authRateLimit, async (req, res) => {
    try {
      const { clientId, clientSecret } = parseClientCredentials(req);
      const client = await verifyOAuthClient(clientId, clientSecret);
      if (!client) return oauthError(res, 401, 'invalid_client', 'Client authentication failed');
      const token = getString(req.body?.token, 4_096);
      const decoded: any = jwt.decode(token);
      if (decoded?.isOAuth && decoded.clientId === clientId && decoded.jti) {
        await (prisma as any).oAuthAccessToken.updateMany({ where: { jti: decoded.jti, clientId }, data: { revokedAt: new Date() } });
      }
      if (token) await (prisma as any).oAuthRefreshToken.updateMany({ where: { tokenHash: oauthTokenHash(token), clientId }, data: { usedAt: new Date() } });
      return res.status(200).send();
    } catch (err) {
      console.error(err);
      return res.status(200).send(); // RFC 7009 intentionally does not reveal token validity.
    }
  });

  // --- Public Product Endpoints ---
  app.get('/robots.txt', (req, res) => {
    const issuer = getIssuer(req);
    res.type('text/plain').send(`User-agent: *\nAllow: /\nDisallow: /api/\nDisallow: /oauth/\nSitemap: ${issuer}/sitemap.xml\n`);
  });

  const xmlEscape = (value: unknown) => String(value ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');
  const SITEMAP_PAGE_SIZE = 1_000;

  app.get('/sitemap.xml', async (req, res) => {
    try {
      const issuer = getIssuer(req);
      const total = await prisma.product.count({ where: { isActive: true } });
      const productPages = Math.max(1, Math.ceil(total / SITEMAP_PAGE_SIZE));
      const maps = [`${issuer}/sitemap-pages.xml`, ...Array.from({ length: productPages }, (_value, index) => `${issuer}/sitemap-products-${index + 1}.xml`)]
        .map((url) => `<sitemap><loc>${xmlEscape(url)}</loc></sitemap>`).join('');
      setPublicCache(res, 300, 900);
      res.type('application/xml').send(`<?xml version="1.0" encoding="UTF-8"?><sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${maps}</sitemapindex>`);
    } catch (err) {
      console.error(err);
      res.status(500).type('text/plain').send('Unable to generate sitemap');
    }
  });

  app.get('/sitemap-pages.xml', (req, res) => {
    const issuer = getIssuer(req);
    const urls = [`${issuer}/`, `${issuer}/?category=electronics`, `${issuer}/?category=toys`, `${issuer}/?category=home-kitchen`]
      .map((url) => `<url><loc>${xmlEscape(url)}</loc></url>`).join('');
    setPublicCache(res, 300, 900);
    res.type('application/xml').send(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>`);
  });

  app.get('/sitemap-products-:page.xml', async (req, res) => {
    try {
      const page = Number(req.params.page);
      if (!Number.isInteger(page) || page < 1 || page > 10_000) return res.status(404).type('text/plain').send('Sitemap not found');
      const issuer = getIssuer(req);
      const products = await prisma.product.findMany({
        where: { isActive: true }, select: { slug: true, createdAt: true }, orderBy: [{ createdAt: 'desc' }, { id: 'asc' }],
        skip: (page - 1) * SITEMAP_PAGE_SIZE, take: SITEMAP_PAGE_SIZE,
      });
      if (!products.length && page > 1) return res.status(404).type('text/plain').send('Sitemap not found');
      const urls = products.map((product) => `<url><loc>${xmlEscape(`${issuer}/product/${encodeURIComponent(product.slug)}`)}</loc><lastmod>${product.createdAt.toISOString()}</lastmod></url>`).join('');
      setPublicCache(res, 300, 900);
      res.type('application/xml').send(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>`);
    } catch (err) {
      console.error(err);
      res.status(500).type('text/plain').send('Unable to generate sitemap');
    }
  });

  app.get('/catalog.json', async (req, res) => {
    try {
      const issuer = getIssuer(req);
      const limitValue = Number(req.query.limit ?? 48);
      const limit = Number.isInteger(limitValue) && limitValue > 0 ? Math.min(limitValue, 100) : 48;
      const offsetValue = Number(req.query.offset ?? 0);
      const offset = Number.isInteger(offsetValue) && offsetValue >= 0 ? Math.min(offsetValue, 10_000) : 0;
      const [total, products] = await Promise.all([
        prisma.product.count({ where: { isActive: true, stock: { gt: 0 } } }),
        prisma.product.findMany({
          where: { isActive: true, stock: { gt: 0 } }, orderBy: [{ createdAt: 'desc' }, { id: 'asc' }], skip: offset, take: limit,
          select: {
            id: true, slug: true, name: true, brand: true, sellerName: true, description: true, price: true, mrp: true,
            rating: true, reviewCount: true, stock: true, createdAt: true,
            category: { select: { slug: true, name: true } },
            specs: { select: { key: true, value: true }, orderBy: { key: 'asc' }, take: 50 },
            images: { select: { url: true }, take: 1, orderBy: { sortOrder: 'asc' } },
          },
        }),
      ]);
      setPublicCache(res, 60, 300);
      res.json({
        version: '1.2', currency: 'XLM', generated_at: new Date().toISOString(),
        products: products.map((product) => serializePublicProduct({
          ...product,
          categorySlug: product.category?.slug || null,
          categoryName: product.category?.name || null,
          imageUrl: product.images[0]?.url || null,
        }, issuer)),
        pagination: { offset, limit, total, next_offset: offset + products.length < total ? offset + products.length : null },
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'INTERNAL_ERROR' });
    }
  });

  app.get('/api/categories', async (req, res) => {
    try {
      const categories = await cacheQuery('categories', 5 * 60_000, () => prisma.category.findMany({
        select: { id: true, name: true, slug: true, iconUrl: true },
        orderBy: { name: 'asc' },
      }));
      setPublicCache(res, 300, 900);
      res.json(categories);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal Server Error', code: 'INTERNAL_ERROR', status: 500 });
    }
  });

  const publicLimit = (value: unknown, fallback = 20, max = 100) => {
    const parsed = Number(value ?? fallback);
    return Number.isInteger(parsed) && parsed > 0 ? Math.min(parsed, max) : fallback;
  };

  app.get('/api/brands', async (req, res) => {
    try {
      const limit = publicLimit(req.query.limit, 50, 100);
      const brands = await cacheQuery(`brands:${limit}`, 5 * 60_000, async () => {
        const rows = await prisma.product.groupBy({
          by: ['brand'], where: { isActive: true, stock: { gt: 0 } }, _count: { _all: true }, orderBy: { _count: { brand: 'desc' } }, take: limit,
        });
        return rows.map((row) => ({ name: row.brand, product_count: row._count._all, url: `${getIssuer(req)}/api/products?brand=${encodeURIComponent(row.brand)}` }));
      });
      setPublicCache(res, 300, 900);
      res.json({ brands, pagination: { limit, total: brands.length } });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'INTERNAL_ERROR' });
    }
  });

  app.get('/api/deals', async (req, res) => {
    try {
      const limit = publicLimit(req.query.limit, 20, 100);
      const products = await cacheQuery(`deals:${limit}`, 60_000, () => prisma.product.findMany({
        where: { isActive: true, stock: { gt: 0 } },
        // Prisma cannot sort by a calculated discount portably; fetch the
        // bounded test catalogue and rank the observable merchant prices.
        orderBy: [{ createdAt: 'desc' }, { id: 'asc' }], take: 500, select: publicProductSelect,
      }));
      const deals = products.map((product) => toPublicProduct(product, getIssuer(req)))
        .filter((product) => product.discount_percent > 0)
        .sort((left, right) => right.discount_percent - left.discount_percent || Number(right.rating || 0) - Number(left.rating || 0))
        .slice(0, limit);
      setPublicCache(res, 60, 300);
      res.json({ products: deals, pagination: { limit, total: deals.length }, sort: 'discount_desc' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'INTERNAL_ERROR' });
    }
  });

  app.get('/api/trending', async (req, res) => {
    try {
      const limit = publicLimit(req.query.limit, 20, 100);
      const products = await cacheQuery(`trending:${limit}`, 60_000, () => prisma.product.findMany({
        where: { isActive: true, stock: { gt: 0 } }, orderBy: [{ reviewCount: 'desc' }, { rating: 'desc' }, { createdAt: 'desc' }], take: limit, select: publicProductSelect,
      }));
      setPublicCache(res, 60, 300);
      res.json({ products: products.map((product) => toPublicProduct(product, getIssuer(req))), pagination: { limit, total: products.length }, sort: 'review_count_desc' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'INTERNAL_ERROR' });
    }
  });

  app.get('/api/recommendations', async (req, res) => {
    try {
      const identifier = getString(req.query.product_id ?? req.query.product ?? req.query.slug, 160);
      const limit = publicLimit(req.query.limit, 8, 24);
      const reference = identifier ? await prisma.product.findFirst({ where: { isActive: true, OR: [{ id: identifier }, { slug: identifier }] }, select: { id: true, categoryId: true, price: true } }) : null;
      const products = await prisma.product.findMany({
        where: {
          isActive: true,
          stock: { gt: 0 },
          ...(reference ? { id: { not: reference.id }, categoryId: reference.categoryId } : {}),
        },
        orderBy: reference ? [{ rating: 'desc' }, { reviewCount: 'desc' }] : [{ reviewCount: 'desc' }, { rating: 'desc' }],
        take: limit,
        select: publicProductSelect,
      });
      setPublicCache(res, 60, 300);
      res.json({ products: products.map((product) => toPublicProduct(product, getIssuer(req))), basis: reference ? 'same_category' : 'trending', pagination: { limit, total: products.length } });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'INTERNAL_ERROR' });
    }
  });

  app.get('/api/reviews', async (req, res) => {
    try {
      const identifier = getString(req.query.product_id ?? req.query.product ?? req.query.slug, 160);
      const limit = publicLimit(req.query.limit, 20, 100);
      const pageValue = Number(req.query.page ?? 1);
      const page = Number.isInteger(pageValue) && pageValue > 0 ? Math.min(pageValue, 10_000) : 1;
      const product = identifier ? await prisma.product.findFirst({ where: { isActive: true, OR: [{ id: identifier }, { slug: identifier }] }, select: { id: true } }) : null;
      if (identifier && !product) return res.status(404).json({ error: 'PRODUCT_NOT_FOUND' });
      const where = product ? { productId: product.id } : {};
      const [total, reviews] = await Promise.all([
        prisma.review.count({ where }),
        prisma.review.findMany({
          where, skip: (page - 1) * limit, take: limit, orderBy: { createdAt: 'desc' },
          select: { id: true, productId: true, rating: true, title: true, body: true, verifiedPurchase: true, createdAt: true, user: { select: { name: true } } },
        }),
      ]);
      setPublicCache(res, 30, 120);
      res.json({ reviews: reviews.map((review) => ({ id: review.id, product_id: review.productId, reviewer: review.user.name, rating: review.rating, title: review.title, body: review.body, verified: review.verifiedPurchase, created_at: review.createdAt })), pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'INTERNAL_ERROR' });
    }
  });

  const publicSearchHandler = async (req: express.Request, res: express.Response) => {
    try {
      const q = getString(req.query.q, 100);
      const category = getString(req.query.category, 80);
      const brand = getString(req.query.brand, 120);
      const sort = getString(req.query.sort, 32);
      const inStock = req.query.in_stock === 'true';
      const pageValue = Number(req.query.page ?? 1);
      const limitValue = Number(req.query.limit ?? 20);
      const page = Number.isInteger(pageValue) && pageValue > 0 ? Math.min(pageValue, 10_000) : 1;
      const limit = Number.isInteger(limitValue) && limitValue > 0 ? Math.min(limitValue, 48) : 20;
      const minPrice = req.query.min_price === undefined ? undefined : Number(req.query.min_price);
      const maxPrice = req.query.max_price === undefined ? undefined : Number(req.query.max_price);
      const rating = req.query.rating === undefined ? undefined : Number(req.query.rating);
      if ((minPrice !== undefined && (!Number.isFinite(minPrice) || minPrice < 0)) ||
          (maxPrice !== undefined && (!Number.isFinite(maxPrice) || maxPrice < 0)) ||
          (minPrice !== undefined && maxPrice !== undefined && minPrice > maxPrice) ||
          (rating !== undefined && (!Number.isFinite(rating) || rating < 0 || rating > 5))) {
        return res.status(400).json({ error: 'Invalid search filters', code: 'BAD_REQUEST', status: 400 });
      }
      
      let whereClause: any = { isActive: true };
      
      const searchTerms = q ? expandCatalogSearchTerms(q) : [];
      if (searchTerms.length) {
        whereClause.OR = searchTerms.flatMap((term) => [
          { name: { contains: term, mode: 'insensitive' } },
          { brand: { contains: term, mode: 'insensitive' } },
          { description: { contains: term, mode: 'insensitive' } },
          { category: { is: { OR: [{ slug: { contains: term, mode: 'insensitive' } }, { name: { contains: term, mode: 'insensitive' } }] } } },
          { specs: { some: { OR: [{ key: { contains: term, mode: 'insensitive' } }, { value: { contains: term, mode: 'insensitive' } }] } } },
        ]);
      }
      if (category) whereClause.category = { slug: category };
      if (brand) whereClause.brand = { equals: brand, mode: 'insensitive' };
      if (minPrice !== undefined || maxPrice !== undefined) {
        whereClause.price = {};
        if (minPrice !== undefined) whereClause.price.gte = minPrice;
        if (maxPrice !== undefined) whereClause.price.lte = maxPrice;
      }
      if (inStock) {
        whereClause.stock = { gt: 0 };
      }
      if (rating !== undefined) {
        whereClause.rating = { gte: rating };
      }
      
      let orderByClause: any = { createdAt: 'desc' };
      if (sort === 'price_asc') orderByClause = { price: 'asc' };
      if (sort === 'price_desc') orderByClause = { price: 'desc' };
      if (sort === 'rating') orderByClause = { rating: 'desc' };
      
      const skip = (page - 1) * limit;
      
      const cacheKey = `products:search:v3:${JSON.stringify({ q, category, brand, minPrice, maxPrice, sort, inStock, rating, page, limit })}`;
      const { total, products, facets } = await cacheQuery(cacheKey, 20_000, async () => {
        const hostedSearch = q ? await searchOpenSearch(q, { category, brand, minPrice, maxPrice, rating, inStock }, page, limit) : null;
        if (hostedSearch) {
          const records = await prisma.product.findMany({
            where: { id: { in: hostedSearch.ids }, isActive: true },
            select: {
              id: true, slug: true, name: true, brand: true, sellerName: true, description: true, price: true, mrp: true,
              rating: true, reviewCount: true, stock: true,
              images: { select: { url: true }, orderBy: { sortOrder: 'asc' }, take: 1 },
              category: { select: { id: true, slug: true, name: true } },
              specs: { select: { key: true, value: true }, orderBy: { key: 'asc' }, take: 20 },
            },
          });
          const byId = new Map(records.map((record) => [record.id, record]));
          const ordered = hostedSearch.ids.map((id) => byId.get(id)).filter(Boolean).map((product: any) => ({
            ...product,
            relevance: hostedSearch.scores.get(product.id) || 0,
          }));
          const aggs: any = hostedSearch.facets || {};
          const buckets = (name: string) => (aggs[name]?.buckets || []).map((bucket: any) => ({ value: bucket.key, label: bucket.key, count: bucket.doc_count }));
          return {
            total: hostedSearch.total,
            products: ordered,
            facets: {
              categories: buckets('categories'),
              brands: buckets('brands'),
              product_types: buckets('product_types'),
              price_xlm: aggs.price_xlm ? { min: aggs.price_xlm.min, max: aggs.price_xlm.max } : null,
            },
          };
        }
        const findArgs: any = {
          where: whereClause,
          orderBy: orderByClause,
          select: {
            id: true,
            slug: true,
            name: true,
            brand: true,
            sellerName: true,
            description: true,
            price: true,
            mrp: true,
            rating: true,
            reviewCount: true,
            stock: true,
            images: { select: { url: true }, orderBy: { sortOrder: 'asc' }, take: 1 },
            category: { select: { id: true, slug: true, name: true } },
            specs: { select: { key: true, value: true }, orderBy: { key: 'asc' }, take: 20 },
          },
        };
        if (q) findArgs.take = 1_000;
        else Object.assign(findArgs, { skip, take: limit });
        const [candidateTotal, retrieved] = await Promise.all([
          prisma.product.count({ where: whereClause }),
          prisma.product.findMany(findArgs) as Promise<any[]>,
        ]);
        const candidates = retrieved.map((product) => ({
          ...product,
          categorySlug: product.category?.slug || null,
          categoryName: product.category?.name || null,
        }));
        const matches = q ? rankCatalogMatches(candidates, q) : [];
        const ordered = q ? [...matches].sort((left, right) => {
          if (sort === 'price_asc') return Number(left.product.price) - Number(right.product.price) || right.relevance - left.relevance;
          if (sort === 'price_desc') return Number(right.product.price) - Number(left.product.price) || right.relevance - left.relevance;
          if (sort === 'rating') return Number(right.product.rating || 0) - Number(left.product.rating || 0) || right.relevance - left.relevance;
          return right.relevance - left.relevance || Number(right.product.rating || 0) - Number(left.product.rating || 0);
        }) : [];
        const matchedProducts = q ? ordered.slice(skip, skip + limit).map((match) => ({ ...match.product, relevance: match.relevance })) : candidates;
        return {
          total: q ? ordered.length : candidateTotal,
          products: matchedProducts,
          facets: buildCatalogFacets(q ? ordered.map((match) => match.product) : candidates),
        };
      });
      
      const issuer = getIssuer(req);
      const formattedProducts = products.map((p) => {
        const discovery = toAgentCatalogProduct({
          ...p,
          categorySlug: p.category.slug,
          categoryName: p.category.name,
          imageUrl: p.images[0]?.url || null,
        }, issuer);
        return {
          id: p.id,
          slug: p.slug,
          name: p.name,
          title: p.name,
          brand: p.brand,
          seller: p.sellerName,
          description: discovery.description,
          price: p.price,
          price_xlm: Number(p.price).toFixed(7),
          price_stroops: String(Math.round(p.price * 10_000_000)),
          mrp: p.mrp,
          discount_percent: Math.round(((p.mrp - p.price) / p.mrp) * 100),
          currency: 'XLM',
          rating: p.rating,
          review_count: p.reviewCount,
          stock: p.stock,
          availability: p.stock > 0 ? 'in_stock' : 'out_of_stock',
          category: p.category.slug,
          category_name: p.category.name,
          category_detail: p.category,
          product_type: discovery.product_type,
          taxonomy_path: discovery.taxonomy_path,
          tags: discovery.tags,
          search_aliases: discovery.search_aliases,
          attributes: discovery.attributes,
          specifications: p.specs,
          image_url: p.images[0]?.url || null,
          url: discovery.url,
          product_url: discovery.url,
          canonical_url: discovery.url,
          ...(q ? { relevance: p.relevance } : {}),
        };
      });
      
      setPublicCache(res, 20, 60);
      res.json({
        products: formattedProducts,
        pagination: { total, page, limit, pages: Math.ceil(total / limit) },
        facets,
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal Server Error', code: 'INTERNAL_ERROR', status: 500 });
    }
  };

  app.get(['/api/products', '/api/products/search', '/api/search'], publicSearchHandler);

  app.get('/api/search/suggest', async (req, res) => {
    try {
      const q = getString(req.query.q, 200);
      const limit = publicLimit(req.query.limit, 8, 10);
      if (!q || q.trim().length < 2) return res.json({ suggestions: [] });
      const hostedSuggestions = await suggestOpenSearch(q, limit);
      if (hostedSuggestions) {
        setPublicCache(res, 20, 60);
        return res.json({ suggestions: hostedSuggestions.map((product) => ({
          label: product.name, product_id: product.id, slug: product.slug, brand: product.brand || null,
          product_type: product.product_type || null, category: product.category_name || null,
          url: `${getIssuer(req)}/product/${encodeURIComponent(product.slug)}`,
        })) });
      }
      const products = await prisma.product.findMany({
        where: { isActive: true, stock: { gt: 0 }, OR: expandCatalogSearchTerms(q).flatMap((term) => [
          { name: { contains: term, mode: 'insensitive' } }, { brand: { contains: term, mode: 'insensitive' } },
        ]) },
        select: { id: true, slug: true, name: true, brand: true, description: true, category: { select: { slug: true, name: true } }, specs: { select: { key: true, value: true }, take: 20 } },
        take: 100,
      });
      const suggestions = rankCatalogMatches(products.map((product) => ({ ...product, categorySlug: product.category.slug, categoryName: product.category.name })), q)
        .slice(0, limit).map(({ product }) => ({
          label: product.name, product_id: product.id, slug: product.slug, brand: product.brand,
          category: product.category.name, url: `${getIssuer(req)}/product/${encodeURIComponent(product.slug)}`,
        }));
      setPublicCache(res, 20, 60);
      res.json({ suggestions });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'INTERNAL_ERROR' });
    }
  });

  app.get('/api/products/batch', async (req, res) => {
    try {
      const idsStr = req.query.ids;
      if (!idsStr) {
        return res.json([]);
      }
      const ids = [...new Set(String(idsStr).split(',').map((id) => id.trim()).filter(Boolean))];
      if (ids.length > 50) return res.status(400).json({ error: 'A maximum of 50 product IDs is allowed', code: 'BAD_REQUEST', status: 400 });
      const products = await cacheQuery(`products:batch:${ids.slice().sort().join(',')}`, 30_000, () => prisma.product.findMany({
        where: { id: { in: ids }, isActive: true },
        select: {
          id: true,
          slug: true,
          name: true,
          brand: true,
          price: true,
          mrp: true,
          stock: true,
          images: { select: { id: true, url: true }, orderBy: { sortOrder: 'asc' }, take: 1 },
        },
      }));
      const formatted = products.map(product => ({
        ...product,
        url: `${getIssuer(req)}/product/${encodeURIComponent(product.slug)}`,
        discount_percent: Math.round(((product.mrp - product.price) / product.mrp) * 100),
        estimated_delivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString()
      }));
      setPublicCache(res, 30, 90);
      res.json(formatted);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal Server Error', code: 'INTERNAL_ERROR', status: 500 });
    }
  });

  app.get('/api/products/:id', async (req, res) => {
    try {
      const identifier = getString(req.params.id, 160);
      const product = await cacheQuery(`product:${identifier}`, 60_000, () => prisma.product.findFirst({
        where: { isActive: true, OR: [{ id: identifier }, { slug: identifier }] },
        select: {
          id: true,
          slug: true,
          categoryId: true,
          name: true,
          brand: true,
          description: true,
          mrp: true,
          price: true,
          stock: true,
          rating: true,
          reviewCount: true,
          sellerName: true,
          createdAt: true,
          images: { select: { id: true, url: true }, orderBy: { sortOrder: 'asc' } },
          specs: { select: { id: true, key: true, value: true } },
          category: { select: { id: true, name: true, slug: true } },
        },
      }));
      
      if (!product) return res.status(404).json({ error: 'Product not found', code: 'NOT_FOUND', status: 404 });
      
      setPublicCache(res, 30, 120);
      res.json(serializePublicProduct({
        ...product,
        categorySlug: product.category?.slug || null,
        categoryName: product.category?.name || null,
        imageUrl: product.images[0]?.url || null,
      }, getIssuer(req)));
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal Server Error', code: 'INTERNAL_ERROR', status: 500 });
    }
  });

  app.get('/api/products/:id/reviews', async (req, res) => {
    try {
      const limitValue = Number(req.query.limit ?? 20);
      const limit = Number.isInteger(limitValue) && limitValue > 0 ? Math.min(limitValue, 50) : 20;
      const identifier = getString(req.params.id, 160);
      const product = await prisma.product.findFirst({ where: { isActive: true, OR: [{ id: identifier }, { slug: identifier }] }, select: { id: true } });
      if (!product) return res.status(404).json({ error: 'Product not found', code: 'NOT_FOUND', status: 404 });
      const reviews = await prisma.review.findMany({
        where: { productId: product.id },
        select: {
          id: true,
          rating: true,
          title: true,
          body: true,
          verifiedPurchase: true,
          createdAt: true,
          user: { select: { name: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
      });
      
      res.json(reviews.map(r => ({
        id: r.id,
        reviewer: r.user.name,
        rating: r.rating,
        title: r.title,
        body: r.body,
        verified: r.verifiedPurchase,
        date: r.createdAt
      })));
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal Server Error', code: 'INTERNAL_ERROR', status: 500 });
    }
  });

  app.post('/api/products/:id/reviews', authenticateToken, requireScopesWhenOAuth('profile'), writeRateLimit, async (req: any, res: any) => {
    try {
      const rating = Number(req.body?.rating);
      const title = getString(req.body?.title, 140);
      const body = getString(req.body?.body, 2_000);
      if (!Number.isInteger(rating) || rating < 1 || rating > 5 || !title || !body) {
        return res.status(400).json({ error: 'Invalid review fields', code: 'BAD_REQUEST', status: 400 });
      }

      const productIdentifier = getString(req.params.id, 160);
      const review = await prisma.$transaction(async (tx) => {
        const product = await tx.product.findFirst({ where: { isActive: true, OR: [{ id: productIdentifier }, { slug: productIdentifier }] }, select: { id: true, slug: true } });
        if (!product) throw new Error('PRODUCT_NOT_FOUND');
        const hasPurchased = await tx.orderItem.findFirst({
          where: { productId: product.id, order: { userId: req.user.userId, status: 'Delivered' } },
          select: { id: true },
        });
        const review = await tx.review.create({
          data: { productId: product.id, userId: req.user.userId, rating, title, body, verifiedPurchase: Boolean(hasPurchased) },
          include: { user: { select: { name: true } } },
        });
        const stats = await tx.review.aggregate({ where: { productId: product.id }, _avg: { rating: true }, _count: { _all: true } });
        await tx.product.update({
          where: { id: product.id },
          data: { rating: stats._avg.rating || 0, reviewCount: stats._count._all },
        });
        return { review, product };
      });

      invalidateCache(`product:${review.product.id}`);
      invalidateCache(`product:${review.product.slug}`);
      invalidateCache('products:search:');

      res.json({
        id: review.review.id,
        reviewer: review.review.user.name,
        rating: review.review.rating,
        title: review.review.title,
        body: review.review.body,
        verified: review.review.verifiedPurchase,
        date: review.review.createdAt
      });
    } catch (err) {
      if (err instanceof Error && err.message === 'PRODUCT_NOT_FOUND') return res.status(404).json({ error: 'Product not found', code: 'NOT_FOUND', status: 404 });
      console.error(err);
      res.status(500).json({ error: 'Internal Server Error', code: 'INTERNAL_ERROR', status: 500 });
    }
  });

  // Permanent, crawler-friendly product documents. The React storefront takes
  // over after load, while crawlers and AI systems receive complete product
  // content, canonical metadata and Product JSON-LD without scraping a JS shell.
  app.get('/product/:identifier', async (req, res) => {
    try {
      const identifier = getString(req.params.identifier, 160);
      if (!identifier) return res.status(404).send('Product not found');
      const product = await cacheQuery(`seo-product:${identifier}`, 60_000, () => prisma.product.findFirst({
        where: { isActive: true, OR: [{ id: identifier }, { slug: identifier }] },
        select: publicProductSelect,
      }));
      if (!product) return res.status(404).send('Product not found');
      const issuer = getIssuer(req);
      const publicProduct = toPublicProduct(product, issuer);
      if (identifier !== product.slug) return res.redirect(301, publicProduct.canonical_url);

      const distTemplate = path.join(process.cwd(), 'dist', 'index.html');
      const sourceTemplate = fs.existsSync(distTemplate)
        ? fs.readFileSync(distTemplate, 'utf8')
        : fs.readFileSync(path.join(process.cwd(), 'index.html'), 'utf8');
      const fallback = productHtmlFallback(publicProduct);
      const withContent = sourceTemplate.replace('<div id="root"></div>', `<div id="root">${fallback}</div>`);
      const document = renderProductMeta(withContent, publicProduct, issuer);
      res.set('Cache-Control', 'public, max-age=60, s-maxage=300, stale-while-revalidate=900');
      res.type('html').send(document);
    } catch (err) {
      console.error(err);
      res.status(500).send('Unable to load product');
    }
  });

  // --- Authenticated Cart Endpoints ---
  const getActiveCart = async (userId: string) => {
    const existing = await prisma.cart.findFirst({ where: { userId, status: 'ACTIVE' }, select: { id: true } });
    if (existing) return existing;
    try {
      return await prisma.cart.create({ data: { userId, status: 'ACTIVE' }, select: { id: true } });
    } catch (error: any) {
      // The partial unique index in the production migration can legitimately
      // win a concurrent create race; read the cart it protected instead.
      if (error?.code === 'P2002') {
        const concurrent = await prisma.cart.findFirst({ where: { userId, status: 'ACTIVE' }, select: { id: true } });
        if (concurrent) return concurrent;
      }
      throw error;
    }
  };
  app.get('/api/cart', authenticateToken, requireScopesWhenOAuth('cart:read'), async (req: any, res: any) => {
    try {
      const userId = req.user.userId;
      const activeCart = await getActiveCart(userId);
      const cart = await prisma.cart.findUnique({
        where: { id: activeCart.id },
        select: {
          id: true,
          status: true,
          createdAt: true,
          updatedAt: true,
          items: {
            select: {
              id: true,
              productId: true,
              quantity: true,
              product: {
                select: {
                  id: true,
                  name: true,
                  brand: true,
                  price: true,
                  mrp: true,
                  stock: true,
                  images: { select: { url: true }, take: 1, orderBy: { sortOrder: 'asc' } },
                },
              }
            }
          }
        }
      });
      res.json(cart);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal Server Error', code: 'INTERNAL_ERROR', status: 500 });
    }
  });

  app.post('/api/cart/add', authenticateToken, requireScopesWhenOAuth('cart:write'), writeRateLimit, async (req: any, res: any) => {
    try {
      const userId = req.user.userId;
      const productId = getString(req.body?.product_id, 64);
      const quantity = Number(req.body?.quantity);
      if (!productId || !Number.isInteger(quantity) || quantity < 1 || quantity > 20) return res.status(400).json({ error: 'Invalid cart item', code: 'BAD_REQUEST', status: 400 });

      const cart = await getActiveCart(userId);
      await prisma.$transaction(async (tx) => {
        const [product, existingItem] = await Promise.all([
          tx.product.findFirst({ where: { id: productId, isActive: true }, select: { stock: true } }),
          tx.cartItem.findUnique({ where: { cartId_productId: { cartId: cart.id, productId } }, select: { id: true, quantity: true } }),
        ]);
        if (!product) throw new Error('PRODUCT_NOT_FOUND');
        const nextQuantity = (existingItem?.quantity || 0) + quantity;
        if (nextQuantity > product.stock) throw new Error('INSUFFICIENT_STOCK');
        if (existingItem) {
          await tx.cartItem.update({ where: { id: existingItem.id }, data: { quantity: nextQuantity } });
        } else {
          await tx.cartItem.create({ data: { cartId: cart.id, productId, quantity } });
        }
      });
      
      res.json({ success: true });
    } catch (err) {
      if (err instanceof Error && err.message === 'PRODUCT_NOT_FOUND') return res.status(404).json({ error: 'Product not found', code: 'NOT_FOUND', status: 404 });
      if (err instanceof Error && err.message === 'INSUFFICIENT_STOCK') return res.status(409).json({ error: 'Requested quantity is unavailable', code: 'INSUFFICIENT_STOCK', status: 409 });
      console.error(err);
      res.status(500).json({ error: 'Internal Server Error', code: 'INTERNAL_ERROR', status: 500 });
    }
  });

  app.put('/api/cart/:item_id', authenticateToken, requireScopesWhenOAuth('cart:write'), writeRateLimit, async (req: any, res: any) => {
    try {
      const userId = req.user.userId;
      const quantity = Number(req.body?.quantity);
      if (!Number.isInteger(quantity) || quantity < 1 || quantity > 99) return res.status(400).json({ error: 'Invalid quantity', code: 'BAD_REQUEST', status: 400 });
      const cartItem = await prisma.cartItem.findFirst({
        where: {
          id: req.params.item_id,
          cart: { userId, status: 'ACTIVE' }
        },
        select: { id: true, product: { select: { stock: true } } },
      });

      if (!cartItem) {
        return res.status(404).json({ error: 'Cart item not found', code: 'NOT_FOUND', status: 404 });
      }

      if (quantity > cartItem.product.stock) return res.status(409).json({ error: 'Requested quantity is unavailable', code: 'INSUFFICIENT_STOCK', status: 409 });
      await prisma.cartItem.update({
        where: { id: cartItem.id },
        data: { quantity }
      });
      res.json({ success: true });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal Server Error', code: 'INTERNAL_ERROR', status: 500 });
    }
  });

  app.delete('/api/cart/:item_id', authenticateToken, requireScopesWhenOAuth('cart:write'), writeRateLimit, async (req: any, res: any) => {
    try {
      const userId = req.user.userId;
      const result = await prisma.cartItem.deleteMany({ where: { id: req.params.item_id, cart: { userId, status: 'ACTIVE' } } });
      if (result.count === 0) {
        return res.status(404).json({ error: 'Cart item not found', code: 'NOT_FOUND', status: 404 });
      }
      res.json({ success: true });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal Server Error', code: 'INTERNAL_ERROR', status: 500 });
    }
  });

  
  // --- Authenticated Wishlist Endpoints ---
  app.get('/api/wishlist', authenticateToken, requireScopesWhenOAuth('profile'), async (req: any, res: any) => {
    try {
      const wishlist = await prisma.wishlist.findMany({
        where: { userId: req.user.userId },
        select: {
          productId: true,
          product: {
            select: {
              id: true,
              name: true,
              price: true,
              mrp: true,
              images: { select: { url: true }, take: 1, orderBy: { sortOrder: 'asc' } },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });
      res.json(wishlist);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal Server Error', code: 'INTERNAL_ERROR', status: 500 });
    }
  });

  app.post('/api/wishlist/:product_id', authenticateToken, requireScopesWhenOAuth('profile'), writeRateLimit, async (req: any, res: any) => {
    try {
      const productId = getString(req.params.product_id, 64);
      const product = await prisma.product.findFirst({ where: { id: productId, isActive: true }, select: { id: true } });
      if (!product) return res.status(404).json({ error: 'Product not found', code: 'NOT_FOUND', status: 404 });
      await prisma.wishlist.upsert({
        where: { userId_productId: { userId: req.user.userId, productId } },
        create: { userId: req.user.userId, productId },
        update: {},
      });
      res.json({ success: true });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal Server Error', code: 'INTERNAL_ERROR', status: 500 });
    }
  });

  app.delete('/api/wishlist/:product_id', authenticateToken, requireScopesWhenOAuth('profile'), writeRateLimit, async (req: any, res: any) => {
    try {
      await prisma.wishlist.deleteMany({ where: { userId: req.user.userId, productId: getString(req.params.product_id, 64) } });
      res.json({ success: true });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal Server Error', code: 'INTERNAL_ERROR', status: 500 });
    }
  });

  // --- Authenticated Logout Endpoint ---
  app.post('/api/auth/logout', (req: any, res: any) => {
    res.clearCookie('tm_session', { httpOnly: true, sameSite: 'lax', secure: isProduction, path: '/' });
    res.json({ success: true });
  });

  // --- Authenticated Checkout & Orders Endpoints ---
  app.post('/api/checkout', authenticateToken, requireScopesWhenOAuth('checkout:confirm'), writeRateLimit, async (req: any, res: any) => {
    try {
      const userId = req.user.userId;
      const address = getString(req.body?.address, 500);
      const paymentMethod = getString(req.body?.payment_method, 160) || 'Card';
      if (!address) return res.status(400).json({ error: 'A delivery address is required', code: 'BAD_REQUEST', status: 400 });

      const cartForCheckout = await prisma.cart.findFirst({
        where: { userId, status: 'ACTIVE' },
        select: { id: true, items: { select: { productId: true, quantity: true } } },
      });
      const rawItems = cartForCheckout?.items.length ? cartForCheckout.items : Array.isArray(req.body?.items) ? req.body.items : [];
      if (!rawItems.length || rawItems.length > 50) return res.status(400).json({ error: 'Cart is empty or invalid', code: 'EMPTY_CART', status: 400 });

      const quantities = new Map<string, number>();
      for (const item of rawItems) {
        const productId = getString(item?.productId || item?.id, 64);
        const quantity = Number(item?.quantity);
        if (!productId || !Number.isInteger(quantity) || quantity < 1 || quantity > 99) {
          return res.status(400).json({ error: 'Cart contains an invalid item', code: 'BAD_REQUEST', status: 400 });
        }
        const nextQuantity = (quantities.get(productId) || 0) + quantity;
        if (nextQuantity > 99) return res.status(400).json({ error: 'Cart quantity exceeds the allowed maximum', code: 'BAD_REQUEST', status: 400 });
        quantities.set(productId, nextQuantity);
      }

      const productIds = [...quantities.keys()];
      const products = await prisma.product.findMany({
        where: { id: { in: productIds }, isActive: true },
        select: { id: true, price: true, stock: true },
      });
      if (products.length !== productIds.length) return res.status(400).json({ error: 'One or more products are unavailable', code: 'PRODUCT_UNAVAILABLE', status: 400 });
      const productMap = new Map(products.map((product) => [product.id, product]));
      const orderItems = productIds.map((productId) => {
        const product = productMap.get(productId)!;
        const quantity = quantities.get(productId)!;
        if (product.stock < quantity) throw new Error('INSUFFICIENT_STOCK');
        return { productId, quantity, priceAtPurchase: product.price };
      });
      const roundAmount = (value: number) => Math.round((value + Number.EPSILON) * 10_000_000) / 10_000_000;
      const subtotal = roundAmount(orderItems.reduce((sum, item) => sum + item.priceAtPurchase * item.quantity, 0));
      const total = roundAmount(subtotal + (subtotal > 499 ? 0 : 50));

      let stellarTxHash: string | undefined;
      const stellarMatch = /^Stellar Wallet \(Tx: ([a-fA-F0-9]{64}|sim_tx_[A-Za-z0-9_-]{1,80})\)$/.exec(paymentMethod);
      if (paymentMethod.startsWith('Stellar Wallet') && !stellarMatch) {
        return res.status(400).json({ error: 'Invalid Stellar transaction reference', code: 'INVALID_TRANSACTION', status: 400 });
      }
      if (stellarMatch) {
        stellarTxHash = stellarMatch[1];
        if (stellarTxHash.startsWith('sim_tx_')) {
          if (isProduction) return res.status(400).json({ error: 'Simulated payments are disabled in production', code: 'INVALID_TRANSACTION', status: 400 });
        } else {
          const expectedStroops = Math.round(total * 10_000_000);
          const validPayment = await verifyStellarTestnetPayment(stellarTxHash, expectedStroops);
          if (!validPayment) return res.status(400).json({ error: 'The Stellar payment does not match this order', code: 'INVALID_TRANSACTION_PAYMENT', status: 400 });
        }
      }

      const order = await prisma.$transaction(async (tx) => {
        let userAddress = await tx.address.findFirst({ where: { userId }, select: { id: true } });
        if (!userAddress) {
          userAddress = await tx.address.create({
            data: { userId, fullName: 'User', phone: '0000000000', line1: address, city: 'Unknown', state: 'Unknown', pincode: '000000', isDefault: true },
            select: { id: true },
          });
        }
        for (const item of orderItems) {
          const updated = await tx.product.updateMany({
            where: { id: item.productId, isActive: true, stock: { gte: item.quantity } },
            data: { stock: { decrement: item.quantity } },
          });
          if (updated.count !== 1) throw new Error('INSUFFICIENT_STOCK');
        }
        const cart = cartForCheckout
          ? await tx.cart.update({ where: { id: cartForCheckout.id }, data: { status: 'ORDERED' }, select: { id: true } })
          : await tx.cart.create({ data: { userId, status: 'ORDERED' }, select: { id: true } });
        return tx.order.create({
          data: {
            userId,
            cartId: cart.id,
            addressId: userAddress.id,
            total,
            status: 'Processing',
            paymentMethod,
            ...(stellarTxHash ? { stellarTxHash } : {}),
            items: { create: orderItems },
          } as any,
          select: { id: true },
        });
      });
      invalidateCache('product:');
      invalidateCache('products:search:');
      invalidateCache('products:batch:');
      res.status(201).json({ success: true, order_id: order.id });
    } catch (err: any) {
      if (err instanceof PaymentVerificationUnavailableError) {
        res.set('Retry-After', String(err.retryAfterSeconds));
        return res.status(503).json({ error: 'Payment verification is temporarily unavailable. Please retry shortly.', code: 'PAYMENT_VERIFICATION_UNAVAILABLE', status: 503 });
      }
      if (err?.message === 'INSUFFICIENT_STOCK') return res.status(409).json({ error: 'One or more products no longer have enough stock', code: 'INSUFFICIENT_STOCK', status: 409 });
      if (err?.code === 'P2002' && err?.meta?.target?.includes('stellarTxHash')) return res.status(409).json({ error: 'This Stellar payment has already been used', code: 'PAYMENT_ALREADY_USED', status: 409 });
      console.error(err);
      res.status(500).json({ error: 'Internal Server Error', code: 'INTERNAL_ERROR', status: 500 });
    }
  });

  app.get('/api/orders', authenticateToken, requireScopesWhenOAuth('orders:read'), async (req: any, res: any) => {
    try {
      const requestedLimit = Number(req.query.limit ?? 20);
      const limit = Number.isInteger(requestedLimit) && requestedLimit > 0 ? Math.min(requestedLimit, 50) : 20;
      const orders = await prisma.order.findMany({
        where: { userId: req.user.userId },
        select: {
          id: true,
          createdAt: true,
          status: true,
          total: true,
          items: {
            select: {
              id: true,
              quantity: true,
              priceAtPurchase: true,
              product: {
                select: {
                  id: true,
                  name: true,
                  brand: true,
                  images: { select: { url: true }, take: 1, orderBy: { sortOrder: 'asc' } },
                },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
      });
      res.json(orders);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal Server Error', code: 'INTERNAL_ERROR', status: 500 });
    }
  });

  app.get('/api/orders/:id', authenticateToken, requireScopesWhenOAuth('orders:read'), async (req: any, res: any) => {
    try {
      const order = await prisma.order.findFirst({
        where: { id: req.params.id, userId: req.user.userId },
        select: {
          id: true,
          createdAt: true,
          updatedAt: true,
          status: true,
          total: true,
          paymentMethod: true,
          items: {
            select: {
              id: true,
              quantity: true,
              priceAtPurchase: true,
              product: {
                select: {
                  id: true,
                  name: true,
                  brand: true,
                  images: { select: { url: true }, take: 1, orderBy: { sortOrder: 'asc' } },
                },
              },
            },
          },
          address: { select: { fullName: true, phone: true, line1: true, line2: true, city: true, state: true, pincode: true } },
        },
      });
      if (!order) {
        return res.status(404).json({ error: 'Order not found', code: 'NOT_FOUND', status: 404 });
      }
      res.json(order);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal Server Error', code: 'INTERNAL_ERROR', status: 500 });
    }
  });

  // --- Scoped agent-commerce API ---
  const quoteAgentCheckout = async (rawItems: unknown) => {
    if (!Array.isArray(rawItems) || !rawItems.length || rawItems.length > 50) throw new Error('EMPTY_CART');
    const quantities = new Map<string, number>();
    for (const item of rawItems) {
      const productId = getString((item as any)?.product_id || (item as any)?.productId || (item as any)?.id, 64);
      const quantity = Number((item as any)?.quantity);
      if (!productId || !Number.isInteger(quantity) || quantity < 1 || quantity > 99) throw new Error('BAD_REQUEST');
      const next = (quantities.get(productId) || 0) + quantity;
      if (next > 99) throw new Error('BAD_REQUEST');
      quantities.set(productId, next);
    }
    const ids = [...quantities.keys()];
    const products = await prisma.product.findMany({ where: { id: { in: ids }, isActive: true }, select: { id: true, name: true, price: true, stock: true } });
    if (products.length !== ids.length) throw new Error('PRODUCT_UNAVAILABLE');
    const byId = new Map(products.map((product) => [product.id, product]));
    const items = ids.map((productId) => {
      const product = byId.get(productId)!;
      const quantity = quantities.get(productId)!;
      if (product.stock < quantity) throw new Error('INSUFFICIENT_STOCK');
      return { productId, name: product.name, quantity, priceAtPurchase: product.price };
    });
    const roundAmount = (value: number) => Math.round((value + Number.EPSILON) * 10_000_000) / 10_000_000;
    const subtotal = roundAmount(items.reduce((sum, item) => sum + item.priceAtPurchase * item.quantity, 0));
    const shipping = subtotal > 499 ? 0 : 50;
    return { items, subtotal, shipping, total: roundAmount(subtotal + shipping) };
  };

  app.get('/api/agent/commerce/v1/products/search', async (req, res) => {
    try {
      const q = getString(req.query.q, 100);
      const category = getString(req.query.category, 80);
      const brand = getString(req.query.brand, 120);
      const inStock = req.query.in_stock !== 'false';
      const minPriceValue = req.query.min_price_xlm ?? req.query.minPrice;
      const maxPriceValue = req.query.max_price_xlm ?? req.query.maxPrice;
      const minPrice = Number(minPriceValue);
      const maxPrice = Number(maxPriceValue);
      const limitValue = Number(req.query.limit ?? 20);
      const limit = Number.isInteger(limitValue) && limitValue > 0 ? Math.min(limitValue, 48) : 20;
      const offsetValue = Number(req.query.offset ?? 0);
      const offset = Number.isInteger(offsetValue) && offsetValue >= 0 ? Math.min(offsetValue, 10_000) : 0;
      const sort = getString(req.query.sort, 32) || (q ? 'relevance' : 'newest');
      if ((minPriceValue !== undefined && (!Number.isFinite(minPrice) || minPrice < 0))
        || (maxPriceValue !== undefined && (!Number.isFinite(maxPrice) || maxPrice < 0))
        || (Number.isFinite(minPrice) && Number.isFinite(maxPrice) && minPrice > maxPrice)) {
        return res.status(400).json({ error: 'INVALID_PRICE_FILTER' });
      }
      const where: any = { isActive: true };
      if (inStock) where.stock = { gt: 0 };
      if (category) where.category = { is: { OR: [{ slug: { equals: category, mode: 'insensitive' } }, { name: { equals: category, mode: 'insensitive' } }] } };
      if (brand) where.brand = { equals: brand, mode: 'insensitive' };
      if (Number.isFinite(minPrice) || Number.isFinite(maxPrice)) {
        where.price = {};
        if (Number.isFinite(minPrice) && minPrice >= 0) where.price.gte = minPrice;
        if (Number.isFinite(maxPrice) && maxPrice >= 0) where.price.lte = maxPrice;
      }
      const searchTerms = q ? expandCatalogSearchTerms(q) : [];
      if (searchTerms.length) {
        // SQL narrows the catalogue using merchant taxonomy aliases first;
        // the deterministic scorer below then rejects zero-relevance rows.
        where.OR = searchTerms.flatMap((term) => [
          { name: { contains: term, mode: 'insensitive' } },
          { brand: { contains: term, mode: 'insensitive' } },
          { description: { contains: term, mode: 'insensitive' } },
          { category: { is: { OR: [{ slug: { contains: term, mode: 'insensitive' } }, { name: { contains: term, mode: 'insensitive' } }] } } },
          { specs: { some: { OR: [{ key: { contains: term, mode: 'insensitive' } }, { value: { contains: term, mode: 'insensitive' } }] } } },
        ]);
      }
      const select = {
        id: true, slug: true, name: true, brand: true, sellerName: true, description: true, price: true, mrp: true, stock: true, rating: true, reviewCount: true, createdAt: true,
        category: { select: { slug: true, name: true } },
        specs: { select: { key: true, value: true }, orderBy: { key: 'asc' as const }, take: 20 },
        images: { select: { url: true }, take: 1, orderBy: { sortOrder: 'asc' as const } },
      };
      const orderBy = sort === 'price_asc' ? [{ price: 'asc' as const }, { id: 'asc' as const }]
        : sort === 'price_desc' ? [{ price: 'desc' as const }, { id: 'asc' as const }]
          : sort === 'rating_desc' ? [{ rating: 'desc' as const }, { id: 'asc' as const }]
            : [{ createdAt: 'desc' as const }, { id: 'asc' as const }];
      const findArgs: any = { where, orderBy, select };
      const candidateCap = 1_000;
      if (q) findArgs.take = candidateCap;
      else Object.assign(findArgs, { skip: offset, take: limit });
      const [candidateTotal, retrieved] = await Promise.all([
        prisma.product.count({ where }),
        prisma.product.findMany(findArgs) as Promise<any[]>,
      ]);
      const candidates = retrieved.map((product) => ({
        ...product,
        categorySlug: product.category?.slug || null,
        categoryName: product.category?.name || null,
        imageUrl: product.images[0]?.url || null,
      }));
      const matches = q ? rankCatalogMatches(candidates, q) : [];
      const orderedMatches = q ? [...matches].sort((left, right) => {
        if (sort === 'price_asc') return Number(left.product.price) - Number(right.product.price) || right.relevance - left.relevance;
        if (sort === 'price_desc') return Number(right.product.price) - Number(left.product.price) || right.relevance - left.relevance;
        if (sort === 'rating_desc') return Number(right.product.rating || 0) - Number(left.product.rating || 0) || right.relevance - left.relevance;
        return right.relevance - left.relevance || Number(right.product.rating || 0) - Number(left.product.rating || 0)
          || String(left.product.id).localeCompare(String(right.product.id));
      }) : [];
      const pageEntries = q
        ? orderedMatches.slice(offset, offset + limit)
        : candidates.map((product) => ({ product, relevance: null }));
      const total = q ? orderedMatches.length : candidateTotal;
      const candidateCapReached = Boolean(q && candidateTotal > retrieved.length);
      const pageProducts = pageEntries.map((entry) => toAgentCatalogProduct(entry.product, getIssuer(req)));
      setPublicCache(res, 20, 60);
      res.json({
        products: pageProducts.map((product, index) => q ? { ...product, relevance: pageEntries[index].relevance } : product),
        pagination: {
          offset,
          limit,
          total,
          next_offset: offset + pageEntries.length < total || candidateCapReached ? offset + pageEntries.length : null,
        },
        search: q ? {
          query: q,
          mode: 'taxonomy_aware_lexical',
          query_terms: searchTerms,
          candidate_total: candidateTotal,
          candidate_cap_reached: candidateCapReached,
        } : { mode: 'catalog_browse' },
        // Facets describe the complete matched set for a query. On a plain
        // browse they describe the returned page, keeping the endpoint fast.
        facets: buildCatalogFacets((q ? orderedMatches.map((match) => match.product) : candidates)),
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'INTERNAL_ERROR' });
    }
  });

  app.get('/api/agent/commerce/v1/products/:productId', async (req, res) => {
    try {
      const productId = getString(req.params.productId, 64);
      const product = await prisma.product.findFirst({
        where: { id: productId, isActive: true, stock: { gt: 0 } },
        select: {
          id: true, slug: true, name: true, brand: true, sellerName: true, description: true, price: true, stock: true, rating: true, reviewCount: true,
          category: { select: { slug: true, name: true } },
          specs: { select: { key: true, value: true }, orderBy: { key: 'asc' }, take: 50 },
          images: { select: { url: true }, take: 1, orderBy: { sortOrder: 'asc' } },
        },
      });
      if (!product) return res.status(404).json({ error: 'PRODUCT_NOT_FOUND' });
      return res.json(toAgentCatalogProduct({
        ...product,
        categorySlug: product.category?.slug || null,
        categoryName: product.category?.name || null,
        imageUrl: product.images[0]?.url || null,
      }, getIssuer(req)));
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: 'INTERNAL_ERROR' });
    }
  });

  app.get('/api/agent/commerce/v1/me', authenticateToken, requireOAuthScopes('profile'), async (req: any, res) => {
    const user = await prisma.user.findUnique({ where: { id: req.user.userId }, select: { id: true, name: true, email: true, phone: true } });
    if (!user) return res.status(404).json({ error: 'NOT_FOUND' });
    return res.json(publicUser(user));
  });

  app.post('/api/agent/commerce/v1/checkout/prepare', authenticateToken, requireOAuthScopes('checkout:prepare'), writeRateLimit, async (req: any, res) => {
    try {
      const deliveryAddress = getString(req.body?.delivery_address, 500);
      if (!deliveryAddress) return res.status(400).json({ error: 'A delivery_address is required', code: 'BAD_REQUEST' });
      const quote = await quoteAgentCheckout(req.body?.items);
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
      const intent = await (prisma as any).agentCheckoutIntent.create({
        data: { clientId: req.user.clientId, userId: req.user.userId, items: JSON.stringify(quote.items.map(({ name, ...item }) => item)), deliveryAddress, total: quote.total, expiresAt },
        select: { id: true },
      });
      return res.status(201).json({ checkout_id: intent.id, currency: 'XLM', amount_xlm: quote.total.toFixed(7), merchant_stellar_address: TESTNET_MERCHANT_STELLAR_ADDRESS, network: 'testnet', items: quote.items, subtotal_xlm: quote.subtotal, shipping_xlm: quote.shipping, expires_at: expiresAt.toISOString(), payment_methods: ['Stellar Wallet'] });
    } catch (err: any) {
      const status = err?.message === 'INSUFFICIENT_STOCK' ? 409 : 400;
      const code = ['EMPTY_CART', 'BAD_REQUEST', 'PRODUCT_UNAVAILABLE', 'INSUFFICIENT_STOCK'].includes(err?.message) ? err.message : 'INTERNAL_ERROR';
      if (code === 'INTERNAL_ERROR') console.error(err);
      return res.status(status === 400 ? 400 : status).json({ error: code, code });
    }
  });

  app.post('/api/agent/commerce/v1/checkout/confirm', authenticateToken, requireOAuthScopes('checkout:confirm'), writeRateLimit, async (req: any, res) => {
    try {
      const checkoutId = getString(req.body?.checkout_id, 64);
      const paymentMethod = getString(req.body?.payment_method, 160);
      const intent = await (prisma as any).agentCheckoutIntent.findFirst({ where: { id: checkoutId, clientId: req.user.clientId, userId: req.user.userId }, select: { id: true, items: true, deliveryAddress: true, total: true, expiresAt: true, confirmedAt: true } });
      if (!intent || intent.confirmedAt) return res.status(400).json({ error: 'Checkout intent is invalid or has already been confirmed', code: 'INVALID_CHECKOUT' });
      let stellarTxHash: string | undefined;
      const stellarMatch = /^Stellar Wallet \(Tx: ([a-fA-F0-9]{64}|sim_tx_[A-Za-z0-9_-]{1,80})\)$/.exec(paymentMethod);
      if (!stellarMatch) return res.status(400).json({ error: 'A Stellar testnet transaction reference is required', code: 'INVALID_TRANSACTION' });
      if (stellarMatch) {
        stellarTxHash = stellarMatch[1];
        if (stellarTxHash.startsWith('sim_tx_')) {
          const eligibility = validateCheckoutConfirmation(intent, { isSimulatedPayment: true });
          if (!eligibility.ok) return res.status(400).json({ error: 'Checkout intent is expired', code: eligibility.code });
          if (isProduction) return res.status(400).json({ error: 'Simulated payments are disabled in production', code: 'INVALID_TRANSACTION' });
        } else {
          const expectedStroops = Math.round(intent.total * 10_000_000);
          const validPayment = await verifyStellarTestnetPayment(stellarTxHash, expectedStroops);
          if (!validPayment) return res.status(400).json({ error: 'The Stellar payment does not match this order', code: 'INVALID_TRANSACTION_PAYMENT' });
        }
      }
      const items = JSON.parse(intent.items) as Array<{ productId: string; quantity: number; priceAtPurchase: number }>;
      const order = await prisma.$transaction(async (tx) => {
        // A real Stellar payment was independently verified above. A delayed
        // callback must settle that paid reservation exactly once, even if its
        // normal checkout window elapsed while the payment was finalizing.
        const claimed = await (tx as any).agentCheckoutIntent.updateMany({ where: { id: intent.id, confirmedAt: null }, data: { confirmedAt: new Date() } });
        assertCheckoutClaimed(claimed.count);
        let userAddress = await tx.address.findFirst({ where: { userId: req.user.userId }, select: { id: true } });
        if (!userAddress) userAddress = await tx.address.create({ data: { userId: req.user.userId, fullName: 'User', phone: '0000000000', line1: intent.deliveryAddress, city: 'Unknown', state: 'Unknown', pincode: '000000', isDefault: true }, select: { id: true } });
        for (const item of items) {
          const updated = await tx.product.updateMany({ where: { id: item.productId, isActive: true, stock: { gte: item.quantity } }, data: { stock: { decrement: item.quantity } } });
          if (updated.count !== 1) throw new Error('INSUFFICIENT_STOCK');
        }
        const cart = await tx.cart.create({ data: { userId: req.user.userId, status: 'ORDERED' }, select: { id: true } });
        return tx.order.create({ data: { userId: req.user.userId, cartId: cart.id, addressId: userAddress.id, total: intent.total, status: 'Processing', paymentMethod, ...(stellarTxHash ? { stellarTxHash } : {}), items: { create: items } } as any, select: { id: true, total: true, status: true } });
      });
      invalidateCache('product:');
      invalidateCache('products:search:');
      invalidateCache('products:batch:');
      return res.status(201).json({ order_id: order.id, total_xlm: Number(order.total).toFixed(7), total_stroops: String(Math.round(order.total * 10_000_000)), currency: 'XLM', status: order.status });
    } catch (err: any) {
      if (err instanceof PaymentVerificationUnavailableError) {
        res.set('Retry-After', String(err.retryAfterSeconds));
        return res.status(503).json({ error: 'Payment verification is temporarily unavailable. Please retry shortly.', code: 'PAYMENT_VERIFICATION_UNAVAILABLE' });
      }
      if (err?.message === 'INSUFFICIENT_STOCK') return res.status(409).json({ error: 'One or more products no longer have enough stock', code: 'INSUFFICIENT_STOCK' });
      if (err?.message === 'INVALID_CHECKOUT') return res.status(409).json({ error: 'Checkout intent has already been confirmed or expired', code: 'INVALID_CHECKOUT' });
      if (err?.code === 'P2002' && err?.meta?.target?.includes('stellarTxHash')) return res.status(409).json({ error: 'This Stellar payment has already been used', code: 'PAYMENT_ALREADY_USED' });
      console.error(err);
      return res.status(500).json({ error: 'Internal Server Error', code: 'INTERNAL_ERROR' });
    }
  });

  app.get('/api/agent/commerce/v1/orders', authenticateToken, requireOAuthScopes('orders:read'), async (req: any, res) => {
    const limitValue = Number(req.query.limit ?? 20);
    const limit = Number.isInteger(limitValue) && limitValue > 0 ? Math.min(limitValue, 50) : 20;
    const orders = await prisma.order.findMany({ where: { userId: req.user.userId }, orderBy: { createdAt: 'desc' }, take: limit, select: { id: true, createdAt: true, status: true, total: true, items: { select: { productId: true, quantity: true, priceAtPurchase: true } } } });
    return res.json({ orders: orders.map((order) => ({ order_id: order.id, created_at: order.createdAt, status: order.status, total_xlm: Number(order.total).toFixed(7), total_stroops: String(Math.round(order.total * 10_000_000)), currency: 'XLM', items: order.items.map((item) => ({ product_id: item.productId, quantity: item.quantity, unit_price_xlm: Number(item.priceAtPurchase).toFixed(7), unit_price_stroops: String(Math.round(item.priceAtPurchase * 10_000_000)) })) })) });
  });

  // Vite middleware for development (skip in Vercel/Serverless env)
  async function setupViteOrListen() {
    if (process.env.NODE_ENV !== "production" && !process.env.VERCEL) {
      const { createServer: createViteServer } = await import('vite');
      const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: "spa",
      });
      app.use(vite.middlewares);
    } else {
      const distPath = path.join(process.cwd(), 'dist');
      app.use('/assets', express.static(path.join(distPath, 'assets'), { immutable: true, maxAge: '1y' }));
      app.use(express.static(distPath, { index: false, maxAge: '1h' }));
      app.get('*', (req, res) => {
        res.set('Cache-Control', 'no-cache');
        res.sendFile(path.join(distPath, 'index.html'));
      });
    }

    if (!process.env.VERCEL) {
      app.listen(PORT, "0.0.0.0", () => {
        console.log(`Server running on http://localhost:${PORT}`);
      });
    }
  }

  void setupViteOrListen().catch((error) => {
    console.error('Failed to initialize server', error);
    if (!process.env.VERCEL) process.exit(1);
  });

  export default app;
