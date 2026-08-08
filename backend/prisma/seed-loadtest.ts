import { randomUUID } from 'node:crypto';
import {
  PrismaClient,
  Prisma,
  Category,
  AttributeTag,
  MoodTag,
} from '@prisma/client';

const prisma = new PrismaClient();

const DEFAULT_USER_COUNT = 30;
const DEFAULT_SPOT_COUNT = 3000;
const INSERT_CHUNK_SIZE = 500;
const CREATED_AT_RANGE_DAYS = 180;
const LOADTEST_USER_EMAIL_PREFIX = 'loadtest-user-';

// 生成した行をメモリに溜め込まずに済むよう、この単位で生成と投入を繰り返す
const SPOT_BATCH_SIZE = 1000;

function readCount(name: string, fallback: number): number {
  const raw = process.env[name];
  if (raw === undefined || raw === '') return fallback;

  const parsed = Number(raw);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new Error(
      `${name} には正の整数を指定してください（受け取った値: ${raw}）`,
    );
  }
  return parsed;
}

const USER_COUNT = readCount('USER_COUNT', DEFAULT_USER_COUNT);
const SPOT_COUNT = readCount('SPOT_COUNT', DEFAULT_SPOT_COUNT);
const SHOULD_RESET = process.env.SEED_RESET === 'true';

const WARDS = [
  '渋谷区',
  '新宿区',
  '目黒区',
  '世田谷区',
  '港区',
  '中央区',
  '台東区',
  '墨田区',
  '品川区',
  '杉並区',
];

const ADJECTIVES = [
  '隠れ家的な',
  '定番の',
  '穴場の',
  '話題の',
  '老舗の',
  'おしゃれな',
  '落ち着いた',
  '新しくオープンした',
];

const BUSINESS_HOURS_OPTIONS: (string | null)[] = [
  '10:00-20:00',
  '9:00-18:00',
  '11:00-22:00',
  '24時間営業',
  null,
];

interface WeightedItem<T> {
  item: T;
  weight: number;
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pickOne<T>(items: T[]): T {
  return items[randomInt(0, items.length - 1)];
}

function chunk<T>(items: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    chunks.push(items.slice(i, i + size));
  }
  return chunks;
}

// Zipf風の重み（先頭ほど重い）を割り当て、カテゴリ・タグ・ユーザーの人気偏在を再現する
function buildZipfWeights<T>(items: T[]): WeightedItem<T>[] {
  return items.map((item, index) => ({ item, weight: 1 / (index + 1) }));
}

function pickWeighted<T>(weightedItems: WeightedItem<T>[]): T {
  const totalWeight = weightedItems.reduce((sum, w) => sum + w.weight, 0);
  let cursor = Math.random() * totalWeight;
  for (const { item, weight } of weightedItems) {
    cursor -= weight;
    if (cursor <= 0) return item;
  }
  return weightedItems[weightedItems.length - 1].item;
}

function pickManyWeighted<T>(
  weightedItems: WeightedItem<T>[],
  count: number,
): T[] {
  const picked = new Set<T>();
  const target = Math.min(count, weightedItems.length);
  while (picked.size < target) {
    picked.add(pickWeighted(weightedItems));
  }
  return Array.from(picked);
}

function randomPastDate(daysAgo: number): Date {
  const elapsedMs = randomInt(0, daysAgo) * 24 * 60 * 60 * 1000;
  return new Date(Date.now() - elapsedMs);
}

// スポットのlikeCountはべき乗分布で直接設定する。認証必須のLikeミューテーションは
// 検証対象外(docs/IaC-handover.md参照)のため、実Likeレコードは作らない。
function randomLikeCount(): number {
  const isViral = Math.random() < 0.05;
  return isViral ? randomInt(200, 3000) : randomInt(0, 50);
}

function randomPriceRange(): number | null {
  return Math.random() < 0.2 ? null : randomInt(1, 4);
}

function buildSpotContent(
  category: Category,
  index: number,
): { title: string; description: string; address: string } {
  const ward = pickOne(WARDS);
  const adjective = pickOne(ADJECTIVES);
  return {
    title: `${adjective}${category.name}スポット #${index}`,
    description: `${ward}にある${adjective}${category.name}です。`,
    address: `東京都${ward}${randomInt(1, 9)}-${randomInt(1, 20)}-${randomInt(1, 20)}`,
  };
}

async function createDummyUsers(): Promise<string[]> {
  await prisma.user.createMany({
    data: Array.from({ length: USER_COUNT }, (_, index) => ({
      id: randomUUID(),
      supabaseId: randomUUID(),
      email: `${LOADTEST_USER_EMAIL_PREFIX}${index}@example.com`,
      name: `負荷検証ユーザー${index}`,
    })),
    skipDuplicates: true,
  });

  // 既存ユーザーが残っている場合 createMany は email の重複でスキップされ、
  // 生成したidはDBに存在しない。スポットの外部キーに使うため実際のidを取り直す
  const users = await prisma.user.findMany({
    where: { email: { startsWith: LOADTEST_USER_EMAIL_PREFIX } },
    select: { id: true },
  });
  return users.map((user) => user.id);
}

interface GeneratedSpots {
  spots: Prisma.SpotCreateManyInput[];
  images: Prisma.SpotImageCreateManyInput[];
  attributeTagLinks: Prisma.SpotAttributeTagCreateManyInput[];
  moodTagLinks: Prisma.SpotMoodTagCreateManyInput[];
}

