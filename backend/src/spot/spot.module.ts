import { Module } from '@nestjs/common';
import { SpotService } from './spot.service';
import { SpotResolver } from './spot.resolver';

@Module({
  providers: [SpotService, SpotResolver],
})
export class SpotModule {}
