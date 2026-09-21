import { Injectable, Scope } from '@nestjs/common';
import DataLoader from 'dataloader';
import { PrismaService } from '../../prisma/prisma.service';
import { alignCounts } from '../user/user-loader.util';

@Injectable({ scope: Scope.REQUEST })
export class FollowLoader {
  constructor(private prisma: PrismaService) {}

  /** そのユーザーをフォローしている人数 */
  readonly followersCountLoader = new DataLoader<string, number>(
    async (userIds) => {
      const rows = await this.prisma.follow.groupBy({
        by: ['followingId'],
        where: { followingId: { in: [...userIds] } },
        _count: { _all: true },
      });

      return alignCounts(
        userIds,
        rows,
        (row) => row.followingId,
        (row) => row._count._all,
      );
    },
  );

  /** そのユーザーがフォローしている人数 */
  readonly followingCountLoader = new DataLoader<string, number>(
    async (userIds) => {
      const rows = await this.prisma.follow.groupBy({
        by: ['followerId'],
        where: { followerId: { in: [...userIds] } },
        _count: { _all: true },
      });

      return alignCounts(
        userIds,
        rows,
        (row) => row.followerId,
        (row) => row._count._all,
      );
    },
  );

  // key format: "${supabaseId}:${targetUserId}"
  readonly isFollowingLoader = new DataLoader<string, boolean>(async (keys) => {
    const pairs = keys.map((k) => {
      const idx = k.indexOf(':');
      return { supabaseId: k.slice(0, idx), targetUserId: k.slice(idx + 1) };
    });

    const supabaseId = pairs[0].supabaseId;
    const targetUserIds = pairs.map((p) => p.targetUserId);

    const viewer = await this.prisma.user.findUnique({
      where: { supabaseId },
      select: { id: true },
    });

    if (!viewer) return keys.map(() => false);

    const follows = await this.prisma.follow.findMany({
      where: { followerId: viewer.id, followingId: { in: targetUserIds } },
      select: { followingId: true },
    });

    const followingSet = new Set(follows.map((f) => f.followingId));
    return pairs.map((p) => followingSet.has(p.targetUserId));
  });
}
