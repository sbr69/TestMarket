import { defineConfig } from 'prisma/config';
import * as dotenv from 'dotenv';

dotenv.config();
dotenv.config({ path: '.env.local', override: true });

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    seed: 'tsx prisma/seed.ts',
  },
});
