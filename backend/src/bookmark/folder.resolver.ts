import { Resolver, ResolveField, Parent, Args, Int } from '@nestjs/graphql';
import { Folder, type FolderNode } from './dto/folder.object';
import { BookmarkService } from './bookmark.service';
import { BookmarkLoader } from './bookmark.loader';
import { SpotConnection } from '../spot/dto/spot-connection.object';
import type { SpotConnectionSource } from '../spot/dto/spot-connection.object';

@Resolver(() => Folder)
export class FolderResolver {
  constructor(
    private bookmarkService: BookmarkService,
    private bookmarkLoader: BookmarkLoader,
  ) {}

  @ResolveField(() => Int)
  async spotCount(@Parent() folder: FolderNode): Promise<number> {
    return this.bookmarkLoader.spotCountLoader.load(folder.id);
  }

  @ResolveField(() => String, { nullable: true })
  async thumbnailUrl(@Parent() folder: FolderNode): Promise<string | null> {
    return this.bookmarkLoader.thumbnailUrlLoader.load(folder.id);
  }

  @ResolveField(() => SpotConnection)
  async spots(
    @Parent() folder: FolderNode,
    @Args('first', { type: () => Int, nullable: true, defaultValue: 20 })
    first: number,
    @Args('after', { type: () => String, nullable: true }) after?: string,
  ): Promise<SpotConnectionSource> {
    return this.bookmarkService.folderSpots(folder.id, first, after);
  }
}
