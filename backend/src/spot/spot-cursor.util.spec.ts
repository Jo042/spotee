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
    it('DESC のとき createdAt の lt 条件と同値タイの id 条件を OR で返す', () => {
      const result = buildCursorCondition(
        cursorData,
        SpotSortBy.CREATED_AT,
        SortOrder.DESC,
      );
      expect(result).toEqual({
        OR: [
          { createdAt: { lt: new Date(BASE_DATE_ISO) } },
          { createdAt: new Date(BASE_DATE_ISO), id: { lt: 'spot-1' } },
        ],
      });
    });

    it('ASC のとき createdAt の gt 条件と同値タイの id 条件を OR で返す', () => {
      const result = buildCursorCondition(
        cursorData,
        SpotSortBy.CREATED_AT,
        SortOrder.ASC,
      );
      expect(result).toEqual({
        OR: [
          { createdAt: { gt: new Date(BASE_DATE_ISO) } },
          { createdAt: new Date(BASE_DATE_ISO), id: { gt: 'spot-1' } },
        ],
      });
    });

    it('id のタイブレーク条件の向きが createdAt の向きと一致する', () => {
      const desc = buildCursorCondition(
        cursorData,
        SpotSortBy.CREATED_AT,
        SortOrder.DESC,
      );
      const asc = buildCursorCondition(
        cursorData,
        SpotSortBy.CREATED_AT,
        SortOrder.ASC,
      );

      expect(desc.OR?.[1]).toHaveProperty('id.lt');
      expect(asc.OR?.[1]).toHaveProperty('id.gt');
    });
  });

  describe('TITLE ソート', () => {
    it('DESC のとき title の lt 条件と同値タイの id 条件を OR で返す', () => {
      const result = buildCursorCondition(
        cursorData,
        SpotSortBy.TITLE,
        SortOrder.DESC,
      );
      expect(result).toEqual({
        OR: [
          { title: { lt: '渋谷カフェ' } },
          { title: '渋谷カフェ', id: { lt: 'spot-1' } },
        ],
      });
    });

    it('ASC のとき title の gt 条件と同値タイの id 条件を OR で返す', () => {
      const result = buildCursorCondition(
        cursorData,
        SpotSortBy.TITLE,
        SortOrder.ASC,
      );
      expect(result).toEqual({
        OR: [
          { title: { gt: '渋谷カフェ' } },
          { title: '渋谷カフェ', id: { gt: 'spot-1' } },
        ],
      });
    });
  });

  describe('LIKE_COUNT ソート', () => {
    it('DESC のとき likeCount・createdAt・id の3段の OR を返す', () => {
      const result = buildCursorCondition(
        cursorData,
        SpotSortBy.LIKE_COUNT,
        SortOrder.DESC,
      );
      expect(result).toEqual({
        OR: [
          { likeCount: { lt: 5 } },
          { likeCount: 5, createdAt: { lt: new Date(BASE_DATE_ISO) } },
          {
            likeCount: 5,
            createdAt: new Date(BASE_DATE_ISO),
            id: { lt: 'spot-1' },
          },
        ],
      });
    });

    it('ASC のとき1段目だけ gt になり、2段目以降は lt のままになる', () => {
      const result = buildCursorCondition(
        cursorData,
        SpotSortBy.LIKE_COUNT,
        SortOrder.ASC,
      );
      expect(result).toEqual({
        OR: [
          { likeCount: { gt: 5 } },
          { likeCount: 5, createdAt: { lt: new Date(BASE_DATE_ISO) } },
          {
            likeCount: 5,
            createdAt: new Date(BASE_DATE_ISO),
            id: { lt: 'spot-1' },
          },
        ],
      });
    });
  });

  describe('タイブレーカの一貫性', () => {
    it.each([
      [SpotSortBy.CREATED_AT, SortOrder.DESC],
      [SpotSortBy.CREATED_AT, SortOrder.ASC],
      [SpotSortBy.TITLE, SortOrder.DESC],
      [SpotSortBy.TITLE, SortOrder.ASC],
      [SpotSortBy.LIKE_COUNT, SortOrder.DESC],
      [SpotSortBy.LIKE_COUNT, SortOrder.ASC],
    ])('%s / %s の最終段が id の比較になっている', (sortBy, order) => {
      const result = buildCursorCondition(cursorData, sortBy, order);
      const lastBranch = result.OR?.[result.OR.length - 1];

      expect(lastBranch).toHaveProperty('id');
    });
  });
});
