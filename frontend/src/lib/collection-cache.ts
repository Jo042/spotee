import type { ApolloCache } from "@apollo/client";

/**
 * 特集の一覧のキャッシュを捨て、次に表示するときに取り直させる。
 * 一覧は特集への参照の並びだけを持っていて、作成・削除・タイトルの変更で
 * どこに入る（どこから抜ける）かは手元では分からないため
 */
export function evictCollectionLists(cache: ApolloCache): void {
  cache.evict({ id: "ROOT_QUERY", fieldName: "collections" });
  cache.evict({ id: "ROOT_QUERY", fieldName: "myCollections" });
  cache.gc();
}
