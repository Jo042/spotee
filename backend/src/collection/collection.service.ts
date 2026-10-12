import {
  BadRequestException,
  Injectable,
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
import type { CollectionInput } from './dto/collection.input';
import type { CollectionNode } from './dto/collection.object';
import type { CollectionConnectionSource } from './dto/collection-connection.object';

@Injectable()
export class CollectionService {
  constructor(private prisma: PrismaService) {}

  findMany(
    first: number = 20,
    after?: string,
    keyword?: string,
  ): Promise<CollectionConnectionSource> {
    return this.connection(
      keyword ? { title: { contains: keyword, mode: 'insensitive' } } : {},
      first,
      after,
    );
  }

  findByUser(
    userId: string,
    first: number = 20,
    after?: string,
  ): Promise<CollectionConnectionSource> {
    return this.connection({ userId }, first, after);
  }

  findById(id: string): Promise<CollectionNode | null> {
    return this.prisma.collection.findUnique({ where: { id } });
  }

  async create(
    userId: string,
    input: CollectionInput,
  ): Promise<CollectionNode> {
    await this.assertOwnSpots(userId, input);

    return this.prisma.collection.create({
      data: {
        userId,
        title: input.title,
        description: input.description || null,
        coverImageUrl: input.coverImageUrl || null,
        spots: { create: toSpotRows(input) },
      },
    });
  }

  /** スポットの並びは差分を取らず、全部消してから送られた順に作り直す */
  async update(
    userId: string,
    id: string,
    input: CollectionInput,
  ): Promise<CollectionNode> {
    await this.requireOwnedCollection(userId, id);
    await this.assertOwnSpots(userId, input);

    return this.prisma.$transaction(async (tx) => {
      await tx.collectionSpot.deleteMany({ where: { collectionId: id } });
      await tx.collectionSpot.createMany({
        data: toSpotRows(input).map((row) => ({ ...row, collectionId: id })),
      });
      return tx.collection.update({
        where: { id },
        data: {
          title: input.title,
          description: input.description || null,
          coverImageUrl: input.coverImageUrl || null,
        },
      });
    });
  }

  async delete(userId: string, id: string): Promise<void> {
    await this.requireOwnedCollection(userId, id);
    await this.prisma.collection.delete({ where: { id } });
  }

  /**
   * 他人の特集も「見つかりません」にする。「権限がありません」と返すと、
   * その ID の特集が存在すること自体が伝わってしまう
   */
  private async requireOwnedCollection(
    userId: string,
    id: string,
  ): Promise<void> {
    const collection = await this.prisma.collection.findFirst({
      where: { id, userId },
      select: { id: true },
    });
    if (!collection) throw new NotFoundException('特集が見つかりません');
  }

  /**
   * 特集に入れられるのは自分の投稿だけ。他人のスポットへ広げるときは、
   * ここの userId の条件を外す
   */
  private async assertOwnSpots(
    userId: string,
    input: CollectionInput,
  ): Promise<void> {
    const spotIds = input.spots.map((spot) => spot.spotId);
    const ownedCount = await this.prisma.spot.count({
      where: { id: { in: spotIds }, userId },
    });
    if (ownedCount !== spotIds.length) {
      throw new BadRequestException(
        '特集に入れられるのは、自分が投稿したスポットだけです',
      );
    }
  }

  private async connection(
    filterWhere: Prisma.CollectionWhereInput,
    first: number,
    after?: string,
  ): Promise<CollectionConnectionSource> {
    const cursorCondition = after
      ? buildCreatedAtCursorCondition(decodeCursor(after), SortOrder.DESC)
      : null;

    const collections = await this.prisma.collection.findMany({
      where: cursorCondition
        ? { AND: [filterWhere, cursorCondition] }
        : filterWhere,
      take: first + 1,
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
    });

    return buildConnection({
      rows: collections,
      first,
      hasPreviousPage: !!after,
      toNode: (collection) => collection,
      toCursor: (collection) => encodeCursor(collection, SpotSortBy.CREATED_AT),
      countTotal: () => this.prisma.collection.count({ where: filterWhere }),
    });
  }
}

/** 配列の順番を、そのまま特集の中の表示順にする */
const toSpotRows = (input: CollectionInput) =>
  input.spots.map((spot, index) => ({
    spotId: spot.spotId,
    order: index,
    comment: spot.comment || null,
  }));
