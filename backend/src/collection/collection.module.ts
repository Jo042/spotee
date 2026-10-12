import { Module } from '@nestjs/common';
import { CollectionService } from './collection.service';
import { CollectionLoader } from './collection.loader';
import { CollectionResolver } from './collection.resolver';
import { CollectionConnectionResolver } from './collection-connection.resolver';
import { UserModule } from '../user/user.module';
import { SpotModule } from '../spot/spot.module';

@Module({
  imports: [UserModule, SpotModule],
  providers: [
    CollectionService,
    CollectionLoader,
    CollectionResolver,
    CollectionConnectionResolver,
  ],
})
export class CollectionModule {}
