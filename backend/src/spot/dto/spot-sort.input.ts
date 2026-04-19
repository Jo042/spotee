import { InputType, Field, registerEnumType } from '@nestjs/graphql';

export enum SpotSortBy {
  LIKE_COUNT = 'likeCount',
  CREATED_AT = 'createdAt',
  TITLE = 'title',
}

registerEnumType(SpotSortBy, {
  name: 'SpotSortBy',
  description: 'スポットのソート対象',
});

export enum SortOrder {
  ASC = 'asc',
  DESC = 'desc',
}

registerEnumType(SortOrder, {
  name: 'SortOrder',
  description: 'ソート順序',
});

@InputType()
export class SpotSortInput {
  @Field(() => SpotSortBy, { defaultValue: SpotSortBy.CREATED_AT })
  sortBy: SpotSortBy;

  @Field(() => SortOrder, { defaultValue: SortOrder.DESC })
  order: SortOrder;
}
