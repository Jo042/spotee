interface SortableFolder {
  id: string;
  createdAt: Date;
}

/**
 * 直近使ったフォルダを先頭にする。一度も保存していないフォルダは作成日時を
 * 「使った日時」とみなす（作ったばかりのフォルダが末尾に埋もれないように）
 */
export function sortFoldersByLastUsed<T extends SortableFolder>(
  folders: readonly T[],
  lastUsedAt: ReadonlyMap<string, Date | null>,
): T[] {
  const usedAt = (folder: T) =>
    (lastUsedAt.get(folder.id) ?? folder.createdAt).getTime();

  return [...folders].sort(
    (a, b) => usedAt(b) - usedAt(a) || b.id.localeCompare(a.id),
  );
}
