import { randomUUID } from 'node:crypto';
import type { PrismaService } from '../../../prisma/prisma.service';
import { signToken } from './test-auth';

/** マイグレーションの管理表以外を空にする */
export async function resetDatabase(prisma: PrismaService): Promise<void> {
  const tables = await prisma.$queryRaw<{ tablename: string }[]>`
    SELECT tablename FROM pg_tables
    WHERE schemaname = 'public' AND tablename <> '_prisma_migrations'
  `;
  if (tables.length === 0) return;

  const names = tables.map(({ tablename }) => `"public"."${tablename}"`);
  await prisma.$executeRawUnsafe(`TRUNCATE TABLE ${names.join(', ')} CASCADE`);
}

/** ユーザーを作り、その人としてログインした JWT を返す */
export async function createUser(prisma: PrismaService, name: string) {
  const supabaseId = randomUUID();
  const email = `${supabaseId}@example.com`;
  const user = await prisma.user.create({
    data: { supabaseId, email, name },
  });
  return { user, token: signToken({ sub: supabaseId, email }) };
}

export async function createSpot(prisma: PrismaService, userId: string) {
  const category = await prisma.category.upsert({
    where: { slug: 'test' },
    update: {},
    create: { name: 'テスト', slug: 'test' },
  });
  return prisma.spot.create({
    data: {
      title: 'テストのスポット',
      address: '神奈川県横浜市',
      userId,
      categoryId: category.id,
    },
  });
}

export function createFolder(
  prisma: PrismaService,
  userId: string,
  name: string,
) {
  return prisma.folder.create({ data: { userId, name } });
}
