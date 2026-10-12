import { Resolver, ResolveField, Parent, Int } from '@nestjs/graphql';
import { CollectionConnection } from './dto/collection-connection.object';
import type { CollectionConnectionSource } from './dto/collection-connection.object';

@Resolver(() => CollectionConnection)
export class CollectionConnectionResolver {
  @ResolveField(() => Int)
  totalCount(
    @Parent() connection: CollectionConnectionSource,
  ): Promise<number> {
    return connection.countTotal();
  }
}
