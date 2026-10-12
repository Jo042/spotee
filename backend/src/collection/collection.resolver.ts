import {
  Resolver,
  Query,
  Mutation,
  Args,
  ID,
  Int,
  ResolveField,
  Parent,
} from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { CollectionService } from './collection.service';
import { CollectionLoader } from './collection.loader';
import { UserService } from '../user/user.service';
import { SpotLoader } from '../spot/spot.loader';
import { GqlAuthGuard, OptionalGqlAuthGuard } from '../auth/auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { AuthUser } from '../auth/types/auth-user.type';
import { User } from '../user/dto/user.object';
import {
  Collection,
  CollectionSpotItem,
  type CollectionNode,
} from './dto/collection.object';
import { CollectionInput } from './dto/collection.input';
import { CollectionFilterInput } from './dto/collection-filter.input';
import {
  CollectionConnection,
  type CollectionConnectionSource,
} from './dto/collection-connection.object';

@Resolver(() => Collection)
export class CollectionResolver {
  constructor(
    private collectionService: CollectionService,
    private collectionLoader: CollectionLoader,
    private userService: UserService,
    private spotLoader: SpotLoader,
  ) {}

  /** 中のスポットの isLiked などが閲覧者で変わるため OptionalGqlAuthGuard を付ける */
  @Query(() => CollectionConnection)
  @UseGuards(OptionalGqlAuthGuard)
  collections(
    @Args('first', { type: () => Int, nullable: true, defaultValue: 20 })
    first: number,
    @Args('after', { type: () => String, nullable: true }) after?: string,
    @Args('filter', { type: () => CollectionFilterInput, nullable: true })
    filter?: CollectionFilterInput,
  ): Promise<CollectionConnectionSource> {
    return this.collectionService.findMany(first, after, filter?.keyword);
  }

  @Query(() => Collection, { nullable: true })
  @UseGuards(OptionalGqlAuthGuard)
  collection(
    @Args('id', { type: () => ID }) id: string,
  ): Promise<CollectionNode | null> {
    return this.collectionService.findById(id);
  }

  @Query(() => CollectionConnection)
  @UseGuards(GqlAuthGuard)
  async myCollections(
    @CurrentUser() authUser: AuthUser,
    @Args('first', { type: () => Int, nullable: true, defaultValue: 20 })
    first: number,
    @Args('after', { type: () => String, nullable: true }) after?: string,
  ): Promise<CollectionConnectionSource> {
    const me = await this.userService.getOrCreateUser(authUser);
    return this.collectionService.findByUser(me.id, first, after);
  }

  @Mutation(() => Collection)
  @UseGuards(GqlAuthGuard)
  async createCollection(
    @CurrentUser() authUser: AuthUser,
    @Args('input') input: CollectionInput,
  ): Promise<CollectionNode> {
    const me = await this.userService.getOrCreateUser(authUser);
    return this.collectionService.create(me.id, input);
  }

  @Mutation(() => Collection)
  @UseGuards(GqlAuthGuard)
  async updateCollection(
    @CurrentUser() authUser: AuthUser,
    @Args('id', { type: () => ID }) id: string,
    @Args('input') input: CollectionInput,
  ): Promise<CollectionNode> {
    const me = await this.userService.getOrCreateUser(authUser);
    return this.collectionService.update(me.id, id, input);
  }

  /** 削除した特集の ID を返す（クライアントがキャッシュから外すため） */
  @Mutation(() => ID)
  @UseGuards(GqlAuthGuard)
  async deleteCollection(
    @CurrentUser() authUser: AuthUser,
    @Args('id', { type: () => ID }) id: string,
  ): Promise<string> {
    const me = await this.userService.getOrCreateUser(authUser);
    await this.collectionService.delete(me.id, id);
    return id;
  }

  @ResolveField(() => User)
  user(@Parent() collection: CollectionNode): Promise<User> {
    return this.spotLoader.userLoader.load(collection.userId);
  }

  @ResolveField(() => String, { nullable: true })
  thumbnailUrl(@Parent() collection: CollectionNode): Promise<string | null> {
    if (collection.coverImageUrl) {
      return Promise.resolve(collection.coverImageUrl);
    }
    return this.collectionLoader.firstSpotImageLoader.load(collection.id);
  }

  @ResolveField(() => Int)
  spotCount(@Parent() collection: CollectionNode): Promise<number> {
    return this.collectionLoader.spotCountLoader.load(collection.id);
  }

  @ResolveField(() => [CollectionSpotItem])
  spots(@Parent() collection: CollectionNode): Promise<CollectionSpotItem[]> {
    return this.collectionLoader.spotsLoader.load(collection.id);
  }
}
