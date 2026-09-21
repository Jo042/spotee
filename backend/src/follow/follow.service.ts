import {
  Injectable,
  BadRequestException,
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
import type { UserConnectionSource } from '../user/dto/user-connection.object';

@Injectable()
export class FollowService {
  constructor(private prisma: PrismaService) {}

  /**
   * 重複フォローは成功扱いにする。オプティミスティックUIとの相性を優先し、
   * 連打や二重送信でエラーを出さない
   */
  async follow(followerId: string, followingId: string): Promise<void> {
    if (followerId === followingId) {
      throw new BadRequestException('自分自身はフォローできません');
    }

    await this.assertUserExists(followingId);

    try {
      await this.prisma.follow.create({ data: { followerId, followingId } });
    } catch (error) {
      const isDuplicate =
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002';
      if (!isDuplicate) throw error;
    }
  }

  /** 未フォローの解除も成功扱いにする（deleteMany は0件でも例外にならない） */
  async unfollow(followerId: string, followingId: string): Promise<void> {
    if (followerId === followingId) {
      throw new BadRequestException('自分自身はフォローできません');
    }

    await this.assertUserExists(followingId);

    await this.prisma.follow.deleteMany({ where: { followerId, followingId } });
  }

  /** userId をフォローしているユーザーの一覧 */
  followers(
    userId: string,
    first: number = 20,
    after?: string,
  ): Promise<UserConnectionSource> {
    return this.followConnection(
      { followingId: userId },
      'follower',
      first,
      after,
    );
  }

  /** userId がフォローしているユーザーの一覧 */
  following(
    userId: string,
    first: number = 20,
    after?: string,
  ): Promise<UserConnectionSource> {
    return this.followConnection(
      { followerId: userId },
      'following',
      first,
      after,
    );
  }

  /**
   * ページングの基準は Follow の作成日時（フォローした順）。
   * カーソルも相手のユーザーではなく Follow に対して組み立てる
   */
  private async followConnection(
    filterWhere: Prisma.FollowWhereInput,
    relation: 'follower' | 'following',
    first: number,
    after?: string,
  ): Promise<UserConnectionSource> {
    const cursorCondition = after
      ? buildCreatedAtCursorCondition(decodeCursor(after), SortOrder.DESC)
      : null;

    const follows = await this.prisma.follow.findMany({
      where: cursorCondition
        ? { AND: [filterWhere, cursorCondition] }
        : filterWhere,
      take: first + 1,
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      include: { [relation]: true } as { follower: true } | { following: true },
    });

    return buildConnection({
      rows: follows,
      first,
      hasPreviousPage: !!after,
      toNode: (follow) => follow[relation],
      toCursor: (follow) => encodeCursor(follow, SpotSortBy.CREATED_AT),
      countTotal: () => this.prisma.follow.count({ where: filterWhere }),
    });
  }

  private async assertUserExists(userId: string): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true },
    });

    if (!user) {
      throw new NotFoundException(`User with id ${userId} not found`);
    }
  }
}
