import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { SpotService } from './spot.service';
import { UserService } from '../user/user.service';
import { Spot } from './dto/spot.object';
import { CreateSpotInput } from './dto/create-spot.input';
import { UpdateSpotInput } from './dto/update-spot.input';
import { GqlAuthGuard } from '../auth/auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { AuthUser } from 'src/auth/types/auth-user.type';

@Resolver(() => Spot)
export class SpotResolver {
  constructor(
    private spotService: SpotService,
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
}
