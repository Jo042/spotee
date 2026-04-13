import {
  Injectable,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateSpotInput } from './dto/create-spot.input';
import { UpdateSpotInput } from './dto/update-spot.input';
import { SpotSortBy, SortOrder, SpotSortInput } from './dto/spot-filter.input';
import {
  SpotConnection,
  SpotEdge,
  PageInfo,
} from './dto/spot-connection.object';

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
      include: {
        images: true,
        user: true,
        category: true,
        attributeTags: { include: { tag: true } },
        moodTags: { include: { tag: true } },
      },
    });
  }

  async findById(id: string) {
    const spot = await this.prisma.spot.findUnique({
      where: { id },
      include: {
        images: { orderBy: { order: 'asc' } },
        user: true,
        category: true,
        attributeTags: { include: { tag: true } },
        moodTags: { include: { tag: true } },
      },
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
        include: {
          images: { orderBy: { order: 'asc' } },
          user: true,
          category: true,
          attributeTags: { include: { tag: true } },
          moodTags: { include: { tag: true } },
        },
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
  ): Promise<SpotConnection> {
    const sortBy = sort?.sortBy ?? SpotSortBy.CREATED_AT;
    const order = sort?.order ?? SortOrder.DESC;

    const orderBy = this.buildOrderBy(sortBy, order);
    const cursorCondition = after
      ? this.buildCursorCondition(after, sortBy, order)
      : {};

    const take = first + 1;

    const spots = await this.prisma.spot.findMany({
      where: cursorCondition,
      take,
      orderBy,
      include: {
        images: { orderBy: { order: 'asc' } },
        user: true,
        category: true,
      },
    });

    const hasNextPage = spots.length > first;

    const resultSpots = hasNextPage ? spots.slice(0, first) : spots;

    const edges: SpotEdge[] = resultSpots.map((spot) => ({
      node: spot,
      cursor: this.encodeCursor(spot, sortBy),
    }));

    const totalCount = await this.prisma.spot.count();

    const pageInfo: PageInfo = {
      hasNextPage,
      hasPreviousPage: !!after,
      startCursor: edges.length > 0 ? edges[0].cursor : null,
      endCursor: edges.length > 0 ? edges[edges.length - 1].cursor : null,
    };

    return {
      edges,
      pageInfo,
      totalCount,
    };
  }

  /**
   * カーソル条件を構築
   */
  private buildCursorCondition(
    cursor: string,
    sortBy: SpotSortBy,
    order: SortOrder,
  ) {
    const cursorData = this.decodeCursor(cursor);
    const operator = order === SortOrder.DESC ? 'lt' : 'gt';

    switch (sortBy) {
      case SpotSortBy.LIKE_COUNT:
        // いいね順: likeCount で比較、同数なら createdAt で比較
        return {
          OR: [
            { likeCount: { [operator]: cursorData.likeCount } },
            {
              likeCount: cursorData.likeCount,
              createdAt: { lt: new Date(cursorData.createdAt) },
            },
          ],
        };
      case SpotSortBy.TITLE:
        return { title: { [operator]: cursorData.title } };
      case SpotSortBy.CREATED_AT:
      default:
        return { createdAt: { [operator]: new Date(cursorData.createdAt) } };
    }
  }

  /**
   * ソート条件に応じた orderBy を構築
   */
  private buildOrderBy(sortBy: SpotSortBy, order: SortOrder) {
    switch (sortBy) {
      case SpotSortBy.LIKE_COUNT:
        // いいね順の場合、同数なら新着順
        return [{ likeCount: order }, { createdAt: 'desc' as const }];
      case SpotSortBy.TITLE:
        return [{ title: order }];
      case SpotSortBy.CREATED_AT:
      default:
        return [{ createdAt: order }];
    }
  }

  /**
   * カーソルをエンコード（ソート条件に応じた値を含める）
   */
  private encodeCursor(spot: any, sortBy: SpotSortBy): string {
    const data: any = {
      id: spot.id,
      createdAt: spot.createdAt.toISOString(),
    };

    // ソート対象の値もカーソルに含める
    if (sortBy === SpotSortBy.LIKE_COUNT) {
      data.likeCount = spot.likeCount;
    }
    if (sortBy === SpotSortBy.TITLE) {
      data.title = spot.title;
    }

    return Buffer.from(JSON.stringify(data)).toString('base64');
  }

  /**
   * カーソルをデコード
   */
  private decodeCursor(cursor: string): any {
    try {
      return JSON.parse(Buffer.from(cursor, 'base64').toString('utf-8'));
    } catch {
      throw new Error('Invalid cursor');
    }
  }
}
