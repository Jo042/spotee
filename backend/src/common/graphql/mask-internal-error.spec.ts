import { NotFoundException } from '@nestjs/common';
import { ThrottlerException } from '@nestjs/throttler';
import { GraphQLError, type GraphQLFormattedError } from 'graphql';
import { maskInternalError } from './mask-internal-error';

/** リゾルバーの中で投げられた例外は、Apollo が path 付きの GraphQLError で包む */
const thrownInResolver = (original: Error) =>
  new GraphQLError(original.message, {
    path: ['spots'],
    originalError: original,
  });

describe('maskInternalError', () => {
  describe('想定外のエラー（HttpException 以外）', () => {
    const formatted: GraphQLFormattedError = {
      message: "Can't reach database server at `db.example.supabase.co:5432`",
      locations: [{ line: 1, column: 3 }],
      path: ['spots'],
      extensions: {
        code: 'INTERNAL_SERVER_ERROR',
        stacktrace: ['PrismaClientInitializationError: ...'],
      },
    };
    const original = thrownInResolver(new Error(formatted.message));

    it('文言を汎用のものに差し替える', () => {
      expect(maskInternalError(formatted, original).message).toBe(
        'Internal server error',
      );
    });

    it('extensions は code だけを残す', () => {
      expect(maskInternalError(formatted, original).extensions).toEqual({
        code: 'INTERNAL_SERVER_ERROR',
      });
    });

    it('どの箇所で失敗したか（path・locations）は残す', () => {
      const masked = maskInternalError(formatted, original);

      expect(masked.path).toEqual(['spots']);
      expect(masked.locations).toEqual([{ line: 1, column: 3 }]);
    });

    it('code が無くても内部エラーとして扱う', () => {
      const masked = maskInternalError(
        { message: 'secret detail' },
        new Error('secret detail'),
      );

      expect(masked).toEqual({
        message: 'Internal server error',
        extensions: { code: 'INTERNAL_SERVER_ERROR' },
      });
    });
  });

  describe('利用者向けのエラー', () => {
    it('入力検証のエラー（BAD_REQUEST）はそのまま返す', () => {
      const formatted: GraphQLFormattedError = {
        message: 'Bad Request Exception',
        extensions: {
          code: 'BAD_REQUEST',
          originalError: { message: ['タイトルを入力してください'] },
        },
      };

      expect(maskInternalError(formatted, new Error())).toBe(formatted);
    });

    it('クエリの検証エラー（GRAPHQL_VALIDATION_FAILED）はそのまま返す', () => {
      const formatted: GraphQLFormattedError = {
        message: 'Syntax Error: Query depth limit of 7 exceeded, found 8.',
        extensions: { code: 'GRAPHQL_VALIDATION_FAILED' },
      };

      expect(maskInternalError(formatted, new GraphQLError(''))).toBe(
        formatted,
      );
    });

    it('意図して投げた HttpException（NotFound など）は code が INTERNAL_SERVER_ERROR でもそのまま返す', () => {
      const formatted: GraphQLFormattedError = {
        message: 'Spot not found',
        extensions: { code: 'INTERNAL_SERVER_ERROR', status: 404 },
      };
      const original = thrownInResolver(
        new NotFoundException('Spot not found'),
      );

      expect(maskInternalError(formatted, original)).toBe(formatted);
    });

    it('回数制限（ThrottlerException）は status が付かないがそのまま返す', () => {
      const formatted: GraphQLFormattedError = {
        message: '操作が多すぎます',
        extensions: { code: 'INTERNAL_SERVER_ERROR' },
      };
      const original = thrownInResolver(
        new ThrottlerException('操作が多すぎます'),
      );

      expect(maskInternalError(formatted, original)).toBe(formatted);
    });
  });
});
