const fs = require('fs');

let code = fs.readFileSync('server.ts', 'utf8');

// Fix error shapes
code = code.replace(/res\.status\((\d+)\)\.json\(\{\s*error:\s*(.*?),?\s*code:\s*(.*?)\s*\}\)/g, "res.status($1).json({ error: $2, code: $3, status: $1 })");

// Fix /api/products/search to return category.slug
code = code.replace(/category: p\.categoryId,/g, "category: p.category.slug,");
// Also we need to make sure we include category in the search query
code = code.replace(/include: { images: { orderBy: { sortOrder: 'asc' }, take: 1 } }/g, "include: { images: { orderBy: { sortOrder: 'asc' }, take: 1 }, category: true }");

// Fix /api/products/:id to return seller_name
code = code.replace(/discount_percent: Math\.round\(\(\(product\.mrp - product\.price\) \/ product\.mrp\) \* 100\),/g, "discount_percent: Math.round(((product.mrp - product.price) / product.mrp) * 100),\n        seller_name: product.sellerName,");

// Fix /api/checkout to not use req.body.items
code = code.replace(
  `const { address, payment_method, items } = req.body;`,
  `const { address, payment_method } = req.body;\n      \n      const cartForCheckout = await prisma.cart.findFirst({\n        where: { userId, status: 'ACTIVE' },\n        include: { items: { include: { product: true } } }\n      });\n      const items = cartForCheckout?.items || [];`
);

code = code.replace(
  `const productIds = items.map((i: any) => i.id);`,
  `const productIds = items.map((i: any) => i.productId);`
);

code = code.replace(
  `const p = productMap[item.id];`,
  `const p = productMap[item.productId];`
);

// Add Wishlist and Logout endpoints
const wishlistAndLogoutEndpoints = `
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
`;

code = code.replace(
  `// --- Authenticated Checkout & Orders Endpoints ---`,
  wishlistAndLogoutEndpoints + `\n  // --- Authenticated Checkout & Orders Endpoints ---`
);

fs.writeFileSync('server.ts', code, 'utf8');
console.log('Successfully patched server.ts');
