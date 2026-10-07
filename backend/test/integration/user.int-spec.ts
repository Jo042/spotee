import { createTestApp, type TestApp } from './support/test-app';
import { createUser, resetDatabase } from './support/fixtures';

describe('ユーザーの公開範囲', () => {
  let t: TestApp;

  beforeAll(async () => {
    t = await createTestApp();
  });
  afterAll(() => t.close());
  beforeEach(() => resetDatabase(t.prisma));

  it('他人のユーザー情報から、名前は取得できるがメールアドレスは問い合わせられない', async () => {
    const { user } = await createUser(t.prisma, '他人');

    const withName = await t.graphql<{ user: { name: string } }>(
      `query ($id: ID!) { user(id: $id) { name } }`,
      { variables: { id: user.id } },
    );
    expect(withName.data?.user.name).toBe('他人');

    const withEmail = await t.graphql(
      `query ($id: ID!) { user(id: $id) { name email } }`,
      { variables: { id: user.id } },
    );
    expect(withEmail.data).toBeUndefined();
    expect(withEmail.errors?.[0].extensions?.code).toBe(
      'GRAPHQL_VALIDATION_FAILED',
    );
  });

  it('自分の情報（me）からも、メールアドレスは問い合わせられない', async () => {
    const { token } = await createUser(t.prisma, '自分');

    const res = await t.graphql(`query { me { name email } }`, { token });

    expect(res.data).toBeUndefined();
    expect(res.errors?.[0].extensions?.code).toBe('GRAPHQL_VALIDATION_FAILED');
  });
});
