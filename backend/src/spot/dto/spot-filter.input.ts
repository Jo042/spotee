import { InputType, Field, ID } from '@nestjs/graphql';

@InputType()
export class SpotFilterInput {
  @Field(() => ID, { nullable: true })
  categoryId?: string;

  @Field(() => [ID], { nullable: true })
  attributeTagIds?: string[];

  @Field(() => [ID], { nullable: true })
  moodTagIds?: string[];

  @Field(() => String, { nullable: true })
  tagSearchMode?: 'AND' | 'OR';

  @Field(() => String, { nullable: true })
  keyword?: string;
}
