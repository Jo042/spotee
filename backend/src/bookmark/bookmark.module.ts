import { Module } from '@nestjs/common';
import { BookmarkService } from './bookmark.service';
import { BookmarkLoader } from './bookmark.loader';
import { BookmarkResolver } from './bookmark.resolver';
import { FolderResolver } from './folder.resolver';
import { SpotBookmarkResolver } from './spot-bookmark.resolver';
import { UserModule } from '../user/user.module';
import { SpotModule } from '../spot/spot.module';

@Module({
  imports: [UserModule, SpotModule],
  providers: [
    BookmarkService,
    BookmarkLoader,
    BookmarkResolver,
    FolderResolver,
    SpotBookmarkResolver,
  ],
})
export class BookmarkModule {}
