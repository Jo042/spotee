import { Injectable, Scope } from '@nestjs/common';
import DataLoader from 'dataloader';
import { PrismaService } from '../../prisma/prisma.service';
import { groupRowsByKey } from '../spot/spot-loader.util';
import { alignCounts } from '../user/user-loader.util';
import type { CollectionSpotItem } from './dto/collection.object';

@Injectable({ scope: Scope.REQUEST })
export class CollectionLoader {
  constructor(private prisma: PrismaService) {}

  readonly spotCountLoader = new DataLoader<string, number>(
    async (collectionIds) => {
      const rows = await this.prisma.collectionSpot.groupBy({
        by: ['collectionId'],
        where: { collectionId: { in: [...collectionIds] } },
        _count: { _all: true },
      });

      return alignCounts(
        collectionIds,
        rows,
        (row) => row.collectionId,
        (row) => row._count._all,
      );
    },
  );

  readonly spotsLoader = new DataLoader<string, CollectionSpotItem[]>(
    async (collectionIds) => {
      const rows = await this.prisma.collectionSpot.findMany({
        where: { collectionId: { in: [...collectionIds] } },
        orderBy: { order: 'asc' },
        include: { spot: true },
      });

      return groupRowsByKey(
        collectionIds,
        rows,
        (row) => row.collectionId,
        (row) => ({ spot: row.spot, comment: row.comment, order: row.order }),
      );
    },
  );
}
