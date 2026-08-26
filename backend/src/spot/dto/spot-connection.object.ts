import { ObjectType, Field, Int } from '@nestjs/graphql';
import { Spot } from './spot.object';
import type { SpotNode } from './spot.object';

@ObjectType()
export class PageInfo {
  @Field()
  hasNextPage: boolean;

  @Field()
  hasPreviousPage: boolean;

  @Field(() => String, { nullable: true })
  startCursor: string | null;

  @Field(() => String, { nullable: true })
  endCursor: string | null;
}

@ObjectType()
export class SpotEdge {
  // GraphQL 上は Spot だが、TS 上はスカラーのみ。
  // リレーションは ResolveField が解決するのでサービス層では持たない
  @Field(() => Spot)
  node: SpotNode;

  @Field()
  cursor: string;
}

@ObjectType()
export class SpotConnection {
  @Field(() => [SpotEdge])
  edges: SpotEdge[];

  @Field(() => PageInfo)
  pageInfo: PageInfo;

  @Field(() => Int)
  totalCount: number;
}
