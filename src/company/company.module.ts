import { Module } from '@nestjs/common';
import { CompanyController } from './company.controller';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [CompanyController],
  providers: [PrismaService],
})
export class CompanyModule {}
