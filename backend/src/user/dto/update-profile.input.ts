import { InputType, Field } from '@nestjs/graphql';
import { IsOptional, IsString, Matches, MaxLength } from 'class-validator';
import { IsStorageImageUrl } from '../../common/validation/is-storage-image-url.decorator';
import { NAME_MAX_LENGTH, BIO_MAX_LENGTH } from './user-input.constants';

/** 全フィールドが任意。IsOptional で「値が来たときだけ検証する」形にする */
@InputType()
export class UpdateProfileInput {
  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  @Matches(/\S/, { message: '名前を入力してください' })
  @MaxLength(NAME_MAX_LENGTH, {
    message: `名前は${NAME_MAX_LENGTH}文字以内で入力してください`,
  })
  name?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(BIO_MAX_LENGTH, {
    message: `自己紹介は${BIO_MAX_LENGTH}文字以内で入力してください`,
  })
  bio?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsStorageImageUrl('avatars')
  avatarUrl?: string;
}
