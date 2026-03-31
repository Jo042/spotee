import { Module } from '@nestjs/common';
import { SpotService } from './spot.service';
import { SpotResolver } from './spot.resolver';
import { UserModule } from '../user/user.module';
import { SpotLoader } from './spot.loader';

@Module({
  imports: [UserModule],
  providers: [SpotResolver, SpotService, SpotLoader],
  exports: [SpotService],
})
export class SpotModule {}
