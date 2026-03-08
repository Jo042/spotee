import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  const categories = [
    { name: 'カフェ', slug: 'cafe', displayOrder: 1 },
    { name: 'レストラン', slug: 'restaurant', displayOrder: 2 },
    { name: '公園', slug: 'park', displayOrder: 3 },
    { name: '美術館', slug: 'museum', displayOrder: 4 },
    { name: '夜景', slug: 'night-view', displayOrder: 5 },
    { name: '自然', slug: 'nature', displayOrder: 6 },
    { name: '遊園地', slug: 'amusement-park', displayOrder: 7 },
    { name: 'ショッピング', slug: 'shopping', displayOrder: 8 },
    { name: '温泉・スパ', slug: 'spa', displayOrder: 9 },
    { name: '神社・寺院', slug: 'shrine-temple', displayOrder: 10 },
    { name: 'アミューズメント', slug: 'amusement', displayOrder: 11 },
    { name: 'スポーツ・アウトドア', slug: 'sports-outdoor', displayOrder: 12 },
  ];

  const attributeTags = [
    { name: 'Wi-Fiあり', slug: 'wifi', displayOrder: 1 },
    { name: '電源あり', slug: 'power-outlet', displayOrder: 2 },
    { name: '駐車場あり', slug: 'parking', displayOrder: 3 },
    { name: '子連れOK', slug: 'child-friendly', displayOrder: 4 },
    { name: 'ペットOK', slug: 'pet-friendly', displayOrder: 5 },
    { name: '予約必要', slug: 'reservation-required', displayOrder: 6 },
    { name: 'テイクアウト可', slug: 'takeout', displayOrder: 7 },
    { name: '個室あり', slug: 'private-room', displayOrder: 8 },
    { name: 'バリアフリー', slug: 'barrier-free', displayOrder: 9 },
    { name: '禁煙', slug: 'non-smoking', displayOrder: 10 },
  ];

  const moodTags = [
    { name: 'デートにおすすめ', slug: 'date', displayOrder: 1 },
    { name: '友達と行きたい', slug: 'friends', displayOrder: 2 },
    { name: '一人でゆっくり', slug: 'solo', displayOrder: 3 },
    { name: '家族で楽しめる', slug: 'family', displayOrder: 4 },
    { name: '雨の日OK', slug: 'rainy-day', displayOrder: 5 },
    { name: '晴れの日におすすめ', slug: 'sunny-day', displayOrder: 6 },
    { name: '写真映え', slug: 'photogenic', displayOrder: 7 },
    { name: '穴場', slug: 'hidden-gem', displayOrder: 8 },
    { name: '定番', slug: 'popular', displayOrder: 9 },
    { name: '静かな場所', slug: 'quiet', displayOrder: 10 },
    { name: 'にぎやかな場所', slug: 'lively', displayOrder: 11 },
    { name: '記念日向け', slug: 'anniversary', displayOrder: 12 },
  ];

  for (const category of categories) {
    await prisma.category.upsert({
      where: { slug: category.slug },
      update: {},
      create: category,
    });
  }
  console.log(`Created ${categories.length} categories`);

  for (const tag of attributeTags) {
    await prisma.attributeTag.upsert({
      where: { slug: tag.slug },
      update: {},
      create: tag,
    });
  }
  console.log(`Created ${attributeTags.length} attribute tags`);

  for (const tag of moodTags) {
    await prisma.moodTag.upsert({
      where: { slug: tag.slug },
      update: {},
      create: tag,
    });
  }
  console.log(`Created ${moodTags.length} mood tags`);

  console.log('Seeding completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
