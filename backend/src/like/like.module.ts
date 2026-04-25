import { Module } from '@nestjs/common';
import { LikeService } from './like.service';
import { LikeResolver } from './like.resolver';
import { LikeLoader } from './like.loader';
import { UserModule } from '../user/user.module';

@Module({
  imports: [UserModule],
  providers: [LikeResolver, LikeService, LikeLoader],
  exports: [LikeLoader, LikeService],
})
export class LikeModule {}
