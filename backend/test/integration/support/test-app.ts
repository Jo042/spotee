import { Test } from '@nestjs/testing';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { ThrottlerStorage } from '@nestjs/throttler';
import request from 'supertest';
import { AppModule } from '../../../src/app.module';
import { configureApp } from '../../../src/configure-app';
import { PrismaService } from '../../../prisma/prisma.service';
import { startJwksServer } from './test-auth';

/** 回数制限はテストの対象外。同じ接続元から続けて送るため、数えない */
const unlimitedThrottlerStorage: ThrottlerStorage = {
  increment: () =>
    Promise.resolve({
      totalHits: 1,
      timeToExpire: 0,
      isBlocked: false,
      timeToBlockExpire: 0,
    }),
};

export type GraphQLResponse<T> = {
  data?: T | null;
  errors?: {
    message: string;
    extensions?: { code?: string; status?: number };
  }[];
};

export type TestApp = {
  prisma: PrismaService;
  graphql: <T>(
    query: string,
    options?: { variables?: Record<string, unknown>; token?: string },
  ) => Promise<GraphQLResponse<T>>;
  close: () => Promise<void>;
};

export async function createTestApp(): Promise<TestApp> {
  const jwks = await startJwksServer();
  process.env.SUPABASE_URL = jwks.url;

  const moduleRef = await Test.createTestingModule({ imports: [AppModule] })
    .overrideProvider(ThrottlerStorage)
    .useValue(unlimitedThrottlerStorage)
    .compile();

  const app = moduleRef.createNestApplication<NestExpressApplication>({
    logger: false,
  });
  configureApp(app);
  await app.init();

  return {
    prisma: app.get(PrismaService),
    graphql: async (query, { variables, token } = {}) => {
      const req = request(app.getHttpServer()).post('/graphql');
      if (token) req.set('Authorization', `Bearer ${token}`);
      const res = await req.send({ query, variables });
      return res.body;
    },
    close: async () => {
      await app.close();
      await jwks.close();
    },
  };
}
