import { ObjectType, Field, ID, Int } from '@nestjs/graphql';

@ObjectType()
export class User {
  @Field(() => ID)
  id: string;

  @Field()
  email: string;

  @Field()
  name: string;

  @Field(() => String, { nullable: true })
  avatarUrl: string | null;

  @Field(() => String, { nullable: true })
  bio: string | null;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;

  @Field(() => Int)
  spotsCount: number;

  @Field(() => Int)
  followersCount: number;

  @Field(() => Int)
  followingCount: number;

  /** 未ログインのときは判定できないため null */
  @Field(() => Boolean, { nullable: true })
  isFollowing?: boolean | null;
}

export type UserNode = Omit<
  User,
  'spotsCount' | 'followersCount' | 'followingCount' | 'isFollowing'
>;
