import { InputType, Field, ID } from '@nestjs/graphql';
import {
  ArrayMaxSize,
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';
import { TagSearchMode } from './tag-search-mode.enum';
import { KEYWORD_MAX_LENGTH, TAG_IDS_MAX } from './spot-input.constants';

@InputType()
export class SpotFilterInput {
  @Field(() => [ID], { nullable: true })
  @IsOptional()
  @ArrayMaxSize(TAG_IDS_MAX)
  @IsUUID('4', { each: true, message: 'カテゴリの指定が不正です' })
  categoryIds?: string[];

  @Field(() => [ID], { nullable: true })
  @IsOptional()
  @ArrayMaxSize(TAG_IDS_MAX)
  @IsUUID('4', { each: true, message: '属性タグの指定が不正です' })
  attributeTagIds?: string[];

  @Field(() => [ID], { nullable: true })
  @IsOptional()
  @ArrayMaxSize(TAG_IDS_MAX)
  @IsUUID('4', { each: true, message: 'ムードタグの指定が不正です' })
  moodTagIds?: string[];

  @Field(() => TagSearchMode, {
    nullable: true,
    defaultValue: TagSearchMode.OR,
  })
  @IsOptional()
  @IsEnum(TagSearchMode, { message: 'タグの検索方法の指定が不正です' })
  tagSearchMode?: TagSearchMode;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(KEYWORD_MAX_LENGTH, {
    message: `検索キーワードは${KEYWORD_MAX_LENGTH}文字以内で入力してください`,
  })
  keyword?: string;
}
