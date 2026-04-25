import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { LikeResult } from './dto/like-result.object';

@Injectable()
export class LikeService {
  constructor(private prisma: PrismaService) {}

  async toggleLike(userId: string, spotId: string): Promise<LikeResult> {
    const spot = await this.prisma.spot.findUnique({
      where: { id: spotId },
      select: { id: true, likeCount: true },
    });

    if (!spot) {
      throw new NotFoundException(`Spot with id ${spotId} not found`);
    }

    return this.prisma.$transaction(async (tx) => {
      const existingLike = await tx.like.findUnique({
        where: { userId_spotId: { userId, spotId } },
      });

      if (existingLike) {
        await tx.like.delete({ where: { id: existingLike.id } });
        const updated = await tx.spot.update({
          where: { id: spotId },
          data: { likeCount: { decrement: 1 } },
          select: { likeCount: true },
        });
        return { liked: false, likeCount: Math.max(0, updated.likeCount) };
      }

      await tx.like.create({ data: { userId, spotId } });
      const updated = await tx.spot.update({
        where: { id: spotId },
        data: { likeCount: { increment: 1 } },
        select: { likeCount: true },
      });
      return { liked: true, likeCount: updated.likeCount };
    });
  }

  async isLiked(userId: string, spotId: string): Promise<boolean> {
    const like = await this.prisma.like.findUnique({
      where: { userId_spotId: { userId, spotId } },
      select: { id: true },
    });
    return like !== null;
  }

  async getLikedSpotIdsByUser(userId: string): Promise<string[]> {
    const likes = await this.prisma.like.findMany({
      where: { userId },
      select: { spotId: true },
    });
    return likes.map((l) => l.spotId);
  }
}
