import {
  Injectable,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { CreateSpotInput } from './dto/create-spot.input';
import { UpdateSpotInput } from './dto/update-spot.input';
import { SpotSortBy, SortOrder, SpotSortInput } from './dto/spot-sort.input';
import { SpotFilterInput } from './dto/spot-filter.input';
import { buildWhereClause } from './spot-filter.util';
import {
  encodeCursor,
  decodeCursor,
  buildCursorCondition,
} from './spot-cursor.util';
import type { SpotConnectionSource } from './dto/spot-connection.object';
import { buildConnection } from './spot-connection.util';

@Injectable()
export class SpotService {
  constructor(private prisma: PrismaService) {}

  create(userId: string, input: CreateSpotInput) {
    const { imageUrls, attributeTagIds, moodTagIds, ...spotData } = input;

    return this.prisma.spot.create({
      data: {
        ...spotData,
        userId,
        images: {
          create: imageUrls.map((url, index) => ({
            url,
            order: index,
          })),
        },
        ...(attributeTagIds && {
          attributeTags: {
            create: attributeTagIds.map((tagId) => ({
              tagId,
            })),
          },
        }),
        ...(moodTagIds && {
          moodTags: {
            create: moodTagIds.map((tagId) => ({
              tagId,
            })),
          },
        }),
      },
    });
  }

  async findById(id: string) {
    const spot = await this.prisma.spot.findUnique({
      where: { id },
    });

    if (!spot) {
      throw new NotFoundException(`Spot with ID ${id} not found`);
    }

    return spot;
  }

  async update(userId: string, id: string, input: UpdateSpotInput) {
    const existingSpot = await this.prisma.spot.findUnique({
      where: { id },
    });

    if (!existingSpot) {
      throw new NotFoundException(`Spot with ID ${id} not found`);
    }

    if (existingSpot.userId !== userId) {
      throw new ForbiddenException('You can only update your own spots');
    }

    const { imageUrls, attributeTagIds, moodTagIds, ...spotData } = input;

    return this.prisma.$transaction(async (tx) => {
      if (imageUrls) {
        await tx.spotImage.deleteMany({ where: { spotId: id } });
        await tx.spotImage.createMany({
          data: imageUrls.map((url, index) => ({
            spotId: id,
            url,
            order: index,
          })),
        });
      }

      if (attributeTagIds) {
        await tx.spotAttributeTag.deleteMany({ where: { spotId: id } });
        await tx.spotAttributeTag.createMany({
          data: attributeTagIds.map((tagId) => ({
            spotId: id,
            tagId,
          })),
        });
      }

      if (moodTagIds) {
        await tx.spotMoodTag.deleteMany({ where: { spotId: id } });
        await tx.spotMoodTag.createMany({
          data: moodTagIds.map((tagId) => ({
            spotId: id,
            tagId,
          })),
        });
      }

      return tx.spot.update({
        where: { id },
        data: spotData,
      });
    });
  }

  async delete(userId: string, id: string): Promise<boolean> {
    const existingSpot = await this.prisma.spot.findUnique({
      where: { id },
    });

    if (!existingSpot) {
      throw new NotFoundException(`Spot with ID ${id} not found`);
    }

    if (existingSpot.userId !== userId) {
      throw new ForbiddenException('You can only delete your own spots');
    }

    await this.prisma.spot.delete({ where: { id } });

    return true;
  }

  /**
   * スポット一覧を取得（Cursor-based ページネーション）
   * @param first 取得件数
   * @param after カーソル
   */
  async findMany(
    first: number = 20,
    after?: string,
    sort?: SpotSortInput,
    filter?: SpotFilterInput,
  ): Promise<SpotConnectionSource> {
    const sortBy = sort?.sortBy ?? SpotSortBy.CREATED_AT;
    const order = sort?.order ?? SortOrder.DESC;

    const orderBy = this.buildOrderBy(sortBy, order);
    const filterWhere = buildWhereClause(filter);
    const cursorCondition = after
      ? buildCursorCondition(decodeCursor(after), sortBy, order)
      : null;

    const where: Prisma.SpotWhereInput = cursorCondition
      ? { AND: [filterWhere, cursorCondition] }
      : filterWhere;

    const take = first + 1;

    const spots = await this.prisma.spot.findMany({
      where,
      take,
      orderBy,
    });

    return buildConnection({
      rows: spots,
      first,
      hasPreviousPage: !!after,
      toNode: (spot) => spot,
      toCursor: (spot) => encodeCursor(spot, sortBy),
      countTotal: () => this.prisma.spot.count({ where: filterWhere }),
    });
  }

  /**
   * ソート条件に応じた orderBy を構築
   */
  private buildOrderBy(sortBy: SpotSortBy, order: SortOrder) {
    switch (sortBy) {
      case SpotSortBy.LIKE_COUNT:
        // いいね順の場合、同数なら新着順
        return [
          { likeCount: order },
          { createdAt: 'desc' as const },
          { id: 'desc' as const },
        ];
      case SpotSortBy.TITLE:
        return [{ title: order }, { id: order }];
      case SpotSortBy.CREATED_AT:
      default:
        return [{ createdAt: order }, { id: order }];
    }
  }
}
