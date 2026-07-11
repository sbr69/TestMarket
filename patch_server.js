import fs from 'fs';
let code = fs.readFileSync('server.ts', 'utf8');

const route = `
// List all orders (mock for agent test)
app.get('/api/orders', async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        items: {
          include: {
            product: true
          }
        }
      },
      take: 20
    });
    res.json(orders);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});
`;

code = code.replace('// Auth Routes (Placeholder for now)', route + '\n// Auth Routes (Placeholder for now)');
fs.writeFileSync('server.ts', code);
