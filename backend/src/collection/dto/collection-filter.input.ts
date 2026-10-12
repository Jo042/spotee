import { InputType, Field } from '@nestjs/graphql';
import { Transform } from 'class-transformer';
import { IsOptional, IsString, MaxLength } from 'class-validator';
import { KEYWORD_MAX_LENGTH } from '../../spot/dto/spot-input.constants';

@InputType()
export class CollectionFilterInput {
  /** タイトルの部分一致 */
  @Field(() => String, { nullable: true })
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsOptional()
  @IsString()
  @MaxLength(KEYWORD_MAX_LENGTH, {
    message: `検索キーワードは${KEYWORD_MAX_LENGTH}文字以内で入力してください`,
  })
  keyword?: string;
}
