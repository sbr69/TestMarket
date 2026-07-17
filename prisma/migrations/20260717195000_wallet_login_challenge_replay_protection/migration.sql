CREATE TABLE "WalletLoginChallenge" (
    "id" TEXT NOT NULL,
    "publicKey" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "WalletLoginChallenge_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "WalletLoginChallenge_expiresAt_idx" ON "WalletLoginChallenge"("expiresAt");
