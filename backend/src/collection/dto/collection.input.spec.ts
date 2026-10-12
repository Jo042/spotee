import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { CollectionInput } from './collection.input';

const HOST = 'zvgymgxcmxupxhscnlfo.supabase.co';
const spotId = (n: number) =>
  `11111111-1111-4111-8111-${String(n).padStart(12, '0')}`;
const spots = (count: number) =>
  Array.from({ length: count }, (_, i) => ({ spotId: spotId(i) }));

const base = {
  title: '雨の日の横浜デート',
  spots: spots(3),
};

/** 検証に失敗したプロパティ名を返す */
async function failedProperties(
  input: Record<string, unknown>,
): Promise<string[]> {
  const errors = await validate(plainToInstance(CollectionInput, input));
  return errors.map((e) => e.property).sort();
}

beforeAll(() => {
  process.env.SUPABASE_URL = `https://${HOST}`;
});

describe('CollectionInput', () => {
  it('正規の入力は通る', async () => {
    const input = {
      ...base,
      description: '説明',
      coverImageUrl: `https://${HOST}/storage/v1/object/public/spots/a.jpg`,
      spots: [{ spotId: spotId(0), comment: '窓際の席がおすすめ' }],
    };

    expect(await failedProperties(input)).toEqual([]);
  });

  describe('スポットの件数と重複', () => {
    it('0件なら落ちる', async () => {
      expect(await failedProperties({ ...base, spots: [] })).toEqual(['spots']);
    });

    it('30件なら通り、31件なら落ちる', async () => {
      expect(await failedProperties({ ...base, spots: spots(30) })).toEqual([]);
      expect(await failedProperties({ ...base, spots: spots(31) })).toEqual([
        'spots',
      ]);
    });

    it('同じスポットが重複していたら落ちる', async () => {
      const input = {
        ...base,
        spots: [{ spotId: spotId(0) }, { spotId: spotId(0) }],
      };

      expect(await failedProperties(input)).toEqual(['spots']);
    });
  });

  describe('文字数', () => {
    it('タイトルが空白だけなら落ちる', async () => {
      expect(await failedProperties({ ...base, title: '   ' })).toEqual([
        'title',
      ]);
    });

    it('タイトルが60文字なら通り、61文字なら落ちる', async () => {
      expect(
        await failedProperties({ ...base, title: 'あ'.repeat(60) }),
      ).toEqual([]);
      expect(
        await failedProperties({ ...base, title: 'あ'.repeat(61) }),
      ).toEqual(['title']);
    });

    it('添え書きが201文字なら落ちる（配列の中身も検証される）', async () => {
      const input = {
        ...base,
        spots: [{ spotId: spotId(0), comment: 'あ'.repeat(201) }],
      };

      expect(await failedProperties(input)).toEqual(['spots']);
    });
  });

  it('カバー画像が自分の Storage 以外の URL なら落ちる', async () => {
    const input = {
      ...base,
      coverImageUrl: 'https://example.com/storage/v1/object/public/spots/a.jpg',
    };

    expect(await failedProperties(input)).toEqual(['coverImageUrl']);
  });
});
