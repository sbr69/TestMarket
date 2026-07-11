import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient({ log: ['query', 'info', 'warn', 'error'] });
async function main() {
  const users = await prisma.user.findMany();
  console.log('Users:', users);
}
main().catch(console.error).finally(() => prisma.$disconnect());
