import fs from 'fs';
let code = fs.readFileSync('prisma/seed.ts', 'utf8');

code = code.replace("name: 'Wireless Noise-Canceling Headphones',", "name: 'Wireless Noise-Canceling Headphones',\n      imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80',");
code = code.replace("name: 'Mechanical Keyboard',", "name: 'Mechanical Keyboard',\n      imageUrl: 'https://images.unsplash.com/photo-1595225476474-87563907a212?w=800&q=80',");
code = code.replace("name: 'Premium Basmati Rice 5kg',", "name: 'Premium Basmati Rice 5kg',\n      imageUrl: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=800&q=80',");
code = code.replace("name: 'Organic Honey 500g',", "name: 'Organic Honey 500g',\n      imageUrl: 'https://images.unsplash.com/photo-1587049352847-4d45548ce4fb?w=800&q=80',");

fs.writeFileSync('prisma/seed.ts', code);
