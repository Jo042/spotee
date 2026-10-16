"use client";

import { useQuery } from "@apollo/client/react";
import { GET_SPOT_COUNT } from "@/graphql/queries/spot";
import { isModeEffective } from "@/lib/ask-sentence";
import { toSpotFilterInput, type SpotFilter } from "@/lib/spot-filter";
import { formatCount } from "@/lib/format";

interface ZeroResultHintProps {
  /** 0件になった今の条件 */
  filter: SpotFilter;
  onSwitchToOr: () => void;
  /** 置く面の色。淡い青の面の上は白、白い面の上は灰色 */
  surface?: "white" | "gray";
  className?: string;
}

/**
 * 0件のときの案内。「すべて」で0件なら、「どれか」にしたときの件数と、
 * 切り替えるボタンを出す
 */
export function ZeroResultHint({
  filter,
  onSwitchToOr,
  surface = "white",
  className = "",
}: ZeroResultHintProps) {
  const canSwitch = filter.tagSearchMode === "AND" && isModeEffective(filter);
  const { data } = useQuery(GET_SPOT_COUNT, {
    variables: {
      filter: toSpotFilterInput({ ...filter, tagSearchMode: "OR" }),
    },
    skip: !canSwitch,
  });
  const orTotal = canSwitch ? data?.spots.totalCount : undefined;

  return (
    <div
      className={`rounded-lg px-4 py-3 text-sm leading-relaxed text-gray-700 ${
        surface === "white" ? "bg-white" : "bg-gray-50"
      } ${className}`}
    >
      {orTotal ? (
        <>
          <p>
            特徴と雰囲気の言葉がすべて当てはまる場所は、まだありません。「どれか当てはまる」にすると
            <span className="mx-1 font-bold text-primary-700">
              {formatCount(orTotal)}件
            </span>
            あります。
          </p>
          <button
            type="button"
            onClick={onSwitchToOr}
            className="btn-primary mt-3"
          >
            「どれか当てはまる」にする
          </button>
        </>
      ) : (
        <p>
          この条件に合う場所は、まだありません。言葉を外すと見つかるかもしれません。
        </p>
      )}
    </div>
  );
}
