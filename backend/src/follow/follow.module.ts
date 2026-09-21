import { Module, forwardRef } from '@nestjs/common';
import { FollowService } from './follow.service';
import { FollowResolver } from './follow.resolver';
import { FollowLoader } from './follow.loader';
import { UserModule } from '../user/user.module';

@Module({
  imports: [forwardRef(() => UserModule)],
  providers: [FollowResolver, FollowService, FollowLoader],
  exports: [FollowLoader, FollowService],
})
export class FollowModule {}
