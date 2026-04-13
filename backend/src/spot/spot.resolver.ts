import {
  Resolver,
  Query,
  Mutation,
  Args,
  Int,
  ID,
  ResolveField,
  Parent,
} from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { SpotService } from './spot.service';
import { UserService } from '../user/user.service';
import { Spot } from './dto/spot.object';
import { User } from 'src/user/dto/user.object';
import { Category } from 'src/category/dto/category.object';
import { SpotImage } from './dto/spot.object';
import { CreateSpotInput } from './dto/create-spot.input';
import { UpdateSpotInput } from './dto/update-spot.input';
import { GqlAuthGuard } from '../auth/auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { AuthUser } from 'src/auth/types/auth-user.type';
import { SpotLoader } from './spot.loader';
import { SpotConnection } from './dto/spot-connection.object';
import { SpotSortInput } from './dto/spot-filter.input';

@Resolver(() => Spot)
export class SpotResolver {
  constructor(
    private spotService: SpotService,
    private spotLoader: SpotLoader,
    private userService: UserService,
  ) {}

  @Mutation(() => Spot)
  @UseGuards(GqlAuthGuard)
  async createSpot(
    @CurrentUser() authUser: AuthUser,
    @Args('input') input: CreateSpotInput,
  ): Promise<Spot> {
    const user = await this.userService.getOrCreateUser(authUser);
    return this.spotService.create(user.id, input);
  }

  @Query(() => Spot, { name: 'spot', nullable: true })
  async getSpot(
    @Args('id', { type: () => ID }) id: string,
  ): Promise<Spot | null> {
    return this.spotService.findById(id);
  }

  @Query(() => SpotConnection, { name: 'spots' })
  async getSpots(
    @Args('first', { type: () => Int, nullable: true, defaultValue: 20 })
    first: number,
    @Args('after', { type: () => String, nullable: true }) after?: string,
    @Args('sort', { type: () => SpotSortInput, nullable: true })
    sort?: SpotSortInput,
  ): Promise<SpotConnection> {
    return this.spotService.findMany(first, after, sort);
  }

  @Mutation(() => Spot)
  @UseGuards(GqlAuthGuard)
  async updateSpot(
    @CurrentUser() authUser: AuthUser,
    @Args('id', { type: () => ID }) id: string,
    @Args('input') input: UpdateSpotInput,
  ): Promise<Spot> {
    const user = await this.userService.getOrCreateUser(authUser);
    return this.spotService.update(user.id, id, input);
  }

  @Mutation(() => Boolean)
  @UseGuards(GqlAuthGuard)
  async deleteSpot(
    @CurrentUser() authUser: AuthUser,
    @Args('id', { type: () => ID }) id: string,
  ): Promise<boolean> {
    const user = await this.userService.getOrCreateUser(authUser);
    return this.spotService.delete(user.id, id);
  }

  @ResolveField(() => User)
  async user(@Parent() spot: { userId: string }): Promise<User> {
    return this.spotLoader.userLoader.load(spot.userId);
  }

  @ResolveField(() => Category)
  async category(@Parent() spot: { categoryId: string }): Promise<Category> {
    return this.spotLoader.categoryLoader.load(spot.categoryId);
  }

  @ResolveField(() => [SpotImage])
  async images(@Parent() spot: { id: string }): Promise<SpotImage[]> {
    return this.spotLoader.imagesLoader.load(spot.id);
  }
}
