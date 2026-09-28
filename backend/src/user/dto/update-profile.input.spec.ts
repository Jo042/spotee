import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { UpdateProfileInput } from './update-profile.input';

const HOST = 'zvgymgxcmxupxhscnlfo.supabase.co';
const AVATAR = `https://${HOST}/storage/v1/object/public/avatars/me.jpg`;

async function failedProperties(
  input: Record<string, unknown>,
): Promise<string[]> {
  const errors = await validate(plainToInstance(UpdateProfileInput, input));
  return errors.map((e) => e.property).sort();
}

beforeAll(() => {
  process.env.SUPABASE_URL = `https://${HOST}`;
});

describe('UpdateProfileInput', () => {
  it('空の入力でも通る（全フィールドが任意）', async () => {
    expect(await failedProperties({})).toEqual([]);
  });

  it('全項目を正しく埋めれば通る', async () => {
    expect(
      await failedProperties({
        name: 'たなか',
        bio: 'よろしく',
        avatarUrl: AVATAR,
      }),
    ).toEqual([]);
  });

  describe('名前', () => {
    it('50文字なら通る', async () => {
      expect(await failedProperties({ name: 'あ'.repeat(50) })).toEqual([]);
    });

    it('51文字なら落ちる', async () => {
      expect(await failedProperties({ name: 'あ'.repeat(51) })).toContain(
        'name',
      );
    });

    it('空文字なら落ちる', async () => {
      expect(await failedProperties({ name: '' })).toContain('name');
    });

    it('空白だけなら落ちる', async () => {
      expect(await failedProperties({ name: '   ' })).toContain('name');
    });
  });

  describe('自己紹介', () => {
    it('200文字なら通る', async () => {
      expect(await failedProperties({ bio: 'あ'.repeat(200) })).toEqual([]);
    });

    it('201文字なら落ちる', async () => {
      expect(await failedProperties({ bio: 'あ'.repeat(201) })).toContain(
        'bio',
      );
    });
  });

  describe('アバター画像URL', () => {
    it('外部ドメインは落ちる', async () => {
      expect(
        await failedProperties({ avatarUrl: 'https://evil.com/me.jpg' }),
      ).toContain('avatarUrl');
    });

    it('スポット用バケットのURLは落ちる', async () => {
      expect(
        await failedProperties({
          avatarUrl: `https://${HOST}/storage/v1/object/public/spots/a.jpg`,
        }),
      ).toContain('avatarUrl');
    });

    it('userinfo にホスト名を置いたURLは落ちる', async () => {
      expect(
        await failedProperties({
          avatarUrl: `https://${HOST}@evil.com/me.jpg`,
        }),
      ).toContain('avatarUrl');
    });
  });
});
