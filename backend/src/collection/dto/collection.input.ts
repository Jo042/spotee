import { InputType, Field, ID } from '@nestjs/graphql';
import { Transform, Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  ArrayUnique,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { IsStorageImageUrl } from '../../common/validation/is-storage-image-url.decorator';
import {
  COLLECTION_COMMENT_MAX_LENGTH,
  COLLECTION_DESCRIPTION_MAX_LENGTH,
  COLLECTION_SPOTS_MAX,
  COLLECTION_SPOTS_MIN,
  COLLECTION_TITLE_MAX_LENGTH,
} from './collection-input.constants';

const trim = ({ value }: { value: unknown }) =>
  typeof value === 'string' ? value.trim() : value;

@InputType()
export class CollectionSpotInput {
  @Field(() => ID)
  @IsUUID('4', { message: 'スポットの指定が不正です' })
  spotId: string;

  @Field(() => String, { nullable: true })
  @Transform(trim)
  @IsOptional()
  @IsString()
  @MaxLength(COLLECTION_COMMENT_MAX_LENGTH, {
    message: `添え書きは${COLLECTION_COMMENT_MAX_LENGTH}文字以内で入力してください`,
  })
  comment?: string | null;
}

/** 作成と更新で共通。更新は全項目の置き換えとして扱う */
@InputType()
export class CollectionInput {
  @Field()
  @Transform(trim)
  @IsString()
  @IsNotEmpty({ message: 'タイトルを入力してください' })
  @MaxLength(COLLECTION_TITLE_MAX_LENGTH, {
    message: `タイトルは${COLLECTION_TITLE_MAX_LENGTH}文字以内で入力してください`,
  })
  title: string;

  @Field(() => String, { nullable: true })
  @Transform(trim)
  @IsOptional()
  @IsString()
  @MaxLength(COLLECTION_DESCRIPTION_MAX_LENGTH, {
    message: `説明は${COLLECTION_DESCRIPTION_MAX_LENGTH}文字以内で入力してください`,
  })
  description?: string | null;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsStorageImageUrl('spots')
  coverImageUrl?: string | null;

  @Field(() => [CollectionSpotInput])
  @ArrayMinSize(COLLECTION_SPOTS_MIN, {
    message: 'スポットを1件以上選んでください',
  })
  @ArrayMaxSize(COLLECTION_SPOTS_MAX, {
    message: `スポットは${COLLECTION_SPOTS_MAX}件まで選べます`,
  })
  @ArrayUnique((spot: CollectionSpotInput) => spot.spotId, {
    message: '同じスポットが重複しています',
  })
  @ValidateNested({ each: true })
  @Type(() => CollectionSpotInput)
  spots: CollectionSpotInput[];
}
