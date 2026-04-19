import { registerEnumType } from '@nestjs/graphql';

export enum TagSearchMode {
  AND = 'AND',
  OR = 'OR',
}

registerEnumType(TagSearchMode, {
  name: 'TagSearchMode',
  description: 'タグ検索モード: AND=全タグ一致, OR=いずれか一致',
  valuesMap: {
    AND: { description: 'すべてのタグを含むスポットを返す' },
    OR: { description: 'いずれかのタグを含むスポットを返す' },
  },
});
