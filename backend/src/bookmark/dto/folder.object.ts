import { ObjectType, Field, ID, Int } from '@nestjs/graphql';

/**
 * 保存フォルダ。完全非公開なので、持ち主以外には返さない。
 * User や Spot など他の型のフィールドとして公開しないこと
 */
@ObjectType()
export class Folder {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;

  @Field(() => Int)
  spotCount: number;

  @Field(() => String, { nullable: true })
  thumbnailUrl: string | null;
}

export type FolderNode = Omit<Folder, 'spotCount' | 'thumbnailUrl'> & {
  userId: string;
};
