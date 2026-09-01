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
import { UserService } from './user.service';
import { User, type UserNode } from './dto/user.object';
import { SpotConnection } from '../spot/dto/spot-connection.object';
import type { SpotConnectionSource } from '../spot/dto/spot-connection.object';
import { GqlAuthGuard, OptionalGqlAuthGuard } from '../auth/auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { AuthUser } from '../auth/types/auth-user.type';
import { UserLoader } from './user.loader';

@Resolver(() => User)
export class UserResolver {
  constructor(
    private userService: UserService,
    private userLoader: UserLoader,
  ) {}

  @Query(() => User, { name: 'me' })
  @UseGuards(GqlAuthGuard)
  async getMe(@CurrentUser() authUser: AuthUser): Promise<UserNode> {
    const user = await this.userService.getOrCreateUser(authUser);
    return user;
  }

  @Query(() => User, { name: 'user', nullable: true })
  getUser(
    @Args('id', { type: () => ID }) id: string,
  ): Promise<UserNode | null> {
    return this.userService.findById(id);
  }

  @Query(() => SpotConnection, { name: 'mySpots' })
  @UseGuards(GqlAuthGuard)
  async getMySpots(
    @CurrentUser() authUser: AuthUser,
    @Args('first', { type: () => Int, nullable: true, defaultValue: 20 })
    first: number,
    @Args('after', { type: () => String, nullable: true }) after?: string,
  ): Promise<SpotConnectionSource> {
    const user = await this.userService.getOrCreateUser(authUser);
    return this.userService.mySpots(user.id, first, after);
  }

  /**
   * 任意ユーザーの投稿一覧。未ログインでも閲覧できるが、Spot.isLiked が
   * viewer 依存のため OptionalGqlAuthGuard が要る（外すと常に null になる）
   */
  @Query(() => SpotConnection, { name: 'userSpots' })
  @UseGuards(OptionalGqlAuthGuard)
  getUserSpots(
    @Args('userId', { type: () => ID }) userId: string,
    @Args('first', { type: () => Int, nullable: true, defaultValue: 20 })
    first: number,
    @Args('after', { type: () => String, nullable: true }) after?: string,
  ): Promise<SpotConnectionSource> {
    return this.userService.spotsByUser(userId, first, after);
  }

  @Query(() => SpotConnection, { name: 'myLikedSpots' })
  @UseGuards(GqlAuthGuard)
  async getMyLikedSpots(
    @CurrentUser() authUser: AuthUser,
    @Args('first', { type: () => Int, nullable: true, defaultValue: 20 })
    first: number,
    @Args('after', { type: () => String, nullable: true }) after?: string,
  ): Promise<SpotConnectionSource> {
    const user = await this.userService.getOrCreateUser(authUser);
    return this.userService.myLikedSpots(user.id, first, after);
  }

  @Mutation(() => User)
  @UseGuards(GqlAuthGuard)
  async updateProfile(
    @CurrentUser() authUser: AuthUser,
    @Args('name', { nullable: true }) name?: string,
    @Args('bio', { nullable: true }) bio?: string,
    @Args('avatarUrl', { nullable: true }) avatarUrl?: string,
  ): Promise<UserNode> {
    const user = await this.userService.getOrCreateUser(authUser);

    const updateData: { name?: string; bio?: string; avatarUrl?: string } = {};
    if (name !== undefined) updateData.name = name;
    if (bio !== undefined) updateData.bio = bio;
    if (avatarUrl !== undefined) updateData.avatarUrl = avatarUrl;

    return this.userService.updateUser(user.id, updateData);
  }

  @ResolveField(() => Int)
  async spotsCount(@Parent() user: { id: string }): Promise<number> {
    return this.userLoader.spotsCountLoader.load(user.id);
  }
}
