import { Injectable, Scope } from '@nestjs/common';
import DataLoader from 'dataloader';
import { PrismaService } from '../../prisma/prisma.service';
import { groupRowsByKey } from '../spot/spot-loader.util';
import { alignCounts } from '../user/user-loader.util';
import { pickThumbnailUrls } from './folder.util';

@Injectable({ scope: Scope.REQUEST })
export class BookmarkLoader {
  constructor(private prisma: PrismaService) {}

  /**
   * 閲覧者自身がそのスポットを入れているフォルダの ID。
   * 閲覧者の保存しか引かないので、他人の保存状況は構造上取得できない
   */
  // key format: "${supabaseId}:${spotId}"
  readonly folderIdsLoader = new DataLoader<string, string[]>(async (keys) => {
    const pairs = keys.map((k) => {
      const idx = k.indexOf(':');
      return { supabaseId: k.slice(0, idx), spotId: k.slice(idx + 1) };
    });

    const supabaseId = pairs[0].supabaseId;
    const spotIds = pairs.map((p) => p.spotId);

    const viewer = await this.prisma.user.findUnique({
      where: { supabaseId },
      select: { id: true },
    });

    if (!viewer) return keys.map(() => []);

    const bookmarks = await this.prisma.bookmark.findMany({
      where: { userId: viewer.id, spotId: { in: spotIds } },
      select: { spotId: true, folderId: true },
    });

    return groupRowsByKey(
      spotIds,
      bookmarks,
      (b) => b.spotId,
      (b) => b.folderId,
    );
  });

  readonly spotCountLoader = new DataLoader<string, number>(
    async (folderIds) => {
      const rows = await this.prisma.bookmark.groupBy({
        by: ['folderId'],
        where: { folderId: { in: [...folderIds] } },
        _count: { _all: true },
      });

      return alignCounts(
        folderIds,
        rows,
        (row) => row.folderId,
        (row) => row._count._all,
      );
    },
  );

  readonly thumbnailUrlLoader = new DataLoader<string, string | null>(
    async (folderIds) => {
      const bookmarks = await this.prisma.bookmark.findMany({
        where: { folderId: { in: [...folderIds] } },
        orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
        select: { folderId: true, spotId: true },
      });

      const spotIds = [...new Set(bookmarks.map((b) => b.spotId))];
      const images =
        spotIds.length === 0
          ? []
          : await this.prisma.spotImage.findMany({
              where: { spotId: { in: spotIds } },
              orderBy: { order: 'asc' },
              select: { spotId: true, url: true },
            });

      return pickThumbnailUrls(folderIds, bookmarks, images);
    },
  );
}
