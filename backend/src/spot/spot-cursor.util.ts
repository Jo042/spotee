import { Prisma } from '@prisma/client';
import { SpotSortBy, SortOrder } from './dto/spot-sort.input';

export type CursorData = {
  id: string;
  createdAt: string;
  likeCount?: number;
  title?: string;
};

type CursorSource = {
  id: string;
  createdAt: Date;
  likeCount?: number;
  title?: string;
};

export function encodeCursor(spot: CursorSource, sortBy: SpotSortBy): string {
  const data: CursorData = {
    id: spot.id,
    createdAt: spot.createdAt.toISOString(),
  };

  if (sortBy === SpotSortBy.LIKE_COUNT) {
    data.likeCount = spot.likeCount;
  }
  if (sortBy === SpotSortBy.TITLE) {
    data.title = spot.title;
  }

  return Buffer.from(JSON.stringify(data)).toString('base64');
}

export function decodeCursor(cursor: string): CursorData {
  try {
    return JSON.parse(Buffer.from(cursor, 'base64').toString('utf-8'));
  } catch {
    throw new Error('Invalid cursor');
  }
}

export function buildCursorCondition(
  cursorData: CursorData,
  sortBy: SpotSortBy,
  order: SortOrder,
): Prisma.SpotWhereInput {
  // 第1キーは等号を含む範囲条件（lte/gte）として独立させ、同値の除外は OR 側に寄せる。
  // OR だけで表現すると PostgreSQL が Index Cond を導出できず、
  // インデックスの先頭からカーソル位置まで読み捨てる（＝OFFSET と同じ劣化になる）
  const rangeOperator = order === SortOrder.DESC ? 'lte' : 'gte';
  const strictOperator = order === SortOrder.DESC ? 'lt' : 'gt';
  const cursorCreatedAt = new Date(cursorData.createdAt);

  switch (sortBy) {
    case SpotSortBy.LIKE_COUNT:
      return {
        likeCount: { [rangeOperator]: cursorData.likeCount },
        OR: [
          { likeCount: { not: cursorData.likeCount } },
          { createdAt: { lt: cursorCreatedAt } },
          { createdAt: cursorCreatedAt, id: { lt: cursorData.id } },
        ],
      };
    case SpotSortBy.TITLE:
      return {
        title: { [rangeOperator]: cursorData.title },
        OR: [
          { title: { not: cursorData.title } },
          { id: { [strictOperator]: cursorData.id } },
        ],
      };
    case SpotSortBy.CREATED_AT:
    default:
      return {
        createdAt: { [rangeOperator]: cursorCreatedAt },
        OR: [
          { createdAt: { not: cursorCreatedAt } },
          { id: { [strictOperator]: cursorData.id } },
        ],
      };
  }
}
