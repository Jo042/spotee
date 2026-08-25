import {
  encodeCursor,
  decodeCursor,
  buildCursorCondition,
  CursorData,
} from './spot-cursor.util';
import { SpotSortBy, SortOrder } from './dto/spot-sort.input';

const BASE_DATE = new Date('2024-01-15T10:00:00.000Z');
const BASE_DATE_ISO = BASE_DATE.toISOString();

describe('encodeCursor', () => {
  it('CREATED_AT ソートのとき id と createdAt だけを含む', () => {
    const cursor = encodeCursor(
      { id: 'spot-1', createdAt: BASE_DATE },
      SpotSortBy.CREATED_AT,
    );
    const decoded = JSON.parse(Buffer.from(cursor, 'base64').toString('utf-8'));

    expect(decoded).toEqual({ id: 'spot-1', createdAt: BASE_DATE_ISO });
  });

  it('LIKE_COUNT ソートのとき likeCount も含む', () => {
    const cursor = encodeCursor(
      { id: 'spot-1', createdAt: BASE_DATE, likeCount: 42 },
      SpotSortBy.LIKE_COUNT,
    );
    const decoded = JSON.parse(Buffer.from(cursor, 'base64').toString('utf-8'));

    expect(decoded).toEqual({
      id: 'spot-1',
      createdAt: BASE_DATE_ISO,
      likeCount: 42,
    });
  });

  it('TITLE ソートのとき title も含む', () => {
    const cursor = encodeCursor(
      { id: 'spot-1', createdAt: BASE_DATE, title: '渋谷カフェ' },
      SpotSortBy.TITLE,
    );
    const decoded = JSON.parse(Buffer.from(cursor, 'base64').toString('utf-8'));

    expect(decoded).toEqual({
      id: 'spot-1',
      createdAt: BASE_DATE_ISO,
      title: '渋谷カフェ',
    });
  });
});

describe('decodeCursor', () => {
  it('encodeCursor で生成したカーソルを正しくデコードできる', () => {
    const original = { id: 'spot-1', createdAt: BASE_DATE, likeCount: 10 };
    const cursor = encodeCursor(original, SpotSortBy.LIKE_COUNT);
    const decoded = decodeCursor(cursor);

    expect(decoded).toEqual({
      id: 'spot-1',
      createdAt: BASE_DATE_ISO,
      likeCount: 10,
    });
  });

  it('不正な文字列を渡すと Error を投げる', () => {
    expect(() => decodeCursor('not-valid-base64!!')).toThrow('Invalid cursor');
  });

  it('base64 だが JSON でない文字列を渡すと Error を投げる', () => {
    const notJson = Buffer.from('hello').toString('base64');
    expect(() => decodeCursor(notJson)).toThrow('Invalid cursor');
  });
});

