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

/**
 * グループ（保存フォルダ・特集）ごとに、先頭のスポットの1枚目の画像を選ぶ。
 * rows はグループ内で先頭にしたい順、images は表示順の昇順で渡すこと
 */
export function pickThumbnailUrls(
  groupIds: readonly string[],
  rows: readonly { groupId: string; spotId: string }[],
  images: readonly { spotId: string; url: string }[],
): (string | null)[] {
  const firstSpotIds = groupRowsByKey(
    groupIds,
    rows,
    (row) => row.groupId,
    (row) => row.spotId,
  ).map((spotIds) => spotIds[0]);

  const firstImageUrls = new Map<string, string>();
  for (const image of images) {
    if (!firstImageUrls.has(image.spotId)) {
      firstImageUrls.set(image.spotId, image.url);
    }
  }

  return firstSpotIds.map((spotId) =>
    spotId === undefined ? null : (firstImageUrls.get(spotId) ?? null),
  );
}
