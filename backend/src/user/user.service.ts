import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import type { AuthUser } from '../auth/types/auth-user.type';
import {
  SpotConnection,
  SpotEdge,
  PageInfo,
} from '../spot/dto/spot-connection.object';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  findBySupabaseId(supabaseId: string) {
    return this.prisma.user.findUnique({
      where: { supabaseId },
    });
  }

  async getOrCreateUser(authUser: AuthUser) {
    const existingUser = await this.findBySupabaseId(authUser.supabaseId);

    if (existingUser) {
      return existingUser;
    }

    const defaultName = authUser.email.split('@')[0];

    return this.prisma.user.create({
      data: {
        supabaseId: authUser.supabaseId,
        email: authUser.email,
        name: defaultName,
      },
    });
  }

  findById(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
    });
  }

  updateUser(
    id: string,
    data: { name?: string; bio?: string; avatarUrl?: string },
  ) {
    return this.prisma.user.update({
      where: { id },
      data,
    });
  }

  async mySpots(
    userId: string,
    first: number = 20,
    after?: string,
  ): Promise<SpotConnection> {
    const take = first + 1;
    const where: Prisma.SpotWhereInput = { userId };

    if (after) {
      const cursor = this.decodeCursor(after);
      where.createdAt = { lt: new Date(cursor.createdAt) };
    }

    const spots = await this.prisma.spot.findMany({
      where,
      take,
      orderBy: { createdAt: 'desc' },
      include: {
        images: { orderBy: { order: 'asc' } },
        user: true,
        category: true,
      },
    });

    const hasNextPage = spots.length > first;
    const result = hasNextPage ? spots.slice(0, first) : spots;
    const totalCount = await this.prisma.spot.count({ where: { userId } });

    const edges: SpotEdge[] = result.map((spot) => ({
      node: spot,
      cursor: this.encodeCursor(spot.createdAt),
    }));

    const pageInfo: PageInfo = {
      hasNextPage,
      hasPreviousPage: !!after,
      startCursor: edges[0]?.cursor ?? null,
      endCursor: edges[edges.length - 1]?.cursor ?? null,
    };

    return { edges, pageInfo, totalCount };
  }

  async myLikedSpots(
    userId: string,
    first: number = 20,
    after?: string,
  ): Promise<SpotConnection> {
    const take = first + 1;
    const where: Prisma.LikeWhereInput = { userId };

    if (after) {
      const cursor = this.decodeCursor(after);
      where.createdAt = { lt: new Date(cursor.createdAt) };
    }

    const likes = await this.prisma.like.findMany({
      where,
      take,
      orderBy: { createdAt: 'desc' },
      include: {
        spot: {
          include: {
            images: { orderBy: { order: 'asc' } },
            user: true,
            category: true,
          },
        },
      },
    });

    const hasNextPage = likes.length > first;
    const result = hasNextPage ? likes.slice(0, first) : likes;
    const totalCount = await this.prisma.like.count({ where: { userId } });

    const edges: SpotEdge[] = result.map((like) => ({
      node: like.spot,
      cursor: this.encodeCursor(like.createdAt),
    }));

    const pageInfo: PageInfo = {
      hasNextPage,
      hasPreviousPage: !!after,
      startCursor: edges[0]?.cursor ?? null,
      endCursor: edges[edges.length - 1]?.cursor ?? null,
    };

    return { edges, pageInfo, totalCount };
  }

  private encodeCursor(createdAt: Date): string {
    return Buffer.from(
      JSON.stringify({ createdAt: createdAt.toISOString() }),
    ).toString('base64');
  }

  private decodeCursor(cursor: string): { createdAt: string } {
    try {
      return JSON.parse(Buffer.from(cursor, 'base64').toString('utf-8'));
    } catch {
      throw new Error('Invalid cursor');
    }
  }
}
