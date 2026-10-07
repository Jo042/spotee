import { createTestApp, type TestApp } from './support/test-app';
import { resetDatabase } from './support/fixtures';
import { signToken, signTokenWithUntrustedKey } from './support/test-auth';

const ME = `query { me { id name } }`;
const claims = { sub: 'supabase-user', email: 'someone@example.com' };

describe('JWT の検証', () => {
  let t: TestApp;

  beforeAll(async () => {
    t = await createTestApp();
  });
  afterAll(() => t.close());
  beforeEach(() => resetDatabase(t.prisma));

  it('正しく署名された JWT なら本人として扱う', async () => {
    const res = await t.graphql<{ me: { name: string } }>(ME, {
      token: signToken(claims),
    });

    expect(res.errors).toBeUndefined();
    expect(res.data?.me.name).toBe('someone');
  });

  it('信頼していない鍵で署名された JWT は認証エラーになる', async () => {
    const res = await t.graphql(ME, {
      token: signTokenWithUntrustedKey(claims),
    });

    expect(res.errors?.[0].extensions?.code).toBe('UNAUTHENTICATED');
  });

  it('期限切れの JWT は認証エラーになる', async () => {
    const res = await t.graphql(ME, {
      token: signToken(claims, { expiresInSeconds: -60 }),
    });

    expect(res.errors?.[0].extensions?.code).toBe('UNAUTHENTICATED');
  });
});
