import { InputType, Field, ID, Float } from '@nestjs/graphql';
import { PriceRange } from './spot.object';

@InputType()
export class UpdateSpotInput {
  @Field(() => String, { nullable: true })
  title?: string;

  @Field(() => String, { nullable: true })
  description?: string;

  @Field(() => String, { nullable: true })
  address?: string;

  @Field(() => Float, { nullable: true })
  latitude?: number;

  @Field(() => Float, { nullable: true })
  longitude?: number;

  @Field(() => PriceRange, { nullable: true })
  priceRange?: PriceRange;

  @Field(() => String, { nullable: true })
  businessHours?: string;

  @Field(() => ID, { nullable: true })
  categoryId?: string;

  @Field(() => [String], { nullable: true })
  imageUrls?: string[];

  @Field(() => [ID], { nullable: true })
  attributeTagIds?: string[];

  @Field(() => [ID], { nullable: true })
  moodTagIds?: string[];
}
