import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function run() {
  try {
    const products = await prisma.product.findMany({
      where: {
        OR: [
          { name: { contains: "a" } },
          { description: { contains: "a" } }
        ]
      }
    });
    console.log(products);
  } catch(e) {
    console.error(e);
  }
}
run();
