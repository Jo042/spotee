import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { BookmarkService } from './bookmark.service';
import { FOLDER_LIMIT } from './dto/folder-input.constants';
import type { PrismaService } from '../../prisma/prisma.service';

const ME = 'user-me';
const FOLDER = 'folder-1';
const SPOT = 'spot-1';

const ownedFolder = {
  id: FOLDER,
  userId: ME,
  name: '行きたい',
  createdAt: new Date(),
  updatedAt: new Date(),
};

type PrismaMock = {
  folder: {
    findFirst: jest.Mock;
    findMany: jest.Mock;
    count: jest.Mock;
    create: jest.Mock;
    update: jest.Mock;
    delete: jest.Mock;
  };
  bookmark: { create: jest.Mock; deleteMany: jest.Mock; groupBy: jest.Mock };
  spot: { findUnique: jest.Mock };
};

const uniqueViolation = () =>
  new Prisma.PrismaClientKnownRequestError('duplicate', {
    code: 'P2002',
    clientVersion: 'test',
  });

const createService = () => {
  const prisma: PrismaMock = {
    folder: {
      findFirst: jest.fn().mockResolvedValue(ownedFolder),
      findMany: jest.fn().mockResolvedValue([]),
      count: jest.fn().mockResolvedValue(0),
      create: jest.fn().mockResolvedValue(ownedFolder),
      update: jest.fn().mockResolvedValue(ownedFolder),
      delete: jest.fn().mockResolvedValue(ownedFolder),
    },
    bookmark: {
      create: jest.fn().mockResolvedValue({}),
      deleteMany: jest.fn().mockResolvedValue({ count: 1 }),
      groupBy: jest.fn().mockResolvedValue([]),
    },
    spot: { findUnique: jest.fn().mockResolvedValue({ id: SPOT }) },
  };

  return {
    prisma,
    service: new BookmarkService(prisma as unknown as PrismaService),
  };
};

/** 他人のフォルダ（または存在しないフォルダ）を指定した状態 */
const withForeignFolder = () => {
  const ctx = createService();
  ctx.prisma.folder.findFirst.mockResolvedValue(null);
  return ctx;
};

