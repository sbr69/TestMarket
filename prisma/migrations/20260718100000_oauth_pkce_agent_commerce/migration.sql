-- OAuth 2.0 Authorization Code + PKCE, rotating refresh tokens and agent checkout intents.
ALTER TABLE "OAuthClient"
  ADD COLUMN IF NOT EXISTS "clientSecretHash" TEXT,
  ADD COLUMN IF NOT EXISTS "tokenEndpointAuthMethod" TEXT NOT NULL DEFAULT 'client_secret_post',
  ADD COLUMN IF NOT EXISTS "allowedScopes" TEXT NOT NULL DEFAULT 'profile cart:read cart:write checkout:prepare checkout:confirm orders:read',
  ADD COLUMN IF NOT EXISTS "isDynamic" BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE "OAuthAuthCode"
  ADD COLUMN IF NOT EXISTS "scope" TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS "codeChallenge" TEXT,
  ADD COLUMN IF NOT EXISTS "codeChallengeMethod" TEXT,
  ADD COLUMN IF NOT EXISTS "usedAt" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

CREATE TABLE IF NOT EXISTS "OAuthRefreshToken" (
  "id" TEXT NOT NULL,
  "tokenHash" TEXT NOT NULL,
  "clientId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "scope" TEXT NOT NULL,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "usedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "OAuthRefreshToken_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "OAuthRefreshToken_tokenHash_key" ON "OAuthRefreshToken"("tokenHash");
CREATE INDEX IF NOT EXISTS "OAuthRefreshToken_clientId_userId_expiresAt_idx" ON "OAuthRefreshToken"("clientId", "userId", "expiresAt");
ALTER TABLE "OAuthRefreshToken" ADD CONSTRAINT "OAuthRefreshToken_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE TABLE IF NOT EXISTS "OAuthAccessToken" (
  "id" TEXT NOT NULL,
  "jti" TEXT NOT NULL,
  "clientId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "scope" TEXT NOT NULL,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "revokedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "OAuthAccessToken_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "OAuthAccessToken_jti_key" ON "OAuthAccessToken"("jti");
CREATE INDEX IF NOT EXISTS "OAuthAccessToken_clientId_userId_expiresAt_idx" ON "OAuthAccessToken"("clientId", "userId", "expiresAt");
ALTER TABLE "OAuthAccessToken" ADD CONSTRAINT "OAuthAccessToken_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE TABLE IF NOT EXISTS "AgentCheckoutIntent" (
  "id" TEXT NOT NULL,
  "clientId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "items" TEXT NOT NULL,
  "deliveryAddress" TEXT NOT NULL,
  "total" DOUBLE PRECISION NOT NULL,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "confirmedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "AgentCheckoutIntent_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "AgentCheckoutIntent_clientId_userId_expiresAt_idx" ON "AgentCheckoutIntent"("clientId", "userId", "expiresAt");
ALTER TABLE "AgentCheckoutIntent" ADD CONSTRAINT "AgentCheckoutIntent_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
