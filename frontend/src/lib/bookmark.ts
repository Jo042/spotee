/** 保存先のフォルダ ID を足した新しい配列（重複させない） */
export function withFolderId(
  ids: readonly string[],
  folderId: string,
): string[] {
  return ids.includes(folderId) ? [...ids] : [...ids, folderId];
}

/** 保存先のフォルダ ID を取り除いた新しい配列 */
export function withoutFolderId(
  ids: readonly string[],
  folderId: string,
): string[] {
  return ids.filter((id) => id !== folderId);
}
