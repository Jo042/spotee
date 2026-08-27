import { Resolver, ResolveField, Parent, Int } from '@nestjs/graphql';
import { SpotConnection } from './dto/spot-connection.object';
import type { SpotConnectionSource } from './dto/spot-connection.object';

@Resolver(() => SpotConnection)
export class SpotConnectionResolver {
  @ResolveField(() => Int)
  async totalCount(@Parent() connection: SpotConnectionSource): Promise<number> {
    return connection.countTotal();
  }
}
