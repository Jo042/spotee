import { ExecutionContext, Injectable } from '@nestjs/common';
import { GqlContextType, GqlExecutionContext } from '@nestjs/graphql';
import { ThrottlerGuard } from '@nestjs/throttler';
import type { Request, Response } from 'express';
import type { GraphQLResolveInfo } from 'graphql';

/**
 * ミューテーションだけを回数制限する。
 * ThrottlerGuard は HTTP の req/res を前提にしているため、GraphQL の
 * コンテキストから取り出して渡す。
 */
@Injectable()
export class GqlThrottlerGuard extends ThrottlerGuard {
  protected shouldSkip(context: ExecutionContext): Promise<boolean> {
    if (context.getType<GqlContextType>() !== 'graphql') {
      return Promise.resolve(true);
    }
    const info =
      GqlExecutionContext.create(context).getInfo<GraphQLResolveInfo>();
    return Promise.resolve(info.parentType.name !== 'Mutation');
  }

  protected getRequestResponse(context: ExecutionContext) {
    const { req, res } = GqlExecutionContext.create(context).getContext<{
      req: Request;
      res: Response;
    }>();
    return { req, res };
  }
}
