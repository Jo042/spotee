import { Controller, Get } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';

@Controller()
export class AppController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  async getHealth() {
    const categoryCount = await this.prisma.category.count();
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      database: 'connected',
      categoryCount,
    };
  }
}
