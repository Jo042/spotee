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
  const operator = order === SortOrder.DESC ? 'lt' : 'gt';

  switch (sortBy) {
    case SpotSortBy.LIKE_COUNT:
      return {
        OR: [
          { likeCount: { [operator]: cursorData.likeCount } },
          {
            likeCount: cursorData.likeCount,
            createdAt: { lt: new Date(cursorData.createdAt) },
          },
        ],
      };
    case SpotSortBy.TITLE:
      return { title: { [operator]: cursorData.title } };
    case SpotSortBy.CREATED_AT:
    default:
      return { createdAt: { [operator]: new Date(cursorData.createdAt) } };
  }
}
