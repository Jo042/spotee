// src/user/user.resolver.ts

import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { User } from './dto/user.object';
import { GqlAuthGuard } from '../auth/auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { AuthUser } from 'src/auth/types/auth-user.type';

@Resolver(() => User)
export class UserResolver {
  constructor(private userService: UserService) {}

  @Query(() => User, { name: 'me' })
  @UseGuards(GqlAuthGuard)
  async getMe(@CurrentUser() authUser: AuthUser): Promise<User> {
    const user = await this.userService.getOrCreateUser(authUser);
    return user;
  }

  @Query(() => User, { name: 'user', nullable: true })
  getUser(@Args('id') id: string): Promise<User | null> {
    return this.userService.findById(id);
  }

  @Mutation(() => User)
  @UseGuards(GqlAuthGuard)
  async updateProfile(
    @CurrentUser() authUser: AuthUser,
    @Args('name', { nullable: true }) name?: string,
    @Args('bio', { nullable: true }) bio?: string,
    @Args('avatarUrl', { nullable: true }) avatarUrl?: string,
  ): Promise<User> {
    const user = await this.userService.getOrCreateUser(authUser);

    const updateData: { name?: string; bio?: string; avatarUrl?: string } = {};
    if (name !== undefined) updateData.name = name;
    if (bio !== undefined) updateData.bio = bio;
    if (avatarUrl !== undefined) updateData.avatarUrl = avatarUrl;

    return this.userService.updateUser(user.id, updateData);
  }
}
