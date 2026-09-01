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

/**
 * カーソルに含まれる項目はソート種別ごとに異なる（encodeCursor 参照）。
 * 種別と食い違うカーソルを渡されると、条件に undefined が混ざったまま
 * Prisma に届き、エラーも出さずに想定と違う結果を返してしまうため、
 * 使う直前に検証する。
 */
export function assertCursorMatchesSort(
  cursorData: CursorData,
  sortBy: SpotSortBy,
): void {
  if (typeof cursorData.id !== 'string' || cursorData.id === '') {
    throw new Error('Invalid cursor');
  }

  if (Number.isNaN(new Date(cursorData.createdAt).getTime())) {
    throw new Error('Invalid cursor');
  }

  if (
    sortBy === SpotSortBy.LIKE_COUNT &&
    typeof cursorData.likeCount !== 'number'
  ) {
    throw new Error('Invalid cursor');
  }

  if (sortBy === SpotSortBy.TITLE && typeof cursorData.title !== 'string') {
    throw new Error('Invalid cursor');
  }
}

export type CreatedAtCursorCondition = {
  createdAt: Prisma.DateTimeFilter;
  OR: Array<{ createdAt?: Prisma.DateTimeFilter; id?: Prisma.StringFilter }>;
};

/**
 * createdAt 降順・昇順のカーソル条件。id をタイブレークに使う。
 * id と createdAt を持つモデルであれば同じ形が使えるため、
 * スポットの一覧といいねの一覧の両方から利用する。
 */
export function buildCreatedAtCursorCondition(
  cursorData: Pick<CursorData, 'id' | 'createdAt'>,
  order: SortOrder,
): CreatedAtCursorCondition {
  const rangeOperator = order === SortOrder.DESC ? 'lte' : 'gte';
  const strictOperator = order === SortOrder.DESC ? 'lt' : 'gt';
  const cursorCreatedAt = new Date(cursorData.createdAt);

  return {
    createdAt: { [rangeOperator]: cursorCreatedAt },
    OR: [
      { createdAt: { not: cursorCreatedAt } },
      { id: { [strictOperator]: cursorData.id } },
    ],
  };
}

export function buildCursorCondition(
  cursorData: CursorData,
  sortBy: SpotSortBy,
  order: SortOrder,
): Prisma.SpotWhereInput {
  assertCursorMatchesSort(cursorData, sortBy);

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
      return buildCreatedAtCursorCondition(cursorData, order);
  }
}
