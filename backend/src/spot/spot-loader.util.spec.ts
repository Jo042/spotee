import { groupRowsByKey } from './spot-loader.util';

type Row = { spotId: string; value: string };

const row = (spotId: string, value: string): Row => ({ spotId, value });

const selectKey = (r: Row) => r.spotId;
const selectValue = (r: Row) => r.value;

describe('groupRowsByKey', () => {
  it('キーの数と同じ長さの配列を返す', () => {
    const result = groupRowsByKey(
      ['s1', 's2', 's3'],
      [row('s1', 'a')],
      selectKey,
      selectValue,
    );

    expect(result).toHaveLength(3);
  });

  it('キーの順序どおりに並べて返す', () => {
    const result = groupRowsByKey(
      ['s2', 's1'],
      [row('s1', 'a'), row('s2', 'b')],
      selectKey,
      selectValue,
    );

    expect(result).toEqual([['b'], ['a']]);
  });

  it('行が0件のキーには空配列を入れる（詰めない）', () => {
    const result = groupRowsByKey(
      ['s1', 's2', 's3'],
      [row('s1', 'a'), row('s3', 'c')],
      selectKey,
      selectValue,
    );

    expect(result).toEqual([['a'], [], ['c']]);
  });

  it('行がキーと無関係な順序で返ってきても正しく対応づける', () => {
    const result = groupRowsByKey(
      ['s1', 's2', 's3'],
      [row('s3', 'c'), row('s1', 'a'), row('s2', 'b'), row('s1', 'a2')],
      selectKey,
      selectValue,
    );

    expect(result).toEqual([['a', 'a2'], ['b'], ['c']]);
  });

  it('同一キー内では行の並び順を保持する', () => {
    const result = groupRowsByKey(
      ['s1'],
      [row('s1', '1st'), row('s1', '2nd'), row('s1', '3rd')],
      selectKey,
      selectValue,
    );

    expect(result).toEqual([['1st', '2nd', '3rd']]);
  });

  it('selectValue で行から値を取り出す（中間テーブルからタグ本体を取る形）', () => {
    const rows = [
      { spotId: 's1', tag: { id: 't1', name: '個室あり' } },
      { spotId: 's1', tag: { id: 't2', name: '夜景' } },
    ];

    const result = groupRowsByKey(
      ['s1'],
      rows,
      (r) => r.spotId,
      (r) => r.tag,
    );

    expect(result).toEqual([
      [
        { id: 't1', name: '個室あり' },
        { id: 't2', name: '夜景' },
      ],
    ]);
  });

  it('行が空でもキーの数だけ空配列を返す', () => {
    const result = groupRowsByKey(['s1', 's2'], [], selectKey, selectValue);

    expect(result).toEqual([[], []]);
  });

  it('キーが空なら空配列を返す', () => {
    const result = groupRowsByKey([], [row('s1', 'a')], selectKey, selectValue);

    expect(result).toEqual([]);
  });

  it('重複したキーにも同じ結果を返す', () => {
    const result = groupRowsByKey(
      ['s1', 's1'],
      [row('s1', 'a')],
      selectKey,
      selectValue,
    );

    expect(result).toEqual([['a'], ['a']]);
  });
});
