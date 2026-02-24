import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  constructor() {
    const url = process.env.DATABASE_URL;

    if (!url || url.trim().length === 0) {
      throw new Error(
        'DATABASE_URL is missing. Add it to your .env file (example: DATABASE_URL="postgresql://user:pass@localhost:5432/dbname")',
      );
    }

    const adapter = new PrismaPg({ connectionString: url });

    //  Prisma v7 requires adapter OR accelerateUrl
    super({ adapter });
  }

  async onModuleInit() {
    await this.$connect();
  }
}
