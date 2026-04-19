import { InputType, Field, ID } from '@nestjs/graphql';
import { TagSearchMode } from './tag-search-mode.enum';

@InputType()
export class SpotFilterInput {
  @Field(() => ID, { nullable: true })
  categoryId?: string;

  @Field(() => [ID], { nullable: true })
  attributeTagIds?: string[];

  @Field(() => [ID], { nullable: true })
  moodTagIds?: string[];

  @Field(() => TagSearchMode, { nullable: true, defaultValue: TagSearchMode.OR })
  tagSearchMode?: TagSearchMode;

  @Field(() => String, { nullable: true })
  keyword?: string;
}
