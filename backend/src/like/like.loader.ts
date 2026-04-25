import { Injectable, Scope } from '@nestjs/common';
import DataLoader from 'dataloader';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable({ scope: Scope.REQUEST })
export class LikeLoader {
  constructor(private prisma: PrismaService) {}

  // key format: "${supabaseId}:${spotId}"
  readonly isLikedLoader = new DataLoader<string, boolean>(async (keys) => {
    const pairs = keys.map((k) => {
      const idx = k.indexOf(':');
      return { supabaseId: k.slice(0, idx), spotId: k.slice(idx + 1) };
    });

    const supabaseId = pairs[0].supabaseId;
    const spotIds = pairs.map((p) => p.spotId);

    const user = await this.prisma.user.findUnique({
      where: { supabaseId },
      select: { id: true },
    });

    if (!user) return keys.map(() => false);

    const likes = await this.prisma.like.findMany({
      where: { userId: user.id, spotId: { in: spotIds } },
      select: { spotId: true },
    });

    const likedSet = new Set(likes.map((l) => l.spotId));
    return pairs.map((p) => likedSet.has(p.spotId));
  });
}
