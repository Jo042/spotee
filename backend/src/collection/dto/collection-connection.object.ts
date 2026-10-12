import { ObjectType, Field, Int } from '@nestjs/graphql';
import { Collection, type CollectionNode } from './collection.object';
import { PageInfo } from '../../common/dto/page-info.object';

@ObjectType()
export class CollectionEdge {
  @Field(() => Collection)
  node: CollectionNode;

  @Field()
  cursor: string;
}

@ObjectType()
export class CollectionConnection {
  @Field(() => [CollectionEdge])
  edges: CollectionEdge[];

  @Field(() => PageInfo)
  pageInfo: PageInfo;

  @Field(() => Int)
  totalCount: number;
}

export type CollectionConnectionSource = Omit<
  CollectionConnection,
  'totalCount'
> & {
  countTotal: () => Promise<number>;
};
