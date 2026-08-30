import { Injectable, Scope } from '@nestjs/common';
import DataLoader from 'dataloader';
import type { AttributeTag, MoodTag, SpotImage } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { groupRowsByKey } from './spot-loader.util';

@Injectable({ scope: Scope.REQUEST })
export class SpotLoader {
  constructor(private prisma: PrismaService) {}

  readonly userLoader = new DataLoader<string, any>(async (userIds) => {
    const users = await this.prisma.user.findMany({
      where: { id: { in: [...userIds] } },
    });

    const userMap = new Map(users.map((user) => [user.id, user]));
    return userIds.map((id) => userMap.get(id) || null);
  });

  readonly categoryLoader = new DataLoader<string, any>(async (categoryIds) => {
    const categories = await this.prisma.category.findMany({
      where: { id: { in: [...categoryIds] } },
    });

    const categoryMap = new Map(categories.map((cat) => [cat.id, cat]));
    return categoryIds.map((id) => categoryMap.get(id) || null);
  });

  readonly imagesLoader = new DataLoader<string, SpotImage[]>(
    async (spotIds) => {
      const images = await this.prisma.spotImage.findMany({
        where: { spotId: { in: [...spotIds] } },
        orderBy: { order: 'asc' },
      });

      return groupRowsByKey(
        spotIds,
        images,
        (image) => image.spotId,
        (image) => image,
      );
    },
  );

  readonly attributeTagsLoader = new DataLoader<string, AttributeTag[]>(
    async (spotIds) => {
      const rows = await this.prisma.spotAttributeTag.findMany({
        where: { spotId: { in: [...spotIds] } },
        include: { tag: true },
        orderBy: { tag: { displayOrder: 'asc' } },
      });

      return groupRowsByKey(
        spotIds,
        rows,
        (row) => row.spotId,
        (row) => row.tag,
      );
    },
  );

  readonly moodTagsLoader = new DataLoader<string, MoodTag[]>(
    async (spotIds) => {
      const rows = await this.prisma.spotMoodTag.findMany({
        where: { spotId: { in: [...spotIds] } },
        include: { tag: true },
        orderBy: { tag: { displayOrder: 'asc' } },
      });

      return groupRowsByKey(
        spotIds,
        rows,
        (row) => row.spotId,
        (row) => row.tag,
      );
    },
  );
}
