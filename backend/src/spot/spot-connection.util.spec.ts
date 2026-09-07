import { buildConnection } from './spot-connection.util';
import type { SpotNode } from './dto/spot.object';

type Row = { id: string; title: string };

const row = (id: string): Row => ({ id, title: `spot-${id}` });

const toNode = (r: Row) => r as unknown as SpotNode;
const toCursor = (r: Row) => `cursor-${r.id}`;
const countTotal = () => Promise.resolve(0);

const build = (rows: Row[], first: number, hasPreviousPage = false) =>
  buildConnection({
    rows,
    first,
    hasPreviousPage,
    toNode,
    toCursor,
    countTotal,
  });

describe('buildConnection', () => {
  describe('次ページの判定', () => {
    it('first + 1 件あるとき hasNextPage は true になり、余りの1件は返さない', () => {
      const result = build([row('1'), row('2'), row('3')], 2);

      expect(result.pageInfo.hasNextPage).toBe(true);
      expect(result.edges).toHaveLength(2);
      expect(result.edges.map((e) => e.cursor)).toEqual([
        'cursor-1',
        'cursor-2',
      ]);
    });

    it('ちょうど first 件のとき hasNextPage は false になる', () => {
      const result = build([row('1'), row('2')], 2);

      expect(result.pageInfo.hasNextPage).toBe(false);
      expect(result.edges).toHaveLength(2);
    });

    it('first 件に満たないとき hasNextPage は false になる', () => {
      const result = build([row('1')], 2);

      expect(result.pageInfo.hasNextPage).toBe(false);
      expect(result.edges).toHaveLength(1);
    });
  });

  describe('pageInfo', () => {
    it('先頭と末尾のカーソルを返す', () => {
      const result = build([row('1'), row('2'), row('3')], 3);

      expect(result.pageInfo.startCursor).toBe('cursor-1');
      expect(result.pageInfo.endCursor).toBe('cursor-3');
    });

    it('余りを切ったあとの末尾をendCursorにする', () => {
      const result = build([row('1'), row('2'), row('3')], 2);

      expect(result.pageInfo.endCursor).toBe('cursor-2');
    });

    it('0件のときカーソルは両方 null になる', () => {
      const result = build([], 2);

      expect(result.edges).toEqual([]);
      expect(result.pageInfo.startCursor).toBeNull();
      expect(result.pageInfo.endCursor).toBeNull();
      expect(result.pageInfo.hasNextPage).toBe(false);
    });

    it('1件のとき startCursor と endCursor が同じになる', () => {
      const result = build([row('1')], 2);

      expect(result.pageInfo.startCursor).toBe('cursor-1');
      expect(result.pageInfo.endCursor).toBe('cursor-1');
    });

    it('hasPreviousPage は渡された値をそのまま返す', () => {
      expect(build([row('1')], 2, true).pageInfo.hasPreviousPage).toBe(true);
      expect(build([row('1')], 2, false).pageInfo.hasPreviousPage).toBe(false);
    });
  });

  describe('ノードとカーソルの取り出し', () => {
    it('行の順序を保ったまま edges を作る', () => {
      const result = build([row('3'), row('1'), row('2')], 3);

      expect(result.edges.map((e) => e.cursor)).toEqual([
        'cursor-3',
        'cursor-1',
        'cursor-2',
      ]);
    });

    it('toNode で行から別のオブジェクトを取り出せる（いいね経由の取得）', () => {
      type LikeRow = { spot: Row };
      const likes: LikeRow[] = [{ spot: row('1') }, { spot: row('2') }];

      const result = buildConnection({
        rows: likes,
        first: 2,
        hasPreviousPage: false,
        toNode: (like) => like.spot as unknown as SpotNode,
        toCursor: (like) => `cursor-${like.spot.id}`,
        countTotal,
      });

      expect(result.edges.map((e) => e.node)).toEqual([row('1'), row('2')]);
    });
  });

  describe('totalCount', () => {
    it('countTotal は組み立て時に実行されない（遅延解決のまま渡す）', () => {
      const spy = jest.fn(() => Promise.resolve(42));

      const result = buildConnection({
        rows: [row('1')],
        first: 2,
        hasPreviousPage: false,
        toNode,
        toCursor,
        countTotal: spy,
      });

      expect(spy).not.toHaveBeenCalled();
      expect(result.countTotal).toBe(spy);
    });
  });
});
