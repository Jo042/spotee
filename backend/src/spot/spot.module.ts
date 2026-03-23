import { Module } from '@nestjs/common';
import { SpotService } from './spot.service';
import { SpotResolver } from './spot.resolver';
import { UserModule } from '../user/user.module';

@Module({
  imports: [UserModule],
  providers: [SpotResolver, SpotService],
  exports: [SpotService],
})
export class SpotModule {}
