import { ObjectType, Field, Int } from '@nestjs/graphql';
import { User } from './user.object';
import type { UserNode } from './user.object';
import { PageInfo } from '../../common/dto/page-info.object';
import type { ConnectionSource } from '../../common/connection.util';

@ObjectType()
export class UserEdge {
  @Field(() => User)
  node: UserNode;

  @Field()
  cursor: string;
}

@ObjectType()
export class UserConnection {
  @Field(() => [UserEdge])
  edges: UserEdge[];

  @Field(() => PageInfo)
  pageInfo: PageInfo;

  @Field(() => Int)
  totalCount: number;
}

export type UserConnectionSource = ConnectionSource<UserNode>;
