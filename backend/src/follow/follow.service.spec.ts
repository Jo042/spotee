import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { FollowService } from './follow.service';
import type { PrismaService } from '../../prisma/prisma.service';

const ME = 'user-me';
const OTHER = 'user-other';

type PrismaMock = {
  user: { findUnique: jest.Mock };
  follow: { create: jest.Mock; deleteMany: jest.Mock };
};

const duplicateError = () =>
  new Prisma.PrismaClientKnownRequestError('duplicate', {
    code: 'P2002',
    clientVersion: 'test',
  });

const createService = (overrides: Partial<PrismaMock> = {}) => {
  const prisma: PrismaMock = {
    user: { findUnique: jest.fn().mockResolvedValue({ id: OTHER }) },
    follow: {
      create: jest.fn().mockResolvedValue({}),
      deleteMany: jest.fn().mockResolvedValue({ count: 1 }),
    },
    ...overrides,
  };

  return {
    prisma,
    service: new FollowService(prisma as unknown as PrismaService),
  };
};

describe('FollowService', () => {
  describe('自分自身の扱い', () => {
    it('自分自身はフォローできない', async () => {
      const { service, prisma } = createService();

      await expect(service.follow(ME, ME)).rejects.toThrow(BadRequestException);
      expect(prisma.follow.create).not.toHaveBeenCalled();
    });

    it('自分自身のフォロー解除もできない', async () => {
      const { service, prisma } = createService();

      await expect(service.unfollow(ME, ME)).rejects.toThrow(
        BadRequestException,
      );
      expect(prisma.follow.deleteMany).not.toHaveBeenCalled();
    });
  });

  describe('相手が存在しない場合', () => {
    it('フォローすると NotFoundException になる', async () => {
      const { service } = createService({
        user: { findUnique: jest.fn().mockResolvedValue(null) },
      });

      await expect(service.follow(ME, OTHER)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('フォロー解除すると NotFoundException になる', async () => {
      const { service } = createService({
        user: { findUnique: jest.fn().mockResolvedValue(null) },
      });

      await expect(service.unfollow(ME, OTHER)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('冪等性', () => {
    it('重複フォローは成功扱いにする（P2002 を握る）', async () => {
      const { service } = createService({
        user: { findUnique: jest.fn().mockResolvedValue({ id: OTHER }) },
        follow: {
          create: jest.fn().mockRejectedValue(duplicateError()),
          deleteMany: jest.fn(),
        },
      });

      await expect(service.follow(ME, OTHER)).resolves.toBeUndefined();
    });

    it('P2002 以外のエラーは握りつぶさない', async () => {
      const { service } = createService({
        user: { findUnique: jest.fn().mockResolvedValue({ id: OTHER }) },
        follow: {
          create: jest.fn().mockRejectedValue(new Error('接続エラー')),
          deleteMany: jest.fn(),
        },
      });

      await expect(service.follow(ME, OTHER)).rejects.toThrow('接続エラー');
    });

    it('未フォローの解除も成功扱いにする（deleteMany は0件でも例外にならない）', async () => {
      const { service, prisma } = createService({
        user: { findUnique: jest.fn().mockResolvedValue({ id: OTHER }) },
        follow: {
          create: jest.fn(),
          deleteMany: jest.fn().mockResolvedValue({ count: 0 }),
        },
      });

      await expect(service.unfollow(ME, OTHER)).resolves.toBeUndefined();
      expect(prisma.follow.deleteMany).toHaveBeenCalledWith({
        where: { followerId: ME, followingId: OTHER },
      });
    });
  });

  describe('正常系', () => {
    it('フォローすると Follow を作成する', async () => {
      const { service, prisma } = createService();

      await service.follow(ME, OTHER);

      expect(prisma.follow.create).toHaveBeenCalledWith({
        data: { followerId: ME, followingId: OTHER },
      });
    });
  });
});
