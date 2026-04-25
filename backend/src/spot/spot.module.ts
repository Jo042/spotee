import { Module } from '@nestjs/common';
import { SpotService } from './spot.service';
import { SpotResolver } from './spot.resolver';
import { UserModule } from '../user/user.module';
import { SpotLoader } from './spot.loader';
import { LikeModule } from '../like/like.module';

@Module({
  imports: [UserModule, LikeModule],
  providers: [SpotResolver, SpotService, SpotLoader],
  exports: [SpotService],
})
export class SpotModule {}
