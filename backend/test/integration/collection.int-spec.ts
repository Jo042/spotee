import { createTestApp, type TestApp } from './support/test-app';
import {
  createCollection,
  createSpot,
  createUser,
  resetDatabase,
} from './support/fixtures';

type CollectionResult = {
  id: string;
  title: string;
  user: { id: string };
  spots: { order: number; comment: string | null; spot: { id: string } }[];
};

const FIELDS = `id title user { id } spots { order comment spot { id } }`;
const CREATE = `mutation ($input: CollectionInput!) { createCollection(input: $input) { ${FIELDS} } }`;
const UPDATE = `mutation ($id: ID!, $input: CollectionInput!) { updateCollection(id: $id, input: $input) { ${FIELDS} } }`;
const DELETE = `mutation ($id: ID!) { deleteCollection(id: $id) }`;
const DETAIL = `query ($id: ID!) { collection(id: $id) { ${FIELDS} spotCount } }`;

describe('特集', () => {
  let t: TestApp;

  beforeAll(async () => {
    t = await createTestApp();
  });
  afterAll(() => t.close());
  beforeEach(() => resetDatabase(t.prisma));

  /** 自分はスポットを3件、他人は1件投稿している */
  const setup = async () => {
    const me = await createUser(t.prisma, '自分');
    const other = await createUser(t.prisma, '他人');
    const [s1, s2, s3] = [
      await createSpot(t.prisma, me.user.id),
      await createSpot(t.prisma, me.user.id),
      await createSpot(t.prisma, me.user.id),
    ];
    const otherSpot = await createSpot(t.prisma, other.user.id);
    return { me, other, s1, s2, s3, otherSpot };
  };

  const spotIdsOf = async (collectionId: string) =>
    (
      await t.prisma.collectionSpot.findMany({
        where: { collectionId },
        orderBy: { order: 'asc' },
      })
    ).map((row) => row.spotId);

  describe('認可', () => {
    it('未ログインでは作成・更新・削除ができない', async () => {
      const { me, s1 } = await setup();
      const mine = await createCollection(t.prisma, me.user.id, {
        title: '元のタイトル',
        spotIds: [s1.id],
      });
      const input = { title: '書き換え', spots: [{ spotId: s1.id }] };

      const results = [
        await t.graphql(CREATE, { variables: { input } }),
        await t.graphql(UPDATE, { variables: { id: mine.id, input } }),
        await t.graphql(DELETE, { variables: { id: mine.id } }),
      ];

      for (const res of results) {
        expect(res.errors?.[0].extensions?.code).toBe('UNAUTHENTICATED');
      }
      expect(await t.prisma.collection.count()).toBe(1);
      expect(
        (await t.prisma.collection.findUnique({ where: { id: mine.id } }))
          ?.title,
      ).toBe('元のタイトル');
    });

    it('作成すると本人の特集になり、スポットは送った順に並ぶ', async () => {
      const { me, s1, s2, s3 } = await setup();

      const res = await t.graphql<{ createCollection: CollectionResult }>(
        CREATE,
        {
          variables: {
            input: {
              title: '雨の日の横浜デート',
              spots: [
                { spotId: s3.id, comment: '最初に行く' },
                { spotId: s1.id },
                { spotId: s2.id },
              ],
            },
          },
          token: me.token,
        },
      );

      const created = res.data?.createCollection;
      expect(created?.user.id).toBe(me.user.id);
      expect(created?.spots).toEqual([
        { order: 0, comment: '最初に行く', spot: { id: s3.id } },
        { order: 1, comment: null, spot: { id: s1.id } },
        { order: 2, comment: null, spot: { id: s2.id } },
      ]);
    });

    it('他人のスポットを含めて作成しようとすると入力エラーになり、作られない', async () => {
      const { me, s1, otherSpot } = await setup();

      const res = await t.graphql(CREATE, {
        variables: {
          input: {
            title: '特集',
            spots: [{ spotId: s1.id }, { spotId: otherSpot.id }],
          },
        },
        token: me.token,
      });

      expect(res.errors?.[0].extensions?.code).toBe('BAD_REQUEST');
      expect(await t.prisma.collection.count()).toBe(0);
    });

    it('他人の特集は更新できない', async () => {
      const { me, other, s1, otherSpot } = await setup();
      const theirs = await createCollection(t.prisma, other.user.id, {
        title: '他人の特集',
        spotIds: [otherSpot.id],
      });

      const res = await t.graphql(UPDATE, {
        variables: {
          id: theirs.id,
          input: { title: '書き換え', spots: [{ spotId: s1.id }] },
        },
        token: me.token,
      });

      expect(res.errors?.[0].extensions?.status).toBe(404);
      const after = await t.prisma.collection.findUnique({
        where: { id: theirs.id },
      });
      expect(after?.title).toBe('他人の特集');
      expect(await spotIdsOf(theirs.id)).toEqual([otherSpot.id]);
    });

    it('他人の特集は削除できない', async () => {
      const { me, other, otherSpot } = await setup();
      const theirs = await createCollection(t.prisma, other.user.id, {
        title: '他人の特集',
        spotIds: [otherSpot.id],
      });

      const res = await t.graphql(DELETE, {
        variables: { id: theirs.id },
        token: me.token,
      });

      expect(res.errors?.[0].extensions?.status).toBe(404);
      expect(
        await t.prisma.collection.findUnique({ where: { id: theirs.id } }),
      ).not.toBeNull();
    });

    it('自分の特集の更新で他人のスポットを混ぜると入力エラーになり、並びは変わらない', async () => {
      const { me, s1, s2, otherSpot } = await setup();
      const mine = await createCollection(t.prisma, me.user.id, {
        title: '自分の特集',
        spotIds: [s1.id, s2.id],
      });

      const res = await t.graphql(UPDATE, {
        variables: {
          id: mine.id,
          input: {
            title: '自分の特集',
            spots: [{ spotId: otherSpot.id }, { spotId: s1.id }],
          },
        },
        token: me.token,
      });

      expect(res.errors?.[0].extensions?.code).toBe('BAD_REQUEST');
      expect(await spotIdsOf(mine.id)).toEqual([s1.id, s2.id]);
    });

    it('自分の特集の一覧には、自分の特集だけが返る', async () => {
      const { me, other, s1, otherSpot } = await setup();
      const mine = await createCollection(t.prisma, me.user.id, {
        title: '自分の特集',
        spotIds: [s1.id],
      });
      await createCollection(t.prisma, other.user.id, {
        title: '他人の特集',
        spotIds: [otherSpot.id],
      });

      const res = await t.graphql<{
        myCollections: { edges: { node: { id: string } }[] };
      }>(`query { myCollections { edges { node { id } } } }`, {
        token: me.token,
      });

      expect(res.data?.myCollections.edges).toEqual([
        { node: { id: mine.id } },
      ]);
    });

    it('特集の詳細は未ログインでも見られ、スポットが順番どおり添え書き付きで返る', async () => {
      const { me, s1, s2 } = await setup();
      const created = await t.graphql<{ createCollection: { id: string } }>(
        CREATE,
        {
          variables: {
            input: {
              title: '特集',
              spots: [
                { spotId: s2.id, comment: '添え書き' },
                { spotId: s1.id },
              ],
            },
          },
          token: me.token,
        },
      );

      const res = await t.graphql<{
        collection: CollectionResult & { spotCount: number };
      }>(DETAIL, { variables: { id: created.data?.createCollection.id } });

      expect(res.errors).toBeUndefined();
      expect(res.data?.collection.spotCount).toBe(2);
      expect(res.data?.collection.spots).toEqual([
        { order: 0, comment: '添え書き', spot: { id: s2.id } },
        { order: 1, comment: null, spot: { id: s1.id } },
      ]);
    });
  });

  describe('データのつながり', () => {
    it('更新でスポットを並べ替えると、新しい並びで振り直される', async () => {
      const { me, s1, s2, s3 } = await setup();
      const mine = await createCollection(t.prisma, me.user.id, {
        title: '特集',
        spotIds: [s1.id, s2.id, s3.id],
      });

      const res = await t.graphql<{ updateCollection: CollectionResult }>(
        UPDATE,
        {
          variables: {
            id: mine.id,
            input: {
              title: '並べ替えた特集',
              spots: [{ spotId: s3.id }, { spotId: s1.id, comment: '追記' }],
            },
          },
          token: me.token,
        },
      );

      expect(res.data?.updateCollection.title).toBe('並べ替えた特集');
      expect(res.data?.updateCollection.spots).toEqual([
        { order: 0, comment: null, spot: { id: s3.id } },
        { order: 1, comment: '追記', spot: { id: s1.id } },
      ]);
    });

    it('スポットを削除すると、特集からそのスポットだけが消え、特集は残る', async () => {
      const { me, s1, s2, s3 } = await setup();
      const mine = await createCollection(t.prisma, me.user.id, {
        title: '特集',
        spotIds: [s1.id, s2.id, s3.id],
      });

      await t.prisma.spot.delete({ where: { id: s2.id } });

      expect(
        await t.prisma.collection.findUnique({ where: { id: mine.id } }),
      ).not.toBeNull();
      expect(await spotIdsOf(mine.id)).toEqual([s1.id, s3.id]);
    });
  });

  describe('一覧のカードの画像（thumbnailUrl）', () => {
    const THUMBNAIL = `query ($id: ID!) { collection(id: $id) { thumbnailUrl } }`;

    const thumbnailOf = async (id: string) =>
      (
        await t.graphql<{ collection: { thumbnailUrl: string | null } }>(
          THUMBNAIL,
          { variables: { id } },
        )
      ).data?.collection.thumbnailUrl;

    const addImages = (spotId: string, urls: string[]) =>
      t.prisma.spotImage.createMany({
        data: urls.map((url, order) => ({ spotId, url, order })),
      });

    it('カバー画像があれば、カバー画像になる', async () => {
      const { me, s1 } = await setup();
      await addImages(s1.id, ['s1-1.jpg']);
      const mine = await createCollection(t.prisma, me.user.id, {
        title: '特集',
        spotIds: [s1.id],
      });
      await t.prisma.collection.update({
        where: { id: mine.id },
        data: { coverImageUrl: 'cover.jpg' },
      });

      expect(await thumbnailOf(mine.id)).toBe('cover.jpg');
    });

    it('カバー画像がなければ先頭のスポットの1枚目になり、並べ替えると新しい先頭の画像になる', async () => {
      const { me, s1, s2 } = await setup();
      await addImages(s1.id, ['s1-1.jpg', 's1-2.jpg']);
      await addImages(s2.id, ['s2-1.jpg']);
      const mine = await createCollection(t.prisma, me.user.id, {
        title: '特集',
        spotIds: [s1.id, s2.id],
      });

      expect(await thumbnailOf(mine.id)).toBe('s1-1.jpg');

      await t.graphql(UPDATE, {
        variables: {
          id: mine.id,
          input: {
            title: '特集',
            spots: [{ spotId: s2.id }, { spotId: s1.id }],
          },
        },
        token: me.token,
      });

      expect(await thumbnailOf(mine.id)).toBe('s2-1.jpg');
    });

    it('どのスポットにも画像がなければ null になる', async () => {
      const { me, s1 } = await setup();
      const mine = await createCollection(t.prisma, me.user.id, {
        title: '特集',
        spotIds: [s1.id],
      });

      expect(await thumbnailOf(mine.id)).toBeNull();
    });
  });

  describe('一覧と検索', () => {
    const LIST = `query ($first: Int, $after: String, $filter: CollectionFilterInput) {
      collections(first: $first, after: $after, filter: $filter) {
        edges { node { id title } }
        pageInfo { hasNextPage endCursor }
      }
    }`;

    type ListResult = {
      collections: {
        edges: { node: { id: string; title: string } }[];
        pageInfo: { hasNextPage: boolean; endCursor: string | null };
      };
    };

    it('新着順に並び、作成日時が同じでもカーソルで続きを取ると重複も抜けもない', async () => {
      const { me } = await setup();
      const sameTime = new Date('2026-10-01T00:00:00Z');
      const older = await createCollection(t.prisma, me.user.id, {
        title: '古い',
        createdAt: new Date('2026-09-01T00:00:00Z'),
      });
      const tied = [
        await createCollection(t.prisma, me.user.id, {
          title: '同時刻1',
          createdAt: sameTime,
        }),
        await createCollection(t.prisma, me.user.id, {
          title: '同時刻2',
          createdAt: sameTime,
        }),
      ].sort((a, b) => (a.id < b.id ? 1 : -1));

      const page1 = await t.graphql<ListResult>(LIST, {
        variables: { first: 2 },
      });
      const page2 = await t.graphql<ListResult>(LIST, {
        variables: {
          first: 2,
          after: page1.data?.collections.pageInfo.endCursor,
        },
      });

      const ids = [
        ...(page1.data?.collections.edges ?? []),
        ...(page2.data?.collections.edges ?? []),
      ].map((edge) => edge.node.id);
      expect(ids).toEqual([tied[0].id, tied[1].id, older.id]);
      expect(page1.data?.collections.pageInfo.hasNextPage).toBe(true);
      expect(page2.data?.collections.pageInfo.hasNextPage).toBe(false);
    });

    it('キーワードで、タイトルの部分一致（大文字と小文字を区別しない）で絞り込める', async () => {
      const { me } = await setup();
      for (const title of ['雨の日の横浜デート', 'Yokohama Night', 'お花見']) {
        await createCollection(t.prisma, me.user.id, { title });
      }

      const search = async (keyword: string) =>
        (
          await t.graphql<ListResult>(LIST, {
            variables: { filter: { keyword } },
          })
        ).data?.collections.edges.map((edge) => edge.node.title);

      expect(await search('横浜')).toEqual(['雨の日の横浜デート']);
      expect(await search('yokohama')).toEqual(['Yokohama Night']);
    });
  });
});
