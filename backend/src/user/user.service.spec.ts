import { Prisma } from '@prisma/client';
import { UserService } from './user.service';
import type { PrismaService } from '../../prisma/prisma.service';

const AUTH_USER = { supabaseId: 'sb-new', email: 'new@example.com' };
const CREATED = { id: 'user-1', supabaseId: 'sb-new', name: 'new' };

type PrismaMock = {
  user: { findUnique: jest.Mock; create: jest.Mock };
};

const uniqueViolation = () =>
  new Prisma.PrismaClientKnownRequestError('duplicate', {
    code: 'P2002',
    clientVersion: 'test',
  });

const createService = () => {
  const prisma: PrismaMock = {
    user: {
      findUnique: jest.fn().mockResolvedValue(null),
      create: jest.fn().mockResolvedValue(CREATED),
    },
  };
  return {
    prisma,
    service: new UserService(prisma as unknown as PrismaService),
  };
};

describe('UserService.getOrCreateUser', () => {
  it('既にいればそのユーザーを返し、作らない', async () => {
    const { service, prisma } = createService();
    prisma.user.findUnique.mockResolvedValue(CREATED);

    await expect(service.getOrCreateUser(AUTH_USER)).resolves.toBe(CREATED);
    expect(prisma.user.create).not.toHaveBeenCalled();
  });

  it('いなければメールアドレスの @ より前を名前にして作る', async () => {
    const { service, prisma } = createService();

    await service.getOrCreateUser(AUTH_USER);

    expect(prisma.user.create).toHaveBeenCalledWith({
      data: { supabaseId: 'sb-new', email: 'new@example.com', name: 'new' },
    });
  });

  it('同時に作られて一意制約違反になったら、先に作られたユーザーを返す', async () => {
    const { service, prisma } = createService();
    prisma.user.findUnique
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(CREATED);
    prisma.user.create.mockRejectedValue(uniqueViolation());

    await expect(service.getOrCreateUser(AUTH_USER)).resolves.toBe(CREATED);
  });

  it('一意制約違反でも、同じ supabaseId のユーザーが見つからなければエラーのまま', async () => {
    // 例: 別の Supabase アカウントが同じメールアドレスで既に登録されている
    const { service, prisma } = createService();
    const error = uniqueViolation();
    prisma.user.create.mockRejectedValue(error);

    await expect(service.getOrCreateUser(AUTH_USER)).rejects.toBe(error);
  });

  it('一意制約違反以外のエラーは握りつぶさない', async () => {
    const { service, prisma } = createService();
    prisma.user.create.mockRejectedValue(new Error('connection lost'));

    await expect(service.getOrCreateUser(AUTH_USER)).rejects.toThrow(
      'connection lost',
    );
    expect(prisma.user.findUnique).toHaveBeenCalledTimes(1);
  });
});
