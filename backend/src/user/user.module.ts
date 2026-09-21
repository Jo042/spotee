import { Module, forwardRef } from '@nestjs/common';
import { UserService } from './user.service';
import { UserResolver } from './user.resolver';
import { UserLoader } from './user.loader';
import { UserConnectionResolver } from './user-connection.resolver';
import { FollowModule } from '../follow/follow.module';

@Module({
  imports: [forwardRef(() => FollowModule)],
  providers: [UserService, UserResolver, UserConnectionResolver, UserLoader],
  exports: [UserService],
})
export class UserModule {}
