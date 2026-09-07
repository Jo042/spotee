import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import type { AuthUser } from '../auth/types/auth-user.type';
import type { SpotConnectionSource } from '../spot/dto/spot-connection.object';
import { buildConnection } from '../spot/spot-connection.util';
import {
  encodeCursor,
  decodeCursor,
  buildCursorCondition,
  buildCreatedAtCursorCondition,
} from '../spot/spot-cursor.util';
import { SpotSortBy, SortOrder } from '../spot/dto/spot-sort.input';

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

  /**
   * 指定ユーザーの投稿一覧。中身は userId で絞るだけなので、
   * 自分・他人のどちらにも使える（呼び出し側のガードで公開範囲を決める）
   */
  async spotsByUser(
    userId: string,
    first: number = 20,
    after?: string,
  ): Promise<SpotConnectionSource> {
    const filterWhere: Prisma.SpotWhereInput = { userId };
    const cursorCondition = after
      ? buildCursorCondition(
          decodeCursor(after),
          SpotSortBy.CREATED_AT,
          SortOrder.DESC,
        )
      : null;

    const spots = await this.prisma.spot.findMany({
      where: cursorCondition
        ? { AND: [filterWhere, cursorCondition] }
        : filterWhere,
      take: first + 1,
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
    });

    return buildConnection({
      rows: spots,
      first,
      hasPreviousPage: !!after,
      toNode: (spot) => spot,
      toCursor: (spot) => encodeCursor(spot, SpotSortBy.CREATED_AT),
      countTotal: () => this.prisma.spot.count({ where: filterWhere }),
    });
  }

  mySpots(
    userId: string,
    first: number = 20,
    after?: string,
  ): Promise<SpotConnectionSource> {
    return this.spotsByUser(userId, first, after);
  }

  /**
   * いいねしたスポットの一覧。ページングの基準は Like の作成日時なので、
   * カーソルもスポットではなく Like に対して組み立てる
   */
  async myLikedSpots(
    userId: string,
    first: number = 20,
    after?: string,
  ): Promise<SpotConnectionSource> {
    const filterWhere: Prisma.LikeWhereInput = { userId };
    const cursorCondition = after
      ? buildCreatedAtCursorCondition(decodeCursor(after), SortOrder.DESC)
      : null;

    const likes = await this.prisma.like.findMany({
      where: cursorCondition
        ? { AND: [filterWhere, cursorCondition] }
        : filterWhere,
      take: first + 1,
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      include: { spot: true },
    });

    return buildConnection({
      rows: likes,
      first,
      hasPreviousPage: !!after,
      toNode: (like) => like.spot,
      toCursor: (like) => encodeCursor(like, SpotSortBy.CREATED_AT),
      countTotal: () => this.prisma.like.count({ where: filterWhere }),
    });
  }
}