describe('buildCursorCondition', () => {
  const cursorData: CursorData = {
    id: 'spot-1',
    createdAt: BASE_DATE_ISO,
    likeCount: 5,
    title: '渋谷カフェ',
  };

  describe('CREATED_AT ソート', () => {
    it('DESC のとき createdAt の lte 範囲条件と同値タイの除外条件を返す', () => {
      const result = buildCursorCondition(
        cursorData,
        SpotSortBy.CREATED_AT,
        SortOrder.DESC,
      );
      expect(result).toEqual({
        createdAt: { lte: new Date(BASE_DATE_ISO) },
        OR: [
          { createdAt: { not: new Date(BASE_DATE_ISO) } },
          { id: { lt: 'spot-1' } },
        ],
      });
    });

    it('ASC のとき createdAt の gte 範囲条件と同値タイの除外条件を返す', () => {
      const result = buildCursorCondition(
        cursorData,
        SpotSortBy.CREATED_AT,
        SortOrder.ASC,
      );
      expect(result).toEqual({
        createdAt: { gte: new Date(BASE_DATE_ISO) },
        OR: [
          { createdAt: { not: new Date(BASE_DATE_ISO) } },
          { id: { gt: 'spot-1' } },
        ],
      });
    });
  });

  describe('TITLE ソート', () => {
    it('DESC のとき title の lte 範囲条件と同値タイの除外条件を返す', () => {
      const result = buildCursorCondition(
        cursorData,
        SpotSortBy.TITLE,
        SortOrder.DESC,
      );
      expect(result).toEqual({
        title: { lte: '渋谷カフェ' },
        OR: [{ title: { not: '渋谷カフェ' } }, { id: { lt: 'spot-1' } }],
      });
    });

    it('ASC のとき title の gte 範囲条件と同値タイの除外条件を返す', () => {
      const result = buildCursorCondition(
        cursorData,
        SpotSortBy.TITLE,
        SortOrder.ASC,
      );
      expect(result).toEqual({
        title: { gte: '渋谷カフェ' },
        OR: [{ title: { not: '渋谷カフェ' } }, { id: { gt: 'spot-1' } }],
      });
    });
  });

  describe('LIKE_COUNT ソート', () => {
    it('DESC のとき likeCount の lte 範囲条件と3段の除外条件を返す', () => {
      const result = buildCursorCondition(
        cursorData,
        SpotSortBy.LIKE_COUNT,
        SortOrder.DESC,
      );
      expect(result).toEqual({
        likeCount: { lte: 5 },
        OR: [
          { likeCount: { not: 5 } },
          { createdAt: { lt: new Date(BASE_DATE_ISO) } },
          { createdAt: new Date(BASE_DATE_ISO), id: { lt: 'spot-1' } },
        ],
      });
    });

    it('ASC のとき範囲条件だけ gte になり、同数タイの条件は lt のままになる', () => {
      const result = buildCursorCondition(
        cursorData,
        SpotSortBy.LIKE_COUNT,
        SortOrder.ASC,
      );
      expect(result).toEqual({
        likeCount: { gte: 5 },
        OR: [
          { likeCount: { not: 5 } },
          { createdAt: { lt: new Date(BASE_DATE_ISO) } },
          { createdAt: new Date(BASE_DATE_ISO), id: { lt: 'spot-1' } },
        ],
      });
    });
  });

  describe('実行計画を保つための構造', () => {
    const cases = [
      [SpotSortBy.CREATED_AT, SortOrder.DESC, 'createdAt', 'lte'],
      [SpotSortBy.CREATED_AT, SortOrder.ASC, 'createdAt', 'gte'],
      [SpotSortBy.TITLE, SortOrder.DESC, 'title', 'lte'],
      [SpotSortBy.TITLE, SortOrder.ASC, 'title', 'gte'],
      [SpotSortBy.LIKE_COUNT, SortOrder.DESC, 'likeCount', 'lte'],
      [SpotSortBy.LIKE_COUNT, SortOrder.ASC, 'likeCount', 'gte'],
    ] as const;

    it.each(cases)(
      '%s / %s は第1キー %s に %s の範囲条件を持つ',
      (sortBy, order, key, rangeOperator) => {
        const result = buildCursorCondition(cursorData, sortBy, order);

        // 第1キーの範囲条件がトップレベルに独立していないと
        // PostgreSQL が Index Cond を導出できず、深いページで劣化する
        expect(result).toHaveProperty(`${key}.${rangeOperator}`);
      },
    );

    it.each(cases)('%s / %s は同値タイの除外条件を OR で持つ', (sortBy, order) => {
      const result = buildCursorCondition(cursorData, sortBy, order);

      expect(Array.isArray(result.OR)).toBe(true);
      expect((result.OR as unknown[]).length).toBeGreaterThanOrEqual(2);
    });

    it('最終段が id の比較になっている', () => {
      for (const [sortBy, order] of cases) {
        const result = buildCursorCondition(cursorData, sortBy, order);
        const branches = result.OR as Record<string, unknown>[];

        expect(branches[branches.length - 1]).toHaveProperty('id');
      }
    });
  });
});
