import { Injectable, Scope } from '@nestjs/common';
import DataLoader from 'dataloader';
import { PrismaService } from '../../prisma/prisma.service';
import { alignCounts } from './user-loader.util';

@Injectable({ scope: Scope.REQUEST })
export class UserLoader {
  constructor(private prisma: PrismaService) {}

  readonly spotsCountLoader = new DataLoader<string, number>(
    async (userIds) => {
      const rows = await this.prisma.spot.groupBy({
        by: ['userId'],
        where: { userId: { in: [...userIds] } },
        _count: { _all: true },
      });

      return alignCounts(
        userIds,
        rows,
        (row) => row.userId,
        (row) => row._count._all,
      );
    },
  );
}
