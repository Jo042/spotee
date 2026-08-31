import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserResolver } from './user.resolver';
import { UserLoader } from './user.loader';

@Module({
  providers: [UserService, UserResolver, UserLoader],
  exports: [UserService],
})
export class UserModule {}
