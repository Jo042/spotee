import { Resolver, Mutation, Args, ID } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { FollowService } from './follow.service';
import { UserService } from '../user/user.service';
import { User, type UserNode } from '../user/dto/user.object';
import { GqlAuthGuard } from '../auth/auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { AuthUser } from '../auth/types/auth-user.type';

@Resolver()
export class FollowResolver {
  constructor(
    private followService: FollowService,
    private userService: UserService,
  ) {}

  @Mutation(() => User)
  @UseGuards(GqlAuthGuard)
  async followUser(
    @CurrentUser() authUser: AuthUser,
    @Args('userId', { type: () => ID }) userId: string,
  ): Promise<UserNode> {
    const me = await this.userService.getOrCreateUser(authUser);
    await this.followService.follow(me.id, userId);
    return this.requireUser(userId);
  }

  @Mutation(() => User)
  @UseGuards(GqlAuthGuard)
  async unfollowUser(
    @CurrentUser() authUser: AuthUser,
    @Args('userId', { type: () => ID }) userId: string,
  ): Promise<UserNode> {
    const me = await this.userService.getOrCreateUser(authUser);
    await this.followService.unfollow(me.id, userId);
    return this.requireUser(userId);
  }

  private async requireUser(userId: string): Promise<UserNode> {
    const user = await this.userService.findById(userId);
    if (!user) {
      throw new Error(`User with id ${userId} not found`);
    }
    return user;
  }
}
