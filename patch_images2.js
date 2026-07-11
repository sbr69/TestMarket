import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  await prisma.product.updateMany({
    where: { name: 'Wireless Noise-Canceling Headphones' },
    data: { imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80' }
  });
  await prisma.product.updateMany({
    where: { name: 'Mechanical Keyboard' },
    data: { imageUrl: 'https://images.unsplash.com/photo-1595225476474-87563907a212?w=800&q=80' }
  });
  await prisma.product.updateMany({
    where: { name: 'Premium Basmati Rice 5kg' },
    data: { imageUrl: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=800&q=80' }
  });
  await prisma.product.updateMany({
    where: { name: 'Organic Honey 500g' },
    data: { imageUrl: 'https://images.unsplash.com/photo-1587049352847-4d45548ce4fb?w=800&q=80' }
  });
  console.log('Images patched!');
}
main().catch(console.error).finally(() => prisma.$disconnect());
