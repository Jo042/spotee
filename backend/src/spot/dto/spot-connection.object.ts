import { ObjectType, Field, Int } from '@nestjs/graphql';
import { Spot } from './spot.object';
import type { SpotNode } from './spot.object';
import { PageInfo } from '../../common/dto/page-info.object';

@ObjectType()
export class SpotEdge {
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

export type SpotConnectionSource = Omit<SpotConnection, 'totalCount'> & {
  countTotal: () => Promise<number>;
};
