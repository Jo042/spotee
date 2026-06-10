import { Prisma } from '@prisma/client';
import { SpotFilterInput } from './dto/spot-filter.input';
import { TagSearchMode } from './dto/tag-search-mode.enum';

export function buildWhereClause(
  filter?: SpotFilterInput,
): Prisma.SpotWhereInput {
  if (!filter) return {};

  const where: Prisma.SpotWhereInput = {};

  if (filter.categoryIds && filter.categoryIds.length > 0) {
    where.categoryId = { in: filter.categoryIds };
  }

  const mode = filter.tagSearchMode ?? TagSearchMode.OR;

  if (filter.attributeTagIds && filter.attributeTagIds.length > 0) {
    if (mode === TagSearchMode.AND) {
      const conditions = filter.attributeTagIds.map((tagId) => ({
        attributeTags: { some: { tagId } },
      }));
      where.AND = [...((where.AND as object[]) ?? []), ...conditions];
    } else {
      where.attributeTags = {
        some: { tagId: { in: filter.attributeTagIds } },
      };
    }
  }

  if (filter.moodTagIds && filter.moodTagIds.length > 0) {
    if (mode === TagSearchMode.AND) {
      const conditions = filter.moodTagIds.map((tagId) => ({
        moodTags: { some: { tagId } },
      }));
      where.AND = [...((where.AND as object[]) ?? []), ...conditions];
    } else {
      where.moodTags = {
        some: { tagId: { in: filter.moodTagIds } },
      };
    }
  }

  if (filter.keyword) {
    const keywordCondition: Prisma.SpotWhereInput = {
      OR: [
        { title: { contains: filter.keyword, mode: 'insensitive' } },
        { description: { contains: filter.keyword, mode: 'insensitive' } },
      ],
    };
    where.AND = [...((where.AND as object[]) ?? []), keywordCondition];
  }

  return where;
}
