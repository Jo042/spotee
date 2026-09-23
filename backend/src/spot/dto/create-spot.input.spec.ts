import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { CreateSpotInput } from './create-spot.input';
import { UpdateSpotInput } from './update-spot.input';

const HOST = 'zvgymgxcmxupxhscnlfo.supabase.co';
const VALID_IMAGE = `https://${HOST}/storage/v1/object/public/spots/a.jpg`;
const CATEGORY_ID = '11111111-1111-4111-8111-111111111111';

const base = {
  title: 'テストスポット',
  address: '東京都渋谷区',
  categoryId: CATEGORY_ID,
  imageUrls: [VALID_IMAGE],
};

/** 検証に失敗したプロパティ名を返す */
async function failedProperties(
  cls: typeof CreateSpotInput | typeof UpdateSpotInput,
  input: Record<string, unknown>,
): Promise<string[]> {
  const errors = await validate(plainToInstance(cls, input));
  return errors.map((e) => e.property).sort();
}

beforeAll(() => {
  process.env.SUPABASE_URL = `https://${HOST}`;
});

describe('CreateSpotInput', () => {
  it('正規の入力は通る', async () => {
    expect(await failedProperties(CreateSpotInput, base)).toEqual([]);
  });

  it('任意項目を埋めても通る', async () => {
    const input = {
      ...base,
      description: '説明',
      latitude: 35.6,
      longitude: 139.7,
      businessHours: '11:00-20:00',
      attributeTagIds: [CATEGORY_ID],
      moodTagIds: [CATEGORY_ID],
    };

    expect(await failedProperties(CreateSpotInput, input)).toEqual([]);
  });

  describe('文字数', () => {
    it('タイトルが101文字なら落ちる', async () => {
      const input = { ...base, title: 'あ'.repeat(101) };
      expect(await failedProperties(CreateSpotInput, input)).toContain('title');
    });

    it('タイトルがちょうど100文字なら通る', async () => {
      const input = { ...base, title: 'あ'.repeat(100) };
      expect(await failedProperties(CreateSpotInput, input)).toEqual([]);
    });

    it('タイトルが空なら落ちる', async () => {
      expect(
        await failedProperties(CreateSpotInput, { ...base, title: '' }),
      ).toContain('title');
    });

    it('説明が3001文字なら落ちる', async () => {
      const input = { ...base, description: 'あ'.repeat(3001) };
      expect(await failedProperties(CreateSpotInput, input)).toContain(
        'description',
      );
    });

    it('住所が201文字なら落ちる', async () => {
      const input = { ...base, address: 'あ'.repeat(201) };
      expect(await failedProperties(CreateSpotInput, input)).toContain(
        'address',
      );
    });
  });

  describe('画像URL', () => {
    it('外部ドメインは落ちる', async () => {
      const input = { ...base, imageUrls: ['https://evil.com/x.jpg'] };
      expect(await failedProperties(CreateSpotInput, input)).toContain(
        'imageUrls',
      );
    });

    it('サブドメインを装ったホストも落ちる', async () => {
      const input = { ...base, imageUrls: [`https://${HOST}.evil.com/x.jpg`] };
      expect(await failedProperties(CreateSpotInput, input)).toContain(
        'imageUrls',
      );
    });

    it('1枚でも不正なURLが混ざれば落ちる', async () => {
      const input = {
        ...base,
        imageUrls: [VALID_IMAGE, 'https://evil.com/x.jpg'],
      };
      expect(await failedProperties(CreateSpotInput, input)).toContain(
        'imageUrls',
      );
    });

    it('0枚なら落ちる', async () => {
      expect(
        await failedProperties(CreateSpotInput, { ...base, imageUrls: [] }),
      ).toContain('imageUrls');
    });

    it('6枚なら落ちる', async () => {
      const input = { ...base, imageUrls: Array(6).fill(VALID_IMAGE) };
      expect(await failedProperties(CreateSpotInput, input)).toContain(
        'imageUrls',
      );
    });

    it('5枚なら通る', async () => {
      const input = { ...base, imageUrls: Array(5).fill(VALID_IMAGE) };
      expect(await failedProperties(CreateSpotInput, input)).toEqual([]);
    });
  });

  describe('緯度経度', () => {
    it.each([
      ['latitude', 91],
      ['latitude', -91],
      ['longitude', 181],
      ['longitude', -181],
    ])('%s が %p なら落ちる', async (key, value) => {
      const input = { ...base, [key]: value };
      expect(await failedProperties(CreateSpotInput, input)).toContain(key);
    });

    it.each([
      ['latitude', 90],
      ['latitude', -90],
      ['longitude', 180],
      ['longitude', -180],
    ])('%s が %p なら通る（境界値）', async (key, value) => {
      const input = { ...base, [key]: value };
      expect(await failedProperties(CreateSpotInput, input)).toEqual([]);
    });
  });

  describe('ID', () => {
    it('categoryId が UUID でなければ落ちる', async () => {
      const input = { ...base, categoryId: 'not-a-uuid' };
      expect(await failedProperties(CreateSpotInput, input)).toContain(
        'categoryId',
      );
    });

    it('タグIDが21件なら落ちる', async () => {
      const input = { ...base, attributeTagIds: Array(21).fill(CATEGORY_ID) };
      expect(await failedProperties(CreateSpotInput, input)).toContain(
        'attributeTagIds',
      );
    });
  });
});

describe('UpdateSpotInput', () => {
  it('空の入力でも通る（全フィールドが任意）', async () => {
    expect(await failedProperties(UpdateSpotInput, {})).toEqual([]);
  });

  it('一部だけ指定しても通る', async () => {
    expect(
      await failedProperties(UpdateSpotInput, { title: '新しいタイトル' }),
    ).toEqual([]);
  });

  it('指定した値が不正なら落ちる', async () => {
    expect(
      await failedProperties(UpdateSpotInput, { title: 'あ'.repeat(101) }),
    ).toContain('title');
  });

  it('画像URLを指定するなら検証される', async () => {
    expect(
      await failedProperties(UpdateSpotInput, {
        imageUrls: ['https://evil.com/x.jpg'],
      }),
    ).toContain('imageUrls');
  });
});