describe('BookmarkService', () => {
  describe('認可: 他人のフォルダは存在しないものとして扱う', () => {
    it('持ち主の確認は id と userId の両方で絞る', async () => {
      const { service, prisma } = createService();

      await service.deleteFolder(ME, FOLDER);

      expect(prisma.folder.findFirst).toHaveBeenCalledWith({
        where: { id: FOLDER, userId: ME },
      });
    });

    it('名前を変えられない（NotFound）', async () => {
      const { service, prisma } = withForeignFolder();

      await expect(service.renameFolder(ME, FOLDER, 'x')).rejects.toThrow(
        NotFoundException,
      );
      expect(prisma.folder.update).not.toHaveBeenCalled();
    });

    it('削除できない（NotFound）', async () => {
      const { service, prisma } = withForeignFolder();

      await expect(service.deleteFolder(ME, FOLDER)).rejects.toThrow(
        NotFoundException,
      );
      expect(prisma.folder.delete).not.toHaveBeenCalled();
    });

    it('スポットを入れられない（NotFound）', async () => {
      const { service, prisma } = withForeignFolder();

      await expect(service.addBookmark(ME, SPOT, FOLDER)).rejects.toThrow(
        NotFoundException,
      );
      expect(prisma.bookmark.create).not.toHaveBeenCalled();
    });

    it('スポットを外せない（NotFound）', async () => {
      const { service, prisma } = withForeignFolder();

      await expect(service.removeBookmark(ME, SPOT, FOLDER)).rejects.toThrow(
        NotFoundException,
      );
      expect(prisma.bookmark.deleteMany).not.toHaveBeenCalled();
    });

    it('取得すると null になる', async () => {
      const { service } = withForeignFolder();

      await expect(service.findOwnedFolder(ME, FOLDER)).resolves.toBeNull();
    });
  });

  describe('フォルダ名の重複', () => {
    it('作成時に同名があれば BadRequest にする', async () => {
      const { service, prisma } = createService();
      prisma.folder.create.mockRejectedValue(uniqueViolation());

      await expect(service.createFolder(ME, '行きたい')).rejects.toThrow(
        new BadRequestException('同じ名前のフォルダがあります'),
      );
    });

    it('名前の変更で同名になる場合も BadRequest にする', async () => {
      const { service, prisma } = createService();
      prisma.folder.update.mockRejectedValue(uniqueViolation());

      await expect(
        service.renameFolder(ME, FOLDER, '行きたい'),
      ).rejects.toThrow(
        new BadRequestException('同じ名前のフォルダがあります'),
      );
    });

    it('重複以外のエラーは握りつぶさない', async () => {
      const { service, prisma } = createService();
      prisma.folder.create.mockRejectedValue(new Error('connection lost'));

      await expect(service.createFolder(ME, 'x')).rejects.toThrow(
        'connection lost',
      );
    });
  });

  describe('フォルダ数の上限', () => {
    it(`${FOLDER_LIMIT}個に達していたら作成できない`, async () => {
      const { service, prisma } = createService();
      prisma.folder.count.mockResolvedValue(FOLDER_LIMIT);

      await expect(service.createFolder(ME, 'x')).rejects.toThrow(
        BadRequestException,
      );
      expect(prisma.folder.create).not.toHaveBeenCalled();
    });

    it('上限未満なら作成できる', async () => {
      const { service, prisma } = createService();
      prisma.folder.count.mockResolvedValue(FOLDER_LIMIT - 1);

      await service.createFolder(ME, 'x');

      expect(prisma.folder.create).toHaveBeenCalledWith({
        data: { userId: ME, name: 'x' },
      });
    });
  });

  describe('保存の冪等性', () => {
    it('同じフォルダへの重複保存は成功扱いにする', async () => {
      const { service, prisma } = createService();
      prisma.bookmark.create.mockRejectedValue(uniqueViolation());

      await expect(
        service.addBookmark(ME, SPOT, FOLDER),
      ).resolves.toBeUndefined();
    });

    it('重複以外のエラーは握りつぶさない', async () => {
      const { service, prisma } = createService();
      prisma.bookmark.create.mockRejectedValue(new Error('connection lost'));

      await expect(service.addBookmark(ME, SPOT, FOLDER)).rejects.toThrow(
        'connection lost',
      );
    });

    it('保存していないものを外しても成功扱いにする', async () => {
      const { service, prisma } = createService();
      prisma.bookmark.deleteMany.mockResolvedValue({ count: 0 });

      await expect(
        service.removeBookmark(ME, SPOT, FOLDER),
      ).resolves.toBeUndefined();
    });

    it('外すときは自分の保存記録だけを対象にする', async () => {
      const { service, prisma } = createService();

      await service.removeBookmark(ME, SPOT, FOLDER);

      expect(prisma.bookmark.deleteMany).toHaveBeenCalledWith({
        where: { userId: ME, spotId: SPOT, folderId: FOLDER },
      });
    });
  });

  describe('存在しないスポット', () => {
    it('保存しようとすると NotFound にする', async () => {
      const { service, prisma } = createService();
      prisma.spot.findUnique.mockResolvedValue(null);

      await expect(service.addBookmark(ME, SPOT, FOLDER)).rejects.toThrow(
        NotFoundException,
      );
      expect(prisma.bookmark.create).not.toHaveBeenCalled();
    });
  });

  describe('myFolders', () => {
    it('フォルダが無ければ保存記録を問い合わせない', async () => {
      const { service, prisma } = createService();

      await expect(service.myFolders(ME)).resolves.toEqual([]);
      expect(prisma.bookmark.groupBy).not.toHaveBeenCalled();
    });

    it('自分のフォルダだけを取得する', async () => {
      const { service, prisma } = createService();

      await service.myFolders(ME);

      expect(prisma.folder.findMany).toHaveBeenCalledWith({
        where: { userId: ME },
      });
    });
  });
});