interface SpotWeights {
  categories: WeightedItem<Category>[];
  users: WeightedItem<string>[];
  attributeTags: WeightedItem<AttributeTag>[];
  moodTags: WeightedItem<MoodTag>[];
}

function generateSpotBatch(
  weights: SpotWeights,
  startIndex: number,
  batchSize: number,
): GeneratedSpots {
  const spots: Prisma.SpotCreateManyInput[] = [];
  const images: Prisma.SpotImageCreateManyInput[] = [];
  const attributeTagLinks: Prisma.SpotAttributeTagCreateManyInput[] = [];
  const moodTagLinks: Prisma.SpotMoodTagCreateManyInput[] = [];

  for (let offset = 0; offset < batchSize; offset++) {
    const spotId = randomUUID();
    const category = pickWeighted(weights.categories);
    const { title, description, address } = buildSpotContent(
      category,
      startIndex + offset,
    );

    spots.push({
      id: spotId,
      title,
      description,
      address,
      priceRange: randomPriceRange(),
      businessHours: pickOne(BUSINESS_HOURS_OPTIONS),
      likeCount: randomLikeCount(),
      createdAt: randomPastDate(CREATED_AT_RANGE_DAYS),
      userId: pickWeighted(weights.users),
      categoryId: category.id,
    });

    const imageCount = randomInt(1, 5);
    for (let order = 0; order < imageCount; order++) {
      images.push({
        id: randomUUID(),
        spotId,
        url: `https://picsum.photos/seed/${spotId}-${order}/800/600`,
        order,
      });
    }

    for (const tag of pickManyWeighted(
      weights.attributeTags,
      randomInt(1, 4),
    )) {
      attributeTagLinks.push({ id: randomUUID(), spotId, tagId: tag.id });
    }

    for (const tag of pickManyWeighted(weights.moodTags, randomInt(1, 3))) {
      moodTagLinks.push({ id: randomUUID(), spotId, tagId: tag.id });
    }
  }

  return { spots, images, attributeTagLinks, moodTagLinks };
}

async function insertInChunks<T>(
  rows: T[],
  insert: (batch: T[]) => Promise<unknown>,
): Promise<void> {
  for (const batch of chunk(rows, INSERT_CHUNK_SIZE)) {
    await insert(batch);
  }
}

async function insertBatch(batch: GeneratedSpots): Promise<void> {
  await insertInChunks(batch.spots, (rows) =>
    prisma.spot.createMany({ data: rows, skipDuplicates: true }),
  );
  await insertInChunks(batch.images, (rows) =>
    prisma.spotImage.createMany({ data: rows, skipDuplicates: true }),
  );
  await insertInChunks(batch.attributeTagLinks, (rows) =>
    prisma.spotAttributeTag.createMany({ data: rows, skipDuplicates: true }),
  );
  await insertInChunks(batch.moodTagLinks, (rows) =>
    prisma.spotMoodTag.createMany({ data: rows, skipDuplicates: true }),
  );
}

// 計測水準を変えて投入し直すため、マスタ（カテゴリ・タグ）は残してスポット系のみ削除する
async function resetSpotData(): Promise<void> {
  await prisma.$executeRaw`TRUNCATE TABLE spot_mood_tags, spot_attribute_tags, spot_images, spots RESTART IDENTITY CASCADE`;
  await prisma.user.deleteMany({
    where: { email: { startsWith: LOADTEST_USER_EMAIL_PREFIX } },
  });
}

async function main(): Promise<void> {
  const [categories, attributeTags, moodTags] = await Promise.all([
    prisma.category.findMany(),
    prisma.attributeTag.findMany(),
    prisma.moodTag.findMany(),
  ]);

  if (
    categories.length === 0 ||
    attributeTags.length === 0 ||
    moodTags.length === 0
  ) {
    throw new Error(
      'カテゴリ・タグが未投入です。先に `npx prisma db seed` を実行してください。',
    );
  }

  if (SHOULD_RESET) {
    console.log('Resetting existing spot data...');
    await resetSpotData();
  }

  console.log('Creating dummy users...');
  const userIds = await createDummyUsers();
  console.log(`Created ${userIds.length} users`);

  const weights: SpotWeights = {
    categories: buildZipfWeights(categories),
    users: buildZipfWeights(userIds),
    attributeTags: buildZipfWeights(attributeTags),
    moodTags: buildZipfWeights(moodTags),
  };

  console.log(`Generating ${SPOT_COUNT} spots...`);
  const startedAt = Date.now();
  const totals = { spots: 0, images: 0, attributeTagLinks: 0, moodTagLinks: 0 };

  for (let start = 0; start < SPOT_COUNT; start += SPOT_BATCH_SIZE) {
    const batchSize = Math.min(SPOT_BATCH_SIZE, SPOT_COUNT - start);
    const batch = generateSpotBatch(weights, start, batchSize);
    await insertBatch(batch);

    totals.spots += batch.spots.length;
    totals.images += batch.images.length;
    totals.attributeTagLinks += batch.attributeTagLinks.length;
    totals.moodTagLinks += batch.moodTagLinks.length;
    console.log(`  ${totals.spots}/${SPOT_COUNT} spots`);
  }

  const elapsedSec = ((Date.now() - startedAt) / 1000).toFixed(1);
  console.log(
    `Done in ${elapsedSec}s. spots=${totals.spots} images=${totals.images} attributeTagLinks=${totals.attributeTagLinks} moodTagLinks=${totals.moodTagLinks}`,
  );
}

main()
  .catch((e: unknown) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
