import { ObjectType, Field, ID, Int } from '@nestjs/graphql';
import { User } from '../../user/dto/user.object';
import { Spot, type SpotNode } from '../../spot/dto/spot.object';

/** 特集の中の1件。スポット本体は参照なので、いいね・保存がそのまま効く */
@ObjectType()
export class CollectionSpotItem {
  @Field(() => Spot)
  spot: SpotNode;

  @Field(() => String, { nullable: true })
  comment: string | null;

  @Field(() => Int)
  order: number;
}

/** 特集。画面では「特集」と表示する */
@ObjectType()
export class Collection {
  @Field(() => ID)
  id: string;

  @Field()
  title: string;

  @Field(() => String, { nullable: true })
  description: string | null;

  @Field(() => String, { nullable: true })
  coverImageUrl: string | null;

  /** 一覧のカード用。カバー画像が無ければ、先頭のスポットの1枚目の画像 */
  @Field(() => String, { nullable: true })
  thumbnailUrl: string | null;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;

  @Field(() => User)
  user: User;

  @Field(() => Int)
  spotCount: number;

  @Field(() => [CollectionSpotItem])
  spots: CollectionSpotItem[];
}

export type CollectionNode = Omit<
  Collection,
  'user' | 'spotCount' | 'spots' | 'thumbnailUrl'
> & {
  userId: string;
};
