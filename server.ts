import 'dotenv/config';
import express from 'express';
import crypto from 'crypto';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import swaggerUi from 'swagger-ui-express';
import fs from 'fs';
import { OAuth2Client } from 'google-auth-library';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || crypto.randomBytes(32).toString('hex');
const swaggerDocument = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'swagger.json'), 'utf8'));
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // --- Swagger API Docs ---
  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

  // --- Auth Middleware ---
  const authenticateToken = (req: any, res: any, next: any) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.status(401).json({ error: 'Unauthorized', code: 'UNAUTHORIZED', status: 401 });

    jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
      if (err) return res.status(403).json({ error: 'Forbidden', code: 'FORBIDDEN', status: 403 });
      req.user = user;
      next();
    });
  };

  // --- Public Auth Endpoints ---
  app.post('/api/auth/google', async (req, res) => {
    try {
      const { credential } = req.body;
      const ticket = await googleClient.verifyIdToken({
        idToken: credential,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
      const payload = ticket.getPayload();
      
      if (!payload || !payload.email) {
        return res.status(400).json({ error: 'Invalid Google token' });
      }

      const { email, name } = payload;

      let user = await prisma.user.findUnique({ where: { email } });
      if (!user) {
        // Create user with random password since they authenticate via Google
        const randomPassword = crypto.randomBytes(16).toString('hex');
        const passwordHash = await bcrypt.hash(randomPassword, 10);
        user = await prisma.user.create({
          data: { name: name || 'Google User', email, passwordHash }
        });
      }

      const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });
      res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  app.post('/api/auth/register', async (req, res) => {
    try {
      const { name, email, password } = req.body;
      const existingUser = await prisma.user.findUnique({ where: { email } });
      if (existingUser) {
        return res.status(400).json({ error: 'User already exists', code: 'USER_EXISTS', status: 400 });
      }
      
      const passwordHash = await bcrypt.hash(password, 10);
      const user = await prisma.user.create({
        data: { name, email, passwordHash }
      });
      
      const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });
      res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal Server Error', code: 'INTERNAL_ERROR', status: 500 });
    }
  });

  app.post('/api/auth/login', async (req, res) => {
    try {
      const { email, password } = req.body;
      const user = await prisma.user.findUnique({ where: { email } });
      if (!user) return res.status(400).json({ error: 'Invalid credentials', code: 'INVALID_CREDENTIALS', status: 400 });
      
      const valid = await bcrypt.compare(password, user.passwordHash);
      if (!valid) return res.status(400).json({ error: 'Invalid credentials', code: 'INVALID_CREDENTIALS', status: 400 });
      
      const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });
      res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal Server Error', code: 'INTERNAL_ERROR', status: 500 });
    }
  });

  app.get('/api/auth/me', authenticateToken, async (req: any, res: any) => {
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

  // --- OAuth 2.0 Provider Endpoints ---
  app.get('/api/oauth/client', async (req, res) => {
    try {
      const { client_id } = req.query;
      const client = await (prisma as any).oAuthClient.findUnique({ where: { clientId: String(client_id) } });
      if (!client) return res.status(404).json({ error: 'Client not found', code: 'NOT_FOUND', status: 404 });
      res.json({ name: client.name, redirect_uris: client.redirectUris });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  app.post('/api/oauth/authorize', authenticateToken, async (req: any, res: any) => {
    try {
      const { client_id, redirect_uri } = req.body;
      const client = await (prisma as any).oAuthClient.findUnique({ where: { clientId: client_id } });
      if (!client) return res.status(404).json({ error: 'Client not found' });
      
      const allowedUris = client.redirectUris.split(',');
      if (!allowedUris.includes(redirect_uri)) {
        return res.status(400).json({ error: 'Invalid redirect URI' });
      }

      const code = crypto.randomBytes(16).toString('hex');
      const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 mins expiry

      await (prisma as any).oAuthAuthCode.create({
        data: {
          code,
          clientId: client_id,
          userId: req.user.userId,
          redirectUri: redirect_uri,
          expiresAt
        }
      });

      res.json({ code });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  app.post('/api/oauth/token', async (req, res) => {
    try {
      const { grant_type, code, client_id, client_secret } = req.body;
      if (grant_type !== 'authorization_code') {
        return res.status(400).json({ error: 'Unsupported grant type' });
      }

      const client = await (prisma as any).oAuthClient.findUnique({ where: { clientId: client_id } });
      if (!client || client.clientSecret !== client_secret) {
        return res.status(401).json({ error: 'Invalid client credentials' });
      }

      const authCode = await (prisma as any).oAuthAuthCode.findUnique({ where: { code } });
      if (!authCode || authCode.clientId !== client_id || authCode.expiresAt < new Date()) {
        return res.status(400).json({ error: 'Invalid or expired code' });
      }

      // Delete code so it can't be reused
      await (prisma as any).oAuthAuthCode.delete({ where: { id: authCode.id } });

      // Generate Access Token (JWT)
      const token = jwt.sign(
        { userId: authCode.userId, clientId: client_id, isOAuth: true }, 
        JWT_SECRET, 
        { expiresIn: '30d' }
      );

      res.json({
        access_token: token,
        token_type: 'bearer',
        expires_in: 30 * 24 * 60 * 60
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  // --- Public Product Endpoints ---
  app.get('/api/categories', async (req, res) => {
    try {
      const categories = await prisma.category.findMany();
      res.json(categories);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal Server Error', code: 'INTERNAL_ERROR', status: 500 });
    }
  });

  app.get('/api/products/search', async (req, res) => {
    try {
      const { q, category, min_price, max_price, sort, in_stock, page = 1, limit = 20 } = req.query;
      
      let whereClause: any = { isActive: true };
      
      if (q) {
        whereClause.OR = [
          { name: { contains: String(q), mode: 'insensitive' } },
          { description: { contains: String(q), mode: 'insensitive' } }
        ];
      }
      if (category) whereClause.category = { slug: String(category) };
      if (min_price || max_price) {
        whereClause.price = {};
        if (min_price) whereClause.price.gte = parseFloat(String(min_price));
        if (max_price) whereClause.price.lte = parseFloat(String(max_price));
      }
      if (in_stock === 'true') {
        whereClause.stock = { gt: 0 };
      }
      const rating = req.query.rating;
      if (rating) {
        whereClause.rating = { gte: parseFloat(String(rating)) };
      }
      
      let orderByClause: any = { createdAt: 'desc' };
      if (sort === 'price_asc') orderByClause = { price: 'asc' };
      if (sort === 'price_desc') orderByClause = { price: 'desc' };
      if (sort === 'rating') orderByClause = { rating: 'desc' };
      
      const skip = (Number(page) - 1) * Number(limit);
      
      const [total, products] = await Promise.all([
        prisma.product.count({ where: whereClause }),
        prisma.product.findMany({
          where: whereClause,
          orderBy: orderByClause,
          skip,
          take: Number(limit),
          include: { images: { orderBy: { sortOrder: 'asc' }, take: 1 }, category: true }
        })
      ]);
      
      const formattedProducts = products.map(p => ({
        id: p.id,
        name: p.name,
        brand: p.brand,
        price: p.price,
        mrp: p.mrp,
        discount_percent: Math.round(((p.mrp - p.price) / p.mrp) * 100),
        rating: p.rating,
        review_count: p.reviewCount,
        stock: p.stock,
        category: p.category.slug, // Ideally we want slug, but this is fine
        image_url: p.images[0]?.url || null
      }));
      
      res.json({
        products: formattedProducts,
        pagination: { total, page: Number(page), limit: Number(limit), pages: Math.ceil(total / Number(limit)) }
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal Server Error', code: 'INTERNAL_ERROR', status: 500 });
    }
  });

  app.get('/api/products/:id', async (req, res) => {
    try {
      const product = await prisma.product.findUnique({
        where: { id: req.params.id },
        include: {
          images: { orderBy: { sortOrder: 'asc' } },
          specs: true,
          category: true
        }
      });
      
      if (!product) return res.status(404).json({ error: 'Product not found', code: 'NOT_FOUND', status: 404 });
      
      res.json({
        ...product,
        discount_percent: Math.round(((product.mrp - product.price) / product.mrp) * 100),
        seller_name: (product as any).sellerName,
        estimated_delivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString()
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal Server Error', code: 'INTERNAL_ERROR', status: 500 });
    }
  });

  app.get('/api/products/:id/reviews', async (req, res) => {
    try {
      const reviews = await prisma.review.findMany({
        where: { productId: req.params.id },
        include: { user: { select: { name: true } } },
        orderBy: { createdAt: 'desc' }
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

  app.post('/api/products/:id/reviews', authenticateToken, async (req: any, res: any) => {
    try {
      const { rating, title, body } = req.body;
      if (!rating || !title || !body) {
        return res.status(400).json({ error: 'Missing review fields', code: 'BAD_REQUEST', status: 400 });
      }

      // Check if user has purchased the product
      const hasPurchased = await prisma.orderItem.findFirst({
        where: {
          productId: req.params.id,
          order: { userId: req.user.userId, status: 'Delivered' }
        }
      });

      const review = await prisma.review.create({
        data: {
          productId: req.params.id,
          userId: req.user.userId,
          rating: Number(rating),
          title: String(title),
          body: String(body),
          verifiedPurchase: !!hasPurchased
        },
        include: { user: { select: { name: true } } }
      });

      // Update product rating and reviewCount
      const allReviews = await prisma.review.findMany({ where: { productId: req.params.id } });
      const newRating = allReviews.reduce((acc, r) => acc + r.rating, 0) / allReviews.length;
      await prisma.product.update({
        where: { id: req.params.id },
        data: { rating: newRating, reviewCount: allReviews.length }
      });

      res.json({
        id: review.id,
        reviewer: review.user.name,
        rating: review.rating,
        title: review.title,
        body: review.body,
        verified: review.verifiedPurchase,
        date: review.createdAt
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal Server Error', code: 'INTERNAL_ERROR', status: 500 });
    }
  });

  // --- Authenticated Cart Endpoints ---
  app.get('/api/cart', authenticateToken, async (req: any, res: any) => {
    try {
      const userId = req.user.userId;
      let cart = await prisma.cart.findFirst({
        where: { userId, status: 'ACTIVE' },
        include: {
          items: {
            include: {
              product: {
                include: { images: { take: 1, orderBy: { sortOrder: 'asc' } } }
              }
            }
          }
        }
      });
      
      if (!cart) {
        cart = await prisma.cart.create({
          data: { userId, status: 'ACTIVE' },
          include: { items: { include: { product: { include: { images: true } } } } }
        });
      }
      
      res.json(cart);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal Server Error', code: 'INTERNAL_ERROR', status: 500 });
    }
  });

  app.post('/api/cart/add', authenticateToken, async (req: any, res: any) => {
    try {
      const userId = req.user.userId;
      const { product_id, quantity } = req.body;
      
      let cart = await prisma.cart.findFirst({ where: { userId, status: 'ACTIVE' } });
      if (!cart) cart = await prisma.cart.create({ data: { userId, status: 'ACTIVE' } });
      
      const existingItem = await prisma.cartItem.findUnique({
        where: { cartId_productId: { cartId: cart.id, productId: product_id } }
      });
      
      if (existingItem) {
        await prisma.cartItem.update({
          where: { id: existingItem.id },
          data: { quantity: existingItem.quantity + Number(quantity) }
        });
      } else {
        await prisma.cartItem.create({
          data: { cartId: cart.id, productId: product_id, quantity: Number(quantity) }
        });
      }
      
      res.json({ success: true });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal Server Error', code: 'INTERNAL_ERROR', status: 500 });
    }
  });

  app.put('/api/cart/:item_id', authenticateToken, async (req: any, res: any) => {
    try {
      const userId = req.user.userId;
      const { quantity } = req.body;
      const cartItem = await prisma.cartItem.findFirst({
        where: {
          id: req.params.item_id,
          cart: { userId, status: 'ACTIVE' }
        }
      });

      if (!cartItem) {
        return res.status(404).json({ error: 'Cart item not found', code: 'NOT_FOUND', status: 404 });
      }

      await prisma.cartItem.update({
        where: { id: cartItem.id },
        data: { quantity: Number(quantity) }
      });
      res.json({ success: true });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal Server Error', code: 'INTERNAL_ERROR', status: 500 });
    }
  });

  app.delete('/api/cart/:item_id', authenticateToken, async (req: any, res: any) => {
    try {
      const userId = req.user.userId;
      const cartItem = await prisma.cartItem.findFirst({
        where: {
          id: req.params.item_id,
          cart: { userId, status: 'ACTIVE' }
        }
      });

      if (!cartItem) {
        return res.status(404).json({ error: 'Cart item not found', code: 'NOT_FOUND', status: 404 });
      }

      await prisma.cartItem.delete({
        where: { id: cartItem.id }
      });
      res.json({ success: true });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal Server Error', code: 'INTERNAL_ERROR', status: 500 });
    }
  });

  
  // --- Authenticated Wishlist Endpoints ---
  app.get('/api/wishlist', authenticateToken, async (req: any, res: any) => {
    try {
      const wishlist = await prisma.wishlist.findMany({
        where: { userId: req.user.userId },
        include: { product: { include: { images: { take: 1, orderBy: { sortOrder: 'asc' } } } } }
      });
      res.json(wishlist);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal Server Error', code: 'INTERNAL_ERROR', status: 500 });
    }
  });

  app.post('/api/wishlist/:product_id', authenticateToken, async (req: any, res: any) => {
    try {
      const existing = await prisma.wishlist.findUnique({
        where: { userId_productId: { userId: req.user.userId, productId: req.params.product_id } }
      });
      if (!existing) {
        await prisma.wishlist.create({
          data: { userId: req.user.userId, productId: req.params.product_id }
        });
      }
      res.json({ success: true });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal Server Error', code: 'INTERNAL_ERROR', status: 500 });
    }
  });

  app.delete('/api/wishlist/:product_id', authenticateToken, async (req: any, res: any) => {
    try {
      await prisma.wishlist.delete({
        where: { userId_productId: { userId: req.user.userId, productId: req.params.product_id } }
      });
      res.json({ success: true });
    } catch (err) {
      // It might not exist, which is fine for delete, but let's catch Prisma errors just in case
      res.json({ success: true });
    }
  });

  // --- Authenticated Logout Endpoint ---
  app.post('/api/auth/logout', authenticateToken, (req: any, res: any) => {
    // With stateless JWTs, logout is just client-side token deletion. 
    res.json({ success: true });
  });

  // --- Authenticated Checkout & Orders Endpoints ---
  app.post('/api/checkout', authenticateToken, async (req: any, res: any) => {
    try {
      const userId = req.user.userId;
      const { address, payment_method } = req.body;
      
      const cartForCheckout = await prisma.cart.findFirst({
        where: { userId, status: 'ACTIVE' },
        include: { items: { include: { product: true } } }
      });
      const items = cartForCheckout?.items || [];
      
      if (!items || items.length === 0) {
        return res.status(400).json({ error: 'Cart is empty', code: 'EMPTY_CART', status: 400 });
      }
      
      // Calculate total from db products
      const productIds = items.map((i: any) => i.productId);
      const products = await prisma.product.findMany({
        where: { id: { in: productIds } }
      });
      const productMap = products.reduce((acc: any, p: any) => ({ ...acc, [p.id]: p }), {});

      let subtotal = 0;
      const orderItems = [];
      for (const item of items) {
        const p = productMap[item.productId];
        if (p) {
          subtotal += p.price * item.quantity;
          orderItems.push({
            productId: p.id,
            quantity: item.quantity,
            priceAtPurchase: p.price
          });
        }
      }

      const shipping = subtotal > 499 ? 0 : 50;
      const total = subtotal + shipping;
      
      // Get or create dummy address
      let userAddress = await prisma.address.findFirst({ where: { userId } });
      if (!userAddress) {
        userAddress = await prisma.address.create({
          data: {
            userId,
            fullName: 'User',
            phone: '0000000000',
            line1: address,
            city: 'Unknown',
            state: 'Unknown',
            pincode: '000000',
            isDefault: true
          }
        });
      }
      
      const cart = await prisma.cart.create({
        data: { userId, status: 'ORDERED' }
      });

      // Create Order
      const order = await prisma.order.create({
        data: {
          userId,
          cartId: cart.id,
          addressId: userAddress.id,
          total,
          status: 'Processing',
          paymentMethod: payment_method || 'Card',
          items: {
            create: orderItems
          }
        }
      });
      
      res.json({ success: true, order_id: order.id });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal Server Error', code: 'INTERNAL_ERROR', status: 500 });
    }
  });

  app.get('/api/orders', authenticateToken, async (req: any, res: any) => {
    try {
      const orders = await prisma.order.findMany({
        where: { userId: req.user.userId },
        include: {
          items: {
            include: { product: { include: { images: { take: 1, orderBy: { sortOrder: 'asc' } } } } }
          }
        },
        orderBy: { createdAt: 'desc' }
      });
      res.json(orders);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal Server Error', code: 'INTERNAL_ERROR', status: 500 });
    }
  });

  app.get('/api/orders/:id', authenticateToken, async (req: any, res: any) => {
    try {
      const order = await prisma.order.findUnique({
        where: { id: req.params.id },
        include: {
          items: {
            include: { product: { include: { images: { take: 1, orderBy: { sortOrder: 'asc' } } } } }
          },
          address: true
        }
      });
      if (!order || order.userId !== req.user.userId) {
        return res.status(404).json({ error: 'Order not found', code: 'NOT_FOUND', status: 404 });
      }
      res.json(order);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal Server Error', code: 'INTERNAL_ERROR', status: 500 });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
