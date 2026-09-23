import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { maxDepthRule } from '@escape.tech/graphql-armor-max-depth';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from '../prisma/prisma.module';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { join } from 'path';
import { CategoryModule } from './category/category.module';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { SpotModule } from './spot/spot.module';
import { LikeModule } from './like/like.module';
import { FollowModule } from './follow/follow.module';
import { BookmarkModule } from './bookmark/bookmark.module';
import { maskInternalError } from './common/graphql/mask-internal-error';
import { GqlThrottlerGuard } from './common/graphql/gql-throttler.guard';

// 開発用の機能は明示的に development のときだけ開く。
// 本番（Railway）では NODE_ENV が設定されていないため、未設定を本番として扱う
const isDevelopment = process.env.NODE_ENV === 'development';

const MAX_QUERY_DEPTH = 7;
const MUTATION_LIMIT_PER_MINUTE = 30;

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    ThrottlerModule.forRoot({
      throttlers: [{ ttl: 60_000, limit: MUTATION_LIMIT_PER_MINUTE }],
      errorMessage:
        '操作が多すぎます。しばらく待ってからもう一度お試しください',
    }),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      sortSchema: true,
      playground: isDevelopment,
      introspection: isDevelopment,
      includeStacktraceInErrorResponses: isDevelopment,
      hideSchemaDetailsFromClientErrors: !isDevelopment,
      formatError: isDevelopment ? undefined : maskInternalError,
      validationRules: [
        // 既定では例外を投げて 500 になるため、検証エラーとして報告させる
        maxDepthRule({
          n: MAX_QUERY_DEPTH,
          flattenFragments: true,
          propagateOnRejection: false,
          onReject: [(context, error) => context?.reportError(error)],
        }),
      ],
      context: (httpContext) => {
        return { req: httpContext.req, res: httpContext.res };
      },
    }),
    CategoryModule,
    AuthModule,
    UserModule,
    SpotModule,
    LikeModule,
    FollowModule,
    BookmarkModule,
  ],
  controllers: [AppController],
  providers: [AppService, { provide: APP_GUARD, useClass: GqlThrottlerGuard }],
})
export class AppModule {}
