import { InputType, Field, ID, Float } from '@nestjs/graphql';
import { PriceRange } from './spot.object';

@InputType()
export class CreateSpotInput {
  @Field()
  title: string;

  @Field(() => String, { nullable: true })
  description?: string;

  @Field()
  address: string;

  @Field(() => Float, { nullable: true })
  latitude?: number;

  @Field(() => Float, { nullable: true })
  longitude?: number;

  @Field(() => PriceRange, { nullable: true })
  priceRange?: PriceRange;

  @Field(() => String, { nullable: true })
  businessHours?: string;

  @Field(() => ID)
  categoryId: string;

  @Field(() => [String])
  imageUrls: string[];

  @Field(() => [ID], { nullable: true })
  attributeTagIds?: string[];

  @Field(() => [ID], { nullable: true })
  moodTagIds?: string[];
}
