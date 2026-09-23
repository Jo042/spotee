import { pickThumbnailUrls, sortFoldersByLastUsed } from './folder.util';

const at = (iso: string) => new Date(iso);

describe('sortFoldersByLastUsed', () => {
  const folders = [
    { id: 'a', createdAt: at('2026-01-01T00:00:00Z') },
    { id: 'b', createdAt: at('2026-01-02T00:00:00Z') },
    { id: 'c', createdAt: at('2026-01-03T00:00:00Z') },
  ];

  it('最後に保存した日時が新しいフォルダを先頭にする', () => {
    const lastUsed = new Map([
      ['a', at('2026-03-01T00:00:00Z')],
      ['b', at('2026-02-01T00:00:00Z')],
      ['c', at('2026-01-10T00:00:00Z')],
    ]);

    expect(sortFoldersByLastUsed(folders, lastUsed).map((f) => f.id)).toEqual([
      'a',
      'b',
      'c',
    ]);
  });

  it('一度も保存していないフォルダは作成日時で比べる', () => {
    const lastUsed = new Map([['a', at('2026-01-02T12:00:00Z')]]);

    // c(作成 01-03) > a(保存 01-02 12時) > b(作成 01-02 0時)
    expect(sortFoldersByLastUsed(folders, lastUsed).map((f) => f.id)).toEqual([
      'c',
      'a',
      'b',
    ]);
  });

  it('日時が同じなら id の降順で並びを固定する', () => {
    const same = at('2026-01-01T00:00:00Z');
    const ties = [
      { id: 'x', createdAt: same },
      { id: 'z', createdAt: same },
      { id: 'y', createdAt: same },
    ];

    expect(sortFoldersByLastUsed(ties, new Map()).map((f) => f.id)).toEqual([
      'z',
      'y',
      'x',
    ]);
  });

  it('元の配列を書き換えない', () => {
    const original = [...folders];

    sortFoldersByLastUsed(folders, new Map());

    expect(folders).toEqual(original);
  });
});

describe('pickThumbnailUrls', () => {
  it('各フォルダで最後に保存したスポットの1枚目の画像を返す', () => {
    const bookmarks = [
      { folderId: 'f1', spotId: 's-new' },
      { folderId: 'f1', spotId: 's-old' },
      { folderId: 'f2', spotId: 's-old' },
    ];
    const images = [
      { spotId: 's-new', url: 'new-1.jpg' },
      { spotId: 's-new', url: 'new-2.jpg' },
      { spotId: 's-old', url: 'old-1.jpg' },
    ];

    expect(pickThumbnailUrls(['f1', 'f2'], bookmarks, images)).toEqual([
      'new-1.jpg',
      'old-1.jpg',
    ]);
  });

  it('空のフォルダは null', () => {
    expect(pickThumbnailUrls(['empty'], [], [])).toEqual([null]);
  });

  it('画像が無いスポットなら null', () => {
    const bookmarks = [{ folderId: 'f1', spotId: 's1' }];

    expect(pickThumbnailUrls(['f1'], bookmarks, [])).toEqual([null]);
  });

  it('キーの順序どおりに返す（DataLoader の約束）', () => {
    const bookmarks = [
      { folderId: 'f2', spotId: 's2' },
      { folderId: 'f1', spotId: 's1' },
    ];
    const images = [
      { spotId: 's1', url: 'one.jpg' },
      { spotId: 's2', url: 'two.jpg' },
    ];

    expect(pickThumbnailUrls(['f1', 'f2'], bookmarks, images)).toEqual([
      'one.jpg',
      'two.jpg',
    ]);
  });
});
