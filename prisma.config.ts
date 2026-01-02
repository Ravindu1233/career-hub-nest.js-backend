import 'dotenv/config'; // Load environment variables
import { defineConfig, env } from 'prisma/config';

export default defineConfig({
  schema: 'prisma/schema.prisma', // Path to your Prisma schema
  migrations: {
    path: 'prisma/migrations', // Migration path
  },
  datasource: {
    url: env('DATABASE_URL'), // This is now in the config file
  },
});
