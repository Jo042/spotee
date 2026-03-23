import { ObjectType, Field, ID, Int, Float } from '@nestjs/graphql';
import { User } from '../../user/dto/user.object';
import { Category } from '../../category/dto/category.object';
import { registerEnumType } from '@nestjs/graphql';

@ObjectType()
export class SpotImage {
  @Field(() => ID)
  id: string;

  @Field()
  url: string;

  @Field(() => Int)
  order: number;
}

export enum PriceRange {
  UNDER_1000 = 1,
  RANGE_1000_3000 = 2,
  RANGE_3000_5000 = 3,
  OVER_5000 = 4,
}

registerEnumType(PriceRange, {
  name: 'PriceRange',
  description: '価格帯',
  valuesMap: {
    UNDER_1000: { description: '~1,000円' },
    RANGE_1000_3000: { description: '1,000~3,000円' },
    RANGE_3000_5000: { description: '3,000~5,000円' },
    OVER_5000: { description: '5,000円~' },
  },
});

@ObjectType()
export class Spot {
  @Field(() => ID)
  id: string;

  @Field()
  title: string;

  @Field(() => String, { nullable: true })
  description: string | null;

  @Field()
  address: string;

  @Field(() => Float, { nullable: true })
  latitude: number | null;

  @Field(() => Float, { nullable: true })
  longitude: number | null;

  @Field(() => PriceRange, { nullable: true })
  priceRange: PriceRange | null;

  @Field(() => String, { nullable: true })
  businessHours: string | null;

  @Field(() => Int)
  likeCount: number;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;

  @Field(() => User)
  user: User;

  @Field(() => Category)
  category: Category;

  @Field(() => [SpotImage])
  images: SpotImage[];
}
