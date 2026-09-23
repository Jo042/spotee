import { InputType, Field, ID, Float } from '@nestjs/graphql';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsEnum,
  IsLatitude,
  IsLongitude,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';
import { PriceRange } from './spot.object';
import { IsSpotImageUrl } from '../../common/validation/is-spot-image-url.decorator';
import {
  TITLE_MAX_LENGTH,
  DESCRIPTION_MAX_LENGTH,
  ADDRESS_MAX_LENGTH,
  BUSINESS_HOURS_MAX_LENGTH,
  IMAGES_MIN,
  IMAGES_MAX,
  TAG_IDS_MAX,
} from './spot-input.constants';

/** 全フィールドが任意。IsOptional で「値が来たときだけ検証する」形にする */
@InputType()
export class UpdateSpotInput {
  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: 'タイトルを入力してください' })
  @MaxLength(TITLE_MAX_LENGTH, {
    message: `タイトルは${TITLE_MAX_LENGTH}文字以内で入力してください`,
  })
  title?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(DESCRIPTION_MAX_LENGTH, {
    message: `説明は${DESCRIPTION_MAX_LENGTH}文字以内で入力してください`,
  })
  description?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: '住所を入力してください' })
  @MaxLength(ADDRESS_MAX_LENGTH, {
    message: `住所は${ADDRESS_MAX_LENGTH}文字以内で入力してください`,
  })
  address?: string;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsLatitude({ message: '緯度は -90 から 90 の範囲で指定してください' })
  latitude?: number;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsLongitude({ message: '経度は -180 から 180 の範囲で指定してください' })
  longitude?: number;

  @Field(() => PriceRange, { nullable: true })
  @IsOptional()
  @IsEnum(PriceRange, { message: '価格帯の指定が不正です' })
  priceRange?: PriceRange;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(BUSINESS_HOURS_MAX_LENGTH, {
    message: `営業時間は${BUSINESS_HOURS_MAX_LENGTH}文字以内で入力してください`,
  })
  businessHours?: string;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsUUID('4', { message: 'カテゴリの指定が不正です' })
  categoryId?: string;

  @Field(() => [String], { nullable: true })
  @IsOptional()
  @ArrayMinSize(IMAGES_MIN, { message: '画像を1枚以上選択してください' })
  @ArrayMaxSize(IMAGES_MAX, { message: `画像は${IMAGES_MAX}枚までです` })
  @IsSpotImageUrl({ each: true })
  imageUrls?: string[];

  @Field(() => [ID], { nullable: true })
  @IsOptional()
  @ArrayMaxSize(TAG_IDS_MAX, { message: `属性タグは${TAG_IDS_MAX}件までです` })
  @IsUUID('4', { each: true, message: '属性タグの指定が不正です' })
  attributeTagIds?: string[];

  @Field(() => [ID], { nullable: true })
  @IsOptional()
  @ArrayMaxSize(TAG_IDS_MAX, {
    message: `ムードタグは${TAG_IDS_MAX}件までです`,
  })
  @IsUUID('4', { each: true, message: 'ムードタグの指定が不正です' })
  moodTagIds?: string[];
}
