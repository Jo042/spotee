import { groupRowsByKey } from '../spot/spot-loader.util';

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

/**
 * 各フォルダのサムネイル（最後に保存したスポットの1枚目の画像）を選ぶ。
 * bookmarks は保存日時の降順、images は表示順の昇順で渡すこと
 */
export function pickThumbnailUrls(
  folderIds: readonly string[],
  bookmarks: readonly { folderId: string; spotId: string }[],
  images: readonly { spotId: string; url: string }[],
): (string | null)[] {
  const latestSpotIds = groupRowsByKey(
    folderIds,
    bookmarks,
    (b) => b.folderId,
    (b) => b.spotId,
  ).map((spotIds) => spotIds[0]);

  const firstImageUrls = new Map<string, string>();
  for (const image of images) {
    if (!firstImageUrls.has(image.spotId)) {
      firstImageUrls.set(image.spotId, image.url);
    }
  }

  return latestSpotIds.map((spotId) =>
    spotId === undefined ? null : (firstImageUrls.get(spotId) ?? null),
  );
}
