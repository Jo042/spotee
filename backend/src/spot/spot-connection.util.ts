import { SpotEdge, PageInfo } from './dto/spot-connection.object';
import type { SpotConnectionSource } from './dto/spot-connection.object';
import type { SpotNode } from './dto/spot.object';

interface BuildConnectionParams<TRow> {
  /** first + 1 件を取得した結果。次ページの有無をこの1件で判定する */
  rows: TRow[];
  /** 1ページの件数 */
  first: number;
  /** 呼び出し時にカーソルが指定されていたか */
  hasPreviousPage: boolean;
  toNode: (row: TRow) => SpotNode;
  toCursor: (row: TRow) => string;
  /** 総件数の数え方。要求されたときだけ実行する（#210） */
  countTotal: () => Promise<number>;
}

/**
 * Cursor-based ページネーションの Connection を組み立てる。
 *
 * 「1件多く取って次ページの有無を判定し、余りを切り、edges と pageInfo を作る」
 * という手順は取得元によらず同じなので、行の取得方法とノード・カーソルの
 * 取り出し方だけを呼び出し側から受け取る。
 */
export function buildConnection<TRow>({
  rows,
  first,
  hasPreviousPage,
  toNode,
  toCursor,
  countTotal,
}: BuildConnectionParams<TRow>): SpotConnectionSource {
  const hasNextPage = rows.length > first;
  const pageRows = hasNextPage ? rows.slice(0, first) : rows;

  const edges: SpotEdge[] = pageRows.map((row) => ({
    node: toNode(row),
    cursor: toCursor(row),
  }));

  const pageInfo: PageInfo = {
    hasNextPage,
    hasPreviousPage,
    startCursor: edges.length > 0 ? edges[0].cursor : null,
    endCursor: edges.length > 0 ? edges[edges.length - 1].cursor : null,
  };

  return { edges, pageInfo, countTotal };
}
