import { createTestApp, type TestApp } from './support/test-app';
import { createUser, resetDatabase } from './support/fixtures';

const FOLLOW = `
  mutation ($userId: ID!) { followUser(userId: $userId) { id followersCount } }
`;

describe('フォローの認可', () => {
  let t: TestApp;

  beforeAll(async () => {
    t = await createTestApp();
  });
  afterAll(() => t.close());
  beforeEach(() => resetDatabase(t.prisma));

  it('未ログインではフォローできない', async () => {
    const other = await createUser(t.prisma, '他人');

    const res = await t.graphql(FOLLOW, {
      variables: { userId: other.user.id },
    });

    expect(res.errors?.[0].extensions?.code).toBe('UNAUTHENTICATED');
    expect(await t.prisma.follow.count()).toBe(0);
  });

  it('フォローすると、ログインしている本人がフォローしたことになる', async () => {
    const me = await createUser(t.prisma, '自分');
    const other = await createUser(t.prisma, '他人');

    const res = await t.graphql<{ followUser: { followersCount: number } }>(
      FOLLOW,
      { variables: { userId: other.user.id }, token: me.token },
    );

    expect(res.data?.followUser.followersCount).toBe(1);
    const follows = await t.prisma.follow.findMany();
    expect(follows).toEqual([
      expect.objectContaining({
        followerId: me.user.id,
        followingId: other.user.id,
      }),
    ]);
  });

  it('自分自身はフォローできない', async () => {
    const me = await createUser(t.prisma, '自分');

    const res = await t.graphql(FOLLOW, {
      variables: { userId: me.user.id },
      token: me.token,
    });

    expect(res.errors?.[0].extensions?.code).toBe('BAD_REQUEST');
    expect(await t.prisma.follow.count()).toBe(0);
  });
});
