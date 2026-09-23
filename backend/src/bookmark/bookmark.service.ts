import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { buildConnection } from '../common/connection.util';
import {
  buildCreatedAtCursorCondition,
  decodeCursor,
  encodeCursor,
} from '../spot/spot-cursor.util';
import { SpotSortBy, SortOrder } from '../spot/dto/spot-sort.input';
import type { SpotConnectionSource } from '../spot/dto/spot-connection.object';
import type { FolderNode } from './dto/folder.object';
import { FOLDER_LIMIT } from './dto/folder-input.constants';
import { sortFoldersByLastUsed } from './folder.util';

const isUniqueViolation = (error: unknown) =>
  error instanceof Prisma.PrismaClientKnownRequestError &&
  error.code === 'P2002';

@Injectable()
export class BookmarkService {
  constructor(private prisma: PrismaService) {}

  async myFolders(userId: string): Promise<FolderNode[]> {
    const folders = await this.prisma.folder.findMany({ where: { userId } });
    if (folders.length === 0) return [];

    const lastUsed = await this.prisma.bookmark.groupBy({
      by: ['folderId'],
      where: { folderId: { in: folders.map((f) => f.id) } },
      _max: { createdAt: true },
    });

    return sortFoldersByLastUsed(
      folders,
      new Map(lastUsed.map((row) => [row.folderId, row._max.createdAt])),
    );
  }

  /** 他人のフォルダは存在しないものとして扱う（null） */
  findOwnedFolder(
    userId: string,
    folderId: string,
  ): Promise<FolderNode | null> {
    return this.prisma.folder.findFirst({ where: { id: folderId, userId } });
  }

  async createFolder(userId: string, name: string): Promise<FolderNode> {
    const count = await this.prisma.folder.count({ where: { userId } });
    if (count >= FOLDER_LIMIT) {
      throw new BadRequestException(
        `フォルダは${FOLDER_LIMIT}個まで作成できます`,
      );
    }

    try {
      return await this.prisma.folder.create({ data: { userId, name } });
    } catch (error) {
      if (isUniqueViolation(error)) throw duplicateNameError();
      throw error;
    }
  }

  async renameFolder(
    userId: string,
    folderId: string,
    name: string,
  ): Promise<FolderNode> {
    await this.requireOwnedFolder(userId, folderId);

    try {
      return await this.prisma.folder.update({
        where: { id: folderId },
        data: { name },
      });
    } catch (error) {
      if (isUniqueViolation(error)) throw duplicateNameError();
      throw error;
    }
  }

  /** 中の保存記録は外部キーの Cascade で一緒に消える */
  async deleteFolder(userId: string, folderId: string): Promise<void> {
    await this.requireOwnedFolder(userId, folderId);
    await this.prisma.folder.delete({ where: { id: folderId } });
  }

  /** 重複して保存しても成功扱いにする（連打や二重送信でエラーを出さない） */
  async addBookmark(
    userId: string,
    spotId: string,
    folderId: string,
  ): Promise<void> {
    await this.requireOwnedFolder(userId, folderId);
    await this.assertSpotExists(spotId);

    try {
      await this.prisma.bookmark.create({
        data: { userId, spotId, folderId },
      });
    } catch (error) {
      if (!isUniqueViolation(error)) throw error;
    }
  }

  /** 保存していないものを外しても成功扱いにする */
  async removeBookmark(
    userId: string,
    spotId: string,
    folderId: string,
  ): Promise<void> {
    await this.requireOwnedFolder(userId, folderId);
    await this.prisma.bookmark.deleteMany({
      where: { userId, spotId, folderId },
    });
  }

  /**
   * フォルダ内のスポットを保存した順（新しい順）に返す。
   * 持ち主の確認は、フォルダを取得した時点で済んでいる前提
   */
  async folderSpots(
    folderId: string,
    first: number = 20,
    after?: string,
  ): Promise<SpotConnectionSource> {
    const filterWhere: Prisma.BookmarkWhereInput = { folderId };
    const cursorCondition = after
      ? buildCreatedAtCursorCondition(decodeCursor(after), SortOrder.DESC)
      : null;

    const bookmarks = await this.prisma.bookmark.findMany({
      where: cursorCondition
        ? { AND: [filterWhere, cursorCondition] }
        : filterWhere,
      take: first + 1,
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      include: { spot: true },
    });

    return buildConnection({
      rows: bookmarks,
      first,
      hasPreviousPage: !!after,
      toNode: (bookmark) => bookmark.spot,
      toCursor: (bookmark) => encodeCursor(bookmark, SpotSortBy.CREATED_AT),
      countTotal: () => this.prisma.bookmark.count({ where: filterWhere }),
    });
  }

  /**
   * 他人のフォルダも「見つかりません」にする。「権限がありません」と返すと、
   * その ID のフォルダが存在すること自体が伝わってしまう
   */
  private async requireOwnedFolder(
    userId: string,
    folderId: string,
  ): Promise<FolderNode> {
    const folder = await this.findOwnedFolder(userId, folderId);
    if (!folder) throw new NotFoundException('フォルダが見つかりません');
    return folder;
  }

  private async assertSpotExists(spotId: string): Promise<void> {
    const spot = await this.prisma.spot.findUnique({
      where: { id: spotId },
      select: { id: true },
    });
    if (!spot) throw new NotFoundException('スポットが見つかりません');
  }
}

const duplicateNameError = () =>
  new BadRequestException('同じ名前のフォルダがあります');
