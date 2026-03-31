import { Injectable, Scope } from '@nestjs/common';
import DataLoader from 'dataloader';
import { PrismaService } from '../..//prisma/prisma.service';

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

  readonly imagesLoader = new DataLoader<string, any[]>(async (spotIds) => {
    const images = await this.prisma.spotImage.findMany({
      where: { spotId: { in: [...spotIds] } },
      orderBy: { order: 'asc' },
    });

    const imageMap = new Map<string, any[]>();
    images.forEach((image) => {
      const existing = imageMap.get(image.spotId) || [];
      existing.push(image);
      imageMap.set(image.spotId, existing);
    });

    return spotIds.map((id) => imageMap.get(id) || []);
  });
}
