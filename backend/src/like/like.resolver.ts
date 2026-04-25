import { Resolver, Mutation, Args, ID } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { LikeService } from './like.service';
import { LikeResult } from './dto/like-result.object';
import { UserService } from '../user/user.service';
import { GqlAuthGuard } from '../auth/auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { AuthUser } from '../auth/types/auth-user.type';

@Resolver()
export class LikeResolver {
  constructor(
    private likeService: LikeService,
    private userService: UserService,
  ) {}

  @Mutation(() => LikeResult)
  @UseGuards(GqlAuthGuard)
  async toggleLike(
    @Args('spotId', { type: () => ID }) spotId: string,
    @CurrentUser() authUser: AuthUser,
  ): Promise<LikeResult> {
    const user = await this.userService.getOrCreateUser(authUser);
    return this.likeService.toggleLike(user.id, spotId);
  }
}
