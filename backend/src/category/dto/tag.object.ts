import { ObjectType, Field, ID, Int } from '@nestjs/graphql';

@ObjectType()
export class AttributeTag {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;

  @Field()
  slug: string;

  @Field(() => Int)
  displayOrder: number;
}

@ObjectType()
export class MoodTag {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;

  @Field()
  slug: string;

  @Field(() => Int)
  displayOrder: number;
}
