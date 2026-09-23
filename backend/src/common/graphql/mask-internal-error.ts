import {
  ApolloServerErrorCode,
  unwrapResolverError,
} from '@apollo/server/errors';
import { HttpException } from '@nestjs/common';
import type { GraphQLFormattedError } from 'graphql';

const INTERNAL_ERROR_MESSAGE = 'Internal server error';

/**
 * 想定外のエラーの文言を伏せる。
 *
 * HttpException は自分たちが利用者向けに投げたものなので残す。それ以外の
 * INTERNAL_SERVER_ERROR は DB などから漏れた例外で、文言に接続先や
 * テーブル名が含まれうるため返さない。
 */
export function maskInternalError(
  formattedError: GraphQLFormattedError,
  error: unknown,
): GraphQLFormattedError {
  const code =
    formattedError.extensions?.code ??
    ApolloServerErrorCode.INTERNAL_SERVER_ERROR;
  const isUnexpected =
    code === ApolloServerErrorCode.INTERNAL_SERVER_ERROR &&
    !(unwrapResolverError(error) instanceof HttpException);

  if (!isUnexpected) return formattedError;

  return {
    message: INTERNAL_ERROR_MESSAGE,
    locations: formattedError.locations,
    path: formattedError.path,
    extensions: { code },
  };
}
