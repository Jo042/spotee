import { Resolver, ResolveField, Parent, Context, ID } from '@nestjs/graphql';
import { Spot } from '../spot/dto/spot.object';
import { BookmarkLoader } from './bookmark.loader';
import type { AuthUser } from '../auth/types/auth-user.type';

type ViewerContext = { req: { user?: AuthUser } };

/** Spot に閲覧者自身の保存状態を足す。未ログインなら null */
@Resolver(() => Spot)
export class SpotBookmarkResolver {
  constructor(private bookmarkLoader: BookmarkLoader) {}

  @ResolveField(() => Boolean, { nullable: true })
  async isBookmarked(
    @Parent() spot: { id: string },
    @Context() ctx: ViewerContext,
  ): Promise<boolean | null> {
    const folderIds = await this.loadFolderIds(spot.id, ctx);
    return folderIds === null ? null : folderIds.length > 0;
  }

  @ResolveField(() => [ID], { nullable: true })
  async bookmarkFolderIds(
    @Parent() spot: { id: string },
    @Context() ctx: ViewerContext,
  ): Promise<string[] | null> {
    return this.loadFolderIds(spot.id, ctx);
  }

  private loadFolderIds(
    spotId: string,
    ctx: ViewerContext,
  ): Promise<string[]> | null {
    if (!ctx.req.user) return null;
    return this.bookmarkLoader.folderIdsLoader.load(
      `${ctx.req.user.supabaseId}:${spotId}`,
    );
  }
}
