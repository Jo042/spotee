import { randomUUID } from 'node:crypto';
import {
  PrismaClient,
  Prisma,
  Category,
  AttributeTag,
  MoodTag,
} from '@prisma/client';

const prisma = new PrismaClient();

const USER_COUNT = 30;
const SPOT_COUNT = 3000;
const INSERT_CHUNK_SIZE = 500;
const CREATED_AT_RANGE_DAYS = 180;

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
  const userIds = Array.from({ length: USER_COUNT }, () => randomUUID());
  await prisma.user.createMany({
    data: userIds.map((id, index) => ({
      id,
      supabaseId: randomUUID(),
      email: `loadtest-user-${index}@example.com`,
      name: `負荷検証ユーザー${index}`,
    })),
    skipDuplicates: true,
  });
  return userIds;
}

interface GeneratedSpots {
  spots: Prisma.SpotCreateManyInput[];
  images: Prisma.SpotImageCreateManyInput[];
  attributeTagLinks: Prisma.SpotAttributeTagCreateManyInput[];
  moodTagLinks: Prisma.SpotMoodTagCreateManyInput[];
}

function generateSpots(
  categories: Category[],
  attributeTags: AttributeTag[],
  moodTags: MoodTag[],
  userIds: string[],
): GeneratedSpots {
  const categoryWeights = buildZipfWeights(categories);
  const userWeights = buildZipfWeights(userIds);
  const attributeTagWeights = buildZipfWeights(attributeTags);
  const moodTagWeights = buildZipfWeights(moodTags);

  const spots: Prisma.SpotCreateManyInput[] = [];
  const images: Prisma.SpotImageCreateManyInput[] = [];
  const attributeTagLinks: Prisma.SpotAttributeTagCreateManyInput[] = [];
  const moodTagLinks: Prisma.SpotMoodTagCreateManyInput[] = [];

  for (let i = 0; i < SPOT_COUNT; i++) {
    const spotId = randomUUID();
    const category = pickWeighted(categoryWeights);
    const { title, description, address } = buildSpotContent(category, i);

    spots.push({
      id: spotId,
      title,
      description,
      address,
      priceRange: randomPriceRange(),
      businessHours: pickOne(BUSINESS_HOURS_OPTIONS),
      likeCount: randomLikeCount(),
      createdAt: randomPastDate(CREATED_AT_RANGE_DAYS),
      userId: pickWeighted(userWeights),
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

    for (const tag of pickManyWeighted(attributeTagWeights, randomInt(1, 4))) {
      attributeTagLinks.push({ id: randomUUID(), spotId, tagId: tag.id });
    }

    for (const tag of pickManyWeighted(moodTagWeights, randomInt(1, 3))) {
      moodTagLinks.push({ id: randomUUID(), spotId, tagId: tag.id });
    }
  }

  return { spots, images, attributeTagLinks, moodTagLinks };
}

async function insertInChunks<T>(
  label: string,
  rows: T[],
  insert: (batch: T[]) => Promise<unknown>,
): Promise<void> {
  console.log(`Inserting ${rows.length} ${label}...`);
  for (const batch of chunk(rows, INSERT_CHUNK_SIZE)) {
    await insert(batch);
  }
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

  console.log('Creating dummy users...');
  const userIds = await createDummyUsers();
  console.log(`Created ${userIds.length} users`);

  console.log(`Generating ${SPOT_COUNT} spots...`);
  const { spots, images, attributeTagLinks, moodTagLinks } = generateSpots(
    categories,
    attributeTags,
    moodTags,
    userIds,
  );

  await insertInChunks('spots', spots, (batch) =>
    prisma.spot.createMany({ data: batch, skipDuplicates: true }),
  );
  await insertInChunks('spot images', images, (batch) =>
    prisma.spotImage.createMany({ data: batch, skipDuplicates: true }),
  );
  await insertInChunks('spot attribute tag links', attributeTagLinks, (batch) =>
    prisma.spotAttributeTag.createMany({ data: batch, skipDuplicates: true }),
  );
  await insertInChunks('spot mood tag links', moodTagLinks, (batch) =>
    prisma.spotMoodTag.createMany({ data: batch, skipDuplicates: true }),
  );

  console.log(
    `Done. spots=${spots.length} images=${images.length} attributeTagLinks=${attributeTagLinks.length} moodTagLinks=${moodTagLinks.length}`,
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
