-- PostgreSQL/Supabase indexes for the application query paths. Run through
-- `prisma migrate deploy`; do not paste these into the dashboard one-by-one.
CREATE EXTENSION IF NOT EXISTS pg_trgm;

ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "stellarTxHash" TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS "Order_stellarTxHash_key" ON "Order"("stellarTxHash");

CREATE INDEX IF NOT EXISTS "Address_userId_idx" ON "Address"("userId");
CREATE INDEX IF NOT EXISTS "Product_categoryId_isActive_createdAt_idx" ON "Product"("categoryId", "isActive", "createdAt" DESC);
CREATE INDEX IF NOT EXISTS "Product_isActive_price_idx" ON "Product"("isActive", "price");
CREATE INDEX IF NOT EXISTS "Product_isActive_rating_idx" ON "Product"("isActive", "rating" DESC);
CREATE INDEX IF NOT EXISTS "Product_isActive_stock_idx" ON "Product"("isActive", "stock");
CREATE INDEX IF NOT EXISTS "Product_name_trgm_idx" ON "Product" USING GIN ("name" gin_trgm_ops);
CREATE INDEX IF NOT EXISTS "Product_description_trgm_idx" ON "Product" USING GIN ("description" gin_trgm_ops);
CREATE INDEX IF NOT EXISTS "ProductImage_productId_sortOrder_idx" ON "ProductImage"("productId", "sortOrder");
CREATE INDEX IF NOT EXISTS "ProductSpec_productId_idx" ON "ProductSpec"("productId");
CREATE INDEX IF NOT EXISTS "Cart_userId_status_idx" ON "Cart"("userId", "status");
CREATE INDEX IF NOT EXISTS "CartItem_productId_idx" ON "CartItem"("productId");
CREATE INDEX IF NOT EXISTS "Order_userId_createdAt_idx" ON "Order"("userId", "createdAt" DESC);
CREATE INDEX IF NOT EXISTS "Order_cartId_idx" ON "Order"("cartId");
CREATE INDEX IF NOT EXISTS "Order_addressId_idx" ON "Order"("addressId");
CREATE INDEX IF NOT EXISTS "OrderItem_productId_orderId_idx" ON "OrderItem"("productId", "orderId");
CREATE INDEX IF NOT EXISTS "Review_productId_createdAt_idx" ON "Review"("productId", "createdAt" DESC);
CREATE INDEX IF NOT EXISTS "Review_userId_idx" ON "Review"("userId");
CREATE INDEX IF NOT EXISTS "Wishlist_productId_idx" ON "Wishlist"("productId");
CREATE INDEX IF NOT EXISTS "OAuthAuthCode_expiresAt_idx" ON "OAuthAuthCode"("expiresAt");
CREATE INDEX IF NOT EXISTS "OAuthAuthCode_clientId_userId_idx" ON "OAuthAuthCode"("clientId", "userId");

-- This protects the get-or-create cart path from duplicate ACTIVE carts.
-- Check for existing duplicates before deploying this migration:
-- SELECT "userId", count(*) FROM "Cart" WHERE status = 'ACTIVE' GROUP BY 1 HAVING count(*) > 1;
CREATE UNIQUE INDEX IF NOT EXISTS "Cart_one_active_per_user"
  ON "Cart"("userId")
  WHERE status = 'ACTIVE' AND "userId" IS NOT NULL;
