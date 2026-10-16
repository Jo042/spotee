"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useQuery } from "@apollo/client/react";
import { GET_SPOTS } from "@/graphql/queries/spot";
import { GET_ALL_TAGS } from "@/graphql/queries/tag";
import { SpotSortBy, SortOrder } from "@/graphql/generated/graphql";
import { AskSentence } from "@/components/search/AskSentence";
import { ConditionsSheet } from "@/components/search/ConditionsSheet";
import { LayerPickerSheet } from "@/components/search/LayerPickerSheet";
import { ModeSwitch } from "@/components/search/ModeSwitch";
import { ZeroResultHint } from "@/components/search/ZeroResultHint";
import { SearchInput } from "@/components/common/SearchInput";
import {
  buildAskSentence,
  countSelected,
  describeResult,
  isModeEffective,
  toggleTag,
  type AskLayer,
  type AskTags,
} from "@/lib/ask-sentence";
import {
  buildSpotsHref,
  EMPTY_SPOT_FILTER,
  toSpotFilterInput,
  type SpotFilter,
} from "@/lib/spot-filter";
import { formatCount } from "@/lib/format";

/** 一文の下に出す写真の数（スマホは先頭の4枚だけ） */
const PEEK_COUNT = 6;
const PEEK_COUNT_SP = 4;

type OpenSheet = { kind: "layer"; layer: AskLayer } | { kind: "all" } | null;

/** トップの一番上の「文章で探す」 */
export function AskBlock() {
  const router = useRouter();
  const [filter, setFilter] = useState<SpotFilter>(EMPTY_SPOT_FILTER);
  const [sheet, setSheet] = useState<OpenSheet>(null);
  const [isKeywordOpen, setIsKeywordOpen] = useState(false);
  const [keyword, setKeyword] = useState("");

  const { data: tagData } = useQuery(GET_ALL_TAGS);
  const tags: AskTags = {
    moods: tagData?.moodTags ?? [],
    attributes: tagData?.attributeTags ?? [],
    categories: tagData?.categories ?? [],
  };

  const { data, previousData } = useQuery(GET_SPOTS, {
    variables: {
      first: PEEK_COUNT,
      sort: { sortBy: SpotSortBy.LikeCount, order: SortOrder.Desc },
      filter: toSpotFilterInput(filter),
    },
  });
  const result = data ?? previousData;
  const total = result?.spots.totalCount;
  const peekSpots = (result?.spots.edges ?? []).map((edge) => edge.node);

  const selectedCount = countSelected(filter);
  const href = buildSpotsHref(filter);
  const countLabel =
    total === undefined ? "スポットを" : `${formatCount(total)}件を`;

  const handleToggle = (layer: AskLayer, id: string) => {
    setFilter((prev) => toggleTag(prev, layer, id));
  };

  const handleKeywordSubmit = (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    router.push(
      buildSpotsHref({ ...filter, keyword: keyword.trim() || undefined }),
    );
  };

  const seeResults = (
    <Link href={href} className="btn-primary w-full py-3">
      {countLabel}見る
    </Link>
  );

  return (
    <section
      aria-labelledby="ask-heading"
      className="mx-auto max-w-[1160px] px-4 pt-4 sm:pt-8"
    >
      <h1 id="ask-heading" className="sr-only">
        言葉を選んで、行きたい場所を探す
      </h1>
      <div className="rounded-[20px] bg-primary-50 px-5 pb-6 pt-5 sm:px-12 sm:pb-10 sm:pt-9">
        <p className="text-xs font-medium text-primary-700">
          言葉を押すと選べます。選ばなくても探せます
        </p>
        <div className="mt-2">
          <AskSentence
            layers={buildAskSentence(filter, tags)}
            onPick={(layer) => setSheet({ kind: "layer", layer })}
          />
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2">
          {isModeEffective(filter) && (
            <ModeSwitch
              mode={filter.tagSearchMode}
              onChange={(mode) =>
                setFilter((prev) => ({ ...prev, tagSearchMode: mode }))
              }
            />
          )}
          <p className="text-sm text-gray-700">
            {describeResult(filter)}
            {total !== undefined && (
              <span className="ml-2 text-base font-bold text-primary-700">
                {formatCount(total)}件
              </span>
            )}
          </p>
        </div>

        {total === 0 ? (
          <ZeroResultHint
            filter={filter}
            onSwitchToOr={() =>
              setFilter((prev) => ({ ...prev, tagSearchMode: "OR" }))
            }
            className="mt-4"
          />
        ) : (
          <ul className="mt-4 grid grid-cols-4 gap-1.5 sm:grid-cols-6 sm:gap-2.5">
            {Array.from({ length: PEEK_COUNT }).map((_, i) => {
              const spot = peekSpots[i];
              const image = spot?.images[0]?.url;
              return (
                <li
                  key={spot?.id ?? i}
                  className={`relative aspect-video overflow-hidden rounded-lg bg-white/70 ${
                    i >= PEEK_COUNT_SP ? "hidden sm:block" : ""
                  }`}
                >
                  {spot && image && (
                    <Link
                      href={`/spots/${spot.id}`}
                      className="block size-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary-300"
                    >
                      <Image
                        src={image}
                        alt={spot.title}
                        fill
                        sizes="(min-width: 640px) 170px, 25vw"
                        className="object-cover"
                      />
                    </Link>
                  )}
                </li>
              );
            })}
          </ul>
        )}

        <div className="mt-5 flex flex-wrap items-center justify-between gap-x-6 gap-y-3">
          <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
            {total !== 0 && (
              <Link href={href} className="btn-primary">
                {countLabel}見る
                <ArrowRight size={16} aria-hidden="true" />
              </Link>
            )}
            <button
              type="button"
              onClick={() => setIsKeywordOpen((open) => !open)}
              aria-expanded={isKeywordOpen}
              className="btn-text"
            >
              キーワードで探す
            </button>
          </div>
          {selectedCount > 0 && (
            <button
              type="button"
              onClick={() => setSheet({ kind: "all" })}
              aria-haspopup="dialog"
              className="btn-text"
            >
              選んだ条件をすべて見る（{selectedCount}）
            </button>
          )}
        </div>

        {isKeywordOpen && (
          <form
            onSubmit={handleKeywordSubmit}
            className="mt-4 flex max-w-lg gap-2"
          >
            <div className="flex-1">
              <SearchInput
                value={keyword}
                onChange={setKeyword}
                onClear={() => setKeyword("")}
                placeholder="スポット名・キーワード"
              />
            </div>
            <button type="submit" className="btn-primary">
              探す
            </button>
          </form>
        )}
      </div>

      <LayerPickerSheet
        layer={sheet?.kind === "layer" ? sheet.layer : null}
        tags={tags}
        filter={filter}
        onToggle={handleToggle}
        onClose={() => setSheet(null)}
        footer={seeResults}
      />
      <ConditionsSheet
        open={sheet?.kind === "all"}
        filter={filter}
        tags={tags}
        onRemove={handleToggle}
        onClear={() =>
          setFilter((prev) => ({
            ...EMPTY_SPOT_FILTER,
            tagSearchMode: prev.tagSearchMode,
          }))
        }
        onModeChange={(mode) =>
          setFilter((prev) => ({ ...prev, tagSearchMode: mode }))
        }
        onClose={() => setSheet(null)}
        footer={seeResults}
      />
    </section>
  );
}
