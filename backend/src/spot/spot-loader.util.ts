/**
 * DataLoader のバッチ関数向けに、取得した行をキーごとにまとめ直す。
 *
 * DataLoader は「キー配列の i 番目に対する答えは戻り値配列の i 番目」として
 * 結果を配るため、長さと順序をキー配列に一致させる必要がある。
 * DB は順序を保証しないので、行を一度グループ化してから並べ直す。
 */
export function groupRowsByKey<TRow, TValue>(
  keys: readonly string[],
  rows: readonly TRow[],
  selectKey: (row: TRow) => string,
  selectValue: (row: TRow) => TValue,
): TValue[][] {
  const grouped = new Map<string, TValue[]>();

  for (const row of rows) {
    const key = selectKey(row);
    const existing = grouped.get(key);

    if (existing) {
      existing.push(selectValue(row));
    } else {
      grouped.set(key, [selectValue(row)]);
    }
  }

  return keys.map((key) => grouped.get(key) ?? []);
}
