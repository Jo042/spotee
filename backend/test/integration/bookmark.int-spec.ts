import { createTestApp, type TestApp } from './support/test-app';
import {
  createFolder,
  createSpot,
  createUser,
  resetDatabase,
} from './support/fixtures';

describe('保存フォルダの認可', () => {
  let t: TestApp;

  beforeAll(async () => {
    t = await createTestApp();
  });
  afterAll(() => t.close());
  beforeEach(() => resetDatabase(t.prisma));

  /** 自分と他人がそれぞれフォルダを1つずつ持ち、他人がスポットを1件投稿している */
  const setup = async () => {
    const me = await createUser(t.prisma, '自分');
    const other = await createUser(t.prisma, '他人');
    const spot = await createSpot(t.prisma, other.user.id);
    const myFolder = await createFolder(t.prisma, me.user.id, '自分のフォルダ');
    const otherFolder = await createFolder(
      t.prisma,
      other.user.id,
      '他人のフォルダ',
    );
    return { me, other, spot, myFolder, otherFolder };
  };

  it('未ログインではフォルダの一覧も作成もできない', async () => {
    const list = await t.graphql(`query { myFolders { id } }`);
    const create = await t.graphql(
      `mutation { createFolder(input: { name: "新しいフォルダ" }) { id } }`,
    );

    expect(list.errors?.[0].extensions?.code).toBe('UNAUTHENTICATED');
    expect(create.errors?.[0].extensions?.code).toBe('UNAUTHENTICATED');
    expect(await t.prisma.folder.count()).toBe(0);
  });

  it('フォルダの一覧には自分のフォルダだけが返る', async () => {
    const { me, myFolder } = await setup();

    const res = await t.graphql<{ myFolders: { id: string }[] }>(
      `query { myFolders { id } }`,
      { token: me.token },
    );

    expect(res.data?.myFolders).toEqual([{ id: myFolder.id }]);
  });

  it('他人のフォルダを ID で取得すると null になる', async () => {
    const { me, otherFolder } = await setup();

    const res = await t.graphql<{ folder: unknown }>(
      `query ($id: ID!) { folder(id: $id) { id name } }`,
      { variables: { id: otherFolder.id }, token: me.token },
    );

    expect(res.errors).toBeUndefined();
    expect(res.data?.folder).toBeNull();
  });

  it('他人のフォルダの名前は変えられない', async () => {
    const { me, otherFolder } = await setup();

    const res = await t.graphql(
      `mutation ($id: ID!) { renameFolder(id: $id, input: { name: "書き換え" }) { id } }`,
      { variables: { id: otherFolder.id }, token: me.token },
    );

    expect(res.errors?.[0].extensions?.status).toBe(404);
    const after = await t.prisma.folder.findUnique({
      where: { id: otherFolder.id },
    });
    expect(after?.name).toBe('他人のフォルダ');
  });

  it('他人のフォルダは削除できない', async () => {
    const { me, otherFolder } = await setup();

    const res = await t.graphql(
      `mutation ($id: ID!) { deleteFolder(id: $id) }`,
      { variables: { id: otherFolder.id }, token: me.token },
    );

    expect(res.errors?.[0].extensions?.status).toBe(404);
    expect(
      await t.prisma.folder.findUnique({ where: { id: otherFolder.id } }),
    ).not.toBeNull();
  });

  it('他人のフォルダにはスポットを保存できない', async () => {
    const { me, spot, otherFolder } = await setup();

    const res = await t.graphql(
      `mutation ($spotId: ID!, $folderId: ID!) { addBookmark(spotId: $spotId, folderId: $folderId) { id } }`,
      {
        variables: { spotId: spot.id, folderId: otherFolder.id },
        token: me.token,
      },
    );

    expect(res.errors?.[0].extensions?.status).toBe(404);
    expect(await t.prisma.bookmark.count()).toBe(0);
  });

  it('他人のフォルダからはスポットを外せない', async () => {
    const { me, other, spot, otherFolder } = await setup();
    await t.prisma.bookmark.create({
      data: {
        userId: other.user.id,
        spotId: spot.id,
        folderId: otherFolder.id,
      },
    });

    const res = await t.graphql(
      `mutation ($spotId: ID!, $folderId: ID!) { removeBookmark(spotId: $spotId, folderId: $folderId) { id } }`,
      {
        variables: { spotId: spot.id, folderId: otherFolder.id },
        token: me.token,
      },
    );

    expect(res.errors?.[0].extensions?.status).toBe(404);
    expect(await t.prisma.bookmark.count()).toBe(1);
  });

  it('スポットの保存先には自分のフォルダだけが返り、他人の保存先は出ない', async () => {
    const { me, other, spot, myFolder, otherFolder } = await setup();
    await t.prisma.bookmark.createMany({
      data: [
        { userId: me.user.id, spotId: spot.id, folderId: myFolder.id },
        { userId: other.user.id, spotId: spot.id, folderId: otherFolder.id },
      ],
    });

    const res = await t.graphql<{ spot: { bookmarkFolderIds: string[] } }>(
      `query ($id: ID!) { spot(id: $id) { bookmarkFolderIds } }`,
      { variables: { id: spot.id }, token: me.token },
    );

    expect(res.data?.spot.bookmarkFolderIds).toEqual([myFolder.id]);
  });
});
