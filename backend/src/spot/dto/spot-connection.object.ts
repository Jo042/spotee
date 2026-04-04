import { ObjectType, Field, Int } from '@nestjs/graphql';
import { Spot } from './spot.object';

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
  @Field(() => Spot)
  node: Spot;

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
