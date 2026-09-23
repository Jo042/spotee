import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { BookmarkService } from './bookmark.service';
import { UserService } from '../user/user.service';
import { SpotService } from '../spot/spot.service';
import { Folder, type FolderNode } from './dto/folder.object';
import { FolderNameInput } from './dto/folder-name.input';
import { Spot, type SpotNode } from '../spot/dto/spot.object';
import { GqlAuthGuard } from '../auth/auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { AuthUser } from '../auth/types/auth-user.type';

@Resolver()
@UseGuards(GqlAuthGuard)
export class BookmarkResolver {
  constructor(
    private bookmarkService: BookmarkService,
    private userService: UserService,
    private spotService: SpotService,
  ) {}

  @Query(() => [Folder])
  async myFolders(@CurrentUser() authUser: AuthUser): Promise<FolderNode[]> {
    const me = await this.userService.getOrCreateUser(authUser);
    return this.bookmarkService.myFolders(me.id);
  }

  @Query(() => Folder, { nullable: true })
  async folder(
    @CurrentUser() authUser: AuthUser,
    @Args('id', { type: () => ID }) id: string,
  ): Promise<FolderNode | null> {
    const me = await this.userService.getOrCreateUser(authUser);
    return this.bookmarkService.findOwnedFolder(me.id, id);
  }

  @Mutation(() => Folder)
  async createFolder(
    @CurrentUser() authUser: AuthUser,
    @Args('input') input: FolderNameInput,
  ): Promise<FolderNode> {
    const me = await this.userService.getOrCreateUser(authUser);
    return this.bookmarkService.createFolder(me.id, input.name);
  }

  @Mutation(() => Folder)
  async renameFolder(
    @CurrentUser() authUser: AuthUser,
    @Args('id', { type: () => ID }) id: string,
    @Args('input') input: FolderNameInput,
  ): Promise<FolderNode> {
    const me = await this.userService.getOrCreateUser(authUser);
    return this.bookmarkService.renameFolder(me.id, id, input.name);
  }

  /** 削除したフォルダの ID を返す（クライアントがキャッシュから外すため） */
  @Mutation(() => ID)
  async deleteFolder(
    @CurrentUser() authUser: AuthUser,
    @Args('id', { type: () => ID }) id: string,
  ): Promise<string> {
    const me = await this.userService.getOrCreateUser(authUser);
    await this.bookmarkService.deleteFolder(me.id, id);
    return id;
  }

  @Mutation(() => Spot)
  async addBookmark(
    @CurrentUser() authUser: AuthUser,
    @Args('spotId', { type: () => ID }) spotId: string,
    @Args('folderId', { type: () => ID }) folderId: string,
  ): Promise<SpotNode> {
    const me = await this.userService.getOrCreateUser(authUser);
    await this.bookmarkService.addBookmark(me.id, spotId, folderId);
    return this.spotService.findById(spotId);
  }

  @Mutation(() => Spot)
  async removeBookmark(
    @CurrentUser() authUser: AuthUser,
    @Args('spotId', { type: () => ID }) spotId: string,
    @Args('folderId', { type: () => ID }) folderId: string,
  ): Promise<SpotNode> {
    const me = await this.userService.getOrCreateUser(authUser);
    await this.bookmarkService.removeBookmark(me.id, spotId, folderId);
    return this.spotService.findById(spotId);
  }
}
