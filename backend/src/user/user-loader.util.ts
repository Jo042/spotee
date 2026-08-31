/**
 * groupBy の結果を DataLoader のキー順に並べ直す。
 *
 * DataLoader は「キー配列の i 番目に対する答えは戻り値配列の i 番目」として
 * 結果を配るため、長さと順序をキー配列に一致させる必要がある。
 * groupBy は該当のなかったキーの行を返さないので、その分を 0 で埋める。
 */
export function alignCounts<TRow>(
  keys: readonly string[],
  rows: readonly TRow[],
  selectKey: (row: TRow) => string,
  selectCount: (row: TRow) => number,
): number[] {
  const counts = new Map<string, number>();

  for (const row of rows) {
    counts.set(selectKey(row), selectCount(row));
  }

  return keys.map((key) => counts.get(key) ?? 0);
}
