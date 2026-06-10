import { buildWhereClause } from './spot-filter.util';
import { TagSearchMode } from './dto/tag-search-mode.enum';

describe('buildWhereClause', () => {
  describe('フィルターなし', () => {
    it('引数なしのとき空オブジェクトを返す', () => {
      expect(buildWhereClause()).toEqual({});
    });

    it('空のフィルターオブジェクトのとき空オブジェクトを返す', () => {
      expect(buildWhereClause({})).toEqual({});
    });
  });

  describe('カテゴリ絞り込み', () => {
    it('categoryIds を指定すると in 条件になる', () => {
      const result = buildWhereClause({ categoryIds: ['cat-1', 'cat-2'] });
      expect(result).toEqual({ categoryId: { in: ['cat-1', 'cat-2'] } });
    });

    it('categoryIds が空配列のとき条件に含まれない', () => {
      const result = buildWhereClause({ categoryIds: [] });
      expect(result).toEqual({});
    });
  });

  describe('タグ OR 検索（デフォルト）', () => {
    it('attributeTagIds を OR モードで指定すると some/in 条件になる', () => {
      const result = buildWhereClause({
        attributeTagIds: ['tag-1', 'tag-2'],
        tagSearchMode: TagSearchMode.OR,
      });
      expect(result).toEqual({
        attributeTags: { some: { tagId: { in: ['tag-1', 'tag-2'] } } },
      });
    });

    it('tagSearchMode 未指定はOR扱いになる', () => {
      const result = buildWhereClause({ moodTagIds: ['tag-a'] });
      expect(result).toEqual({
        moodTags: { some: { tagId: { in: ['tag-a'] } } },
      });
    });
  });

  describe('タグ AND 検索', () => {
    it('attributeTagIds を AND モードで指定するとタグごとに some 条件を生成する', () => {
      const result = buildWhereClause({
        attributeTagIds: ['tag-1', 'tag-2'],
        tagSearchMode: TagSearchMode.AND,
      });
      expect(result).toEqual({
        AND: [
          { attributeTags: { some: { tagId: 'tag-1' } } },
          { attributeTags: { some: { tagId: 'tag-2' } } },
        ],
      });
    });

    it('moodTagIds を AND モードで指定するとタグごとに some 条件を生成する', () => {
      const result = buildWhereClause({
        moodTagIds: ['mood-1', 'mood-2'],
        tagSearchMode: TagSearchMode.AND,
      });
      expect(result).toEqual({
        AND: [
          { moodTags: { some: { tagId: 'mood-1' } } },
          { moodTags: { some: { tagId: 'mood-2' } } },
        ],
      });
    });

    it('AND モードで attributeTagIds と moodTagIds を両方指定すると AND 配列にまとめられる', () => {
      const result = buildWhereClause({
        attributeTagIds: ['tag-1'],
        moodTagIds: ['mood-1'],
        tagSearchMode: TagSearchMode.AND,
      });
      expect(result).toEqual({
        AND: [
          { attributeTags: { some: { tagId: 'tag-1' } } },
          { moodTags: { some: { tagId: 'mood-1' } } },
        ],
      });
    });
  });

  describe('キーワード検索', () => {
    it('keyword を指定すると title と description の OR 条件が AND にネストされる', () => {
      const result = buildWhereClause({ keyword: '渋谷' });
      expect(result).toEqual({
        AND: [
          {
            OR: [
              { title: { contains: '渋谷', mode: 'insensitive' } },
              { description: { contains: '渋谷', mode: 'insensitive' } },
            ],
          },
        ],
      });
    });
  });

  describe('条件の組み合わせ（OR キー衝突の防止）', () => {
    it('AND タグ検索 + キーワード検索を同時に指定しても OR キーが衝突しない', () => {
      const result = buildWhereClause({
        attributeTagIds: ['tag-1'],
        tagSearchMode: TagSearchMode.AND,
        keyword: '渋谷',
      });
      expect(result).toEqual({
        AND: [
          { attributeTags: { some: { tagId: 'tag-1' } } },
          {
            OR: [
              { title: { contains: '渋谷', mode: 'insensitive' } },
              { description: { contains: '渋谷', mode: 'insensitive' } },
            ],
          },
        ],
      });
    });

    it('カテゴリ + キーワード検索を同時に指定できる', () => {
      const result = buildWhereClause({
        categoryIds: ['cat-1'],
        keyword: '渋谷',
      });
      expect(result).toEqual({
        categoryId: { in: ['cat-1'] },
        AND: [
          {
            OR: [
              { title: { contains: '渋谷', mode: 'insensitive' } },
              { description: { contains: '渋谷', mode: 'insensitive' } },
            ],
          },
        ],
      });
    });
  });
});
