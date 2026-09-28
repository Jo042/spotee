import { InputType, Field } from '@nestjs/graphql';
import { Transform } from 'class-transformer';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { FOLDER_NAME_MAX_LENGTH } from './folder-input.constants';

@InputType()
export class FolderNameInput {
  @Field()
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsString()
  @IsNotEmpty({ message: 'フォルダ名を入力してください' })
  @MaxLength(FOLDER_NAME_MAX_LENGTH, {
    message: `フォルダ名は${FOLDER_NAME_MAX_LENGTH}文字以内で入力してください`,
  })
  name: string;
}
