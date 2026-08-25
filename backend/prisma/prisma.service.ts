import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor() {
    // PRISMA_QUERY_LOG=true のときだけ発行SQLを標準出力へ。
    // リクエスト1回あたり何本のクエリが飛ぶかを確認するための開発用スイッチ
    super(
      process.env.PRISMA_QUERY_LOG === 'true'
        ? { log: [{ emit: 'stdout', level: 'query' }] }
        : {},
    );
  }

  async onModuleInit() {
    await this.$connect();
    console.log('Database connected');
  }

  async onModuleDestroy() {
    await this.$disconnect();
    console.log('Database disconnected');
  }
}
