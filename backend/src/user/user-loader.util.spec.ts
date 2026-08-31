import { alignCounts } from './user-loader.util';

type Row = { userId: string; _count: number };

const row = (userId: string, count: number): Row => ({ userId, _count: count });

const selectKey = (r: Row) => r.userId;
const selectCount = (r: Row) => r._count;

describe('alignCounts', () => {
  it('キーの数と同じ長さの配列を返す', () => {
    const result = alignCounts(
      ['u1', 'u2', 'u3'],
      [row('u1', 5)],
      selectKey,
      selectCount,
    );

    expect(result).toHaveLength(3);
  });

  it('キーの順序どおりに並べて返す', () => {
    const result = alignCounts(
      ['u2', 'u1'],
      [row('u1', 3), row('u2', 7)],
      selectKey,
      selectCount,
    );

    expect(result).toEqual([7, 3]);
  });

  it('行が無いキーには0を入れる（投稿0件のユーザー）', () => {
    const result = alignCounts(
      ['u1', 'u2', 'u3'],
      [row('u1', 2), row('u3', 4)],
      selectKey,
      selectCount,
    );

    expect(result).toEqual([2, 0, 4]);
  });

  it('行がキーと無関係な順序で返ってきても正しく対応づける', () => {
    const result = alignCounts(
      ['u1', 'u2', 'u3'],
      [row('u3', 9), row('u1', 1), row('u2', 5)],
      selectKey,
      selectCount,
    );

    expect(result).toEqual([1, 5, 9]);
  });

  it('行が空でもキーの数だけ0を返す', () => {
    const result = alignCounts(['u1', 'u2'], [], selectKey, selectCount);

    expect(result).toEqual([0, 0]);
  });

  it('キーが空なら空配列を返す', () => {
    const result = alignCounts([], [row('u1', 1)], selectKey, selectCount);

    expect(result).toEqual([]);
  });

  it('重複したキーにも同じ値を返す', () => {
    const result = alignCounts(
      ['u1', 'u1'],
      [row('u1', 8)],
      selectKey,
      selectCount,
    );

    expect(result).toEqual([8, 8]);
  });

  it('件数が0の行をそのまま扱える', () => {
    const result = alignCounts(['u1'], [row('u1', 0)], selectKey, selectCount);

    expect(result).toEqual([0]);
  });
});
