import { InputType, Field, registerEnumType } from '@nestjs/graphql';
import { IsEnum, IsOptional } from 'class-validator';

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

/**
 * sort 引数ごと省略されたとき、ValidationPipe は空のインスタンスを作って検証する。
 * 各フィールドは GraphQL 側の defaultValue で埋まる前提なので、
 * 値が無い場合は検証をスキップする
 */
@InputType()
export class SpotSortInput {
  @Field(() => SpotSortBy, { defaultValue: SpotSortBy.CREATED_AT })
  @IsOptional()
  @IsEnum(SpotSortBy, { message: 'ソート対象の指定が不正です' })
  sortBy: SpotSortBy;

  @Field(() => SortOrder, { defaultValue: SortOrder.DESC })
  @IsOptional()
  @IsEnum(SortOrder, { message: 'ソート順序の指定が不正です' })
  order: SortOrder;
}
