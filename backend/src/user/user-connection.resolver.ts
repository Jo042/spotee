import { Resolver, ResolveField, Parent, Int } from '@nestjs/graphql';
import { UserConnection } from './dto/user-connection.object';
import type { UserConnectionSource } from './dto/user-connection.object';

@Resolver(() => UserConnection)
export class UserConnectionResolver {
  @ResolveField(() => Int)
  async totalCount(
    @Parent() connection: UserConnectionSource,
  ): Promise<number> {
    return connection.countTotal();
  }
}
