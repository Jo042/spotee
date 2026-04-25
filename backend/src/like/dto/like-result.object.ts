import { ObjectType, Field, Int } from '@nestjs/graphql';

@ObjectType()
export class LikeResult {
  @Field()
  liked: boolean;

  @Field(() => Int)
  likeCount: number;
}
