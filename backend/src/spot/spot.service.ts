import {
  Injectable,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateSpotInput } from './dto/create-spot.input';
import { UpdateSpotInput } from './dto/update-spot.input';

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
}
