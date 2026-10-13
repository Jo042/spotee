import type { SpotFilter } from "./spot-filter";
import { ATTRIBUTE_PHRASES, MOOD_PHRASES } from "./tag-phrases";

export type AskLayer = "mood" | "attribute" | "category";

export interface AskTag {
  id: string;
  name: string;
  slug: string;
}

export interface AskTags {
  moods: AskTag[];
  attributes: AskTag[];
  categories: AskTag[];
}

export type AskConnector = "か" | "かつ";

export type AskLayerContent =
  | { kind: "empty"; placeholder: string }
  /** 1つか2つ。2つのときは connector でつなぐ */
  | { kind: "words"; words: string[]; connector: AskConnector }
  /** 3つ以上は「最初の言葉 など◯つ」にまとめる */
  | { kind: "summary"; first: string; total: number };

export interface AskSentenceLayer {
  layer: AskLayer;
  label: string;
  content: AskLayerContent;
}

/** 一文に並べる順（「[雰囲気]、[特徴] [カテゴリ]を探す」） */
export const ASK_LAYERS: readonly AskLayer[] = [
  "mood",
  "attribute",
  "category",
];

export const ASK_LAYER_LABELS: Readonly<Record<AskLayer, string>> = {
  mood: "雰囲気",
  attribute: "特徴",
  category: "カテゴリ",
};

const PLACEHOLDERS: Readonly<Record<AskLayer, string>> = {
  mood: "どんな雰囲気の",
  attribute: "どんな特徴の",
  category: "場所",
};

const SUMMARY_THRESHOLD = 3;

const FILTER_KEYS = {
  mood: "moodTagIds",
  attribute: "attributeTagIds",
  category: "categoryIds",
} as const satisfies Record<AskLayer, keyof SpotFilter>;

export function selectedIdsOf(filter: SpotFilter, layer: AskLayer): string[] {
  return filter[FILTER_KEYS[layer]];
}

/** その層で選んでいれば外し、選んでいなければ末尾に足す */
export function toggleTag(
  filter: SpotFilter,
  layer: AskLayer,
  id: string,
): SpotFilter {
  const ids = selectedIdsOf(filter, layer);
  return {
    ...filter,
    [FILTER_KEYS[layer]]: ids.includes(id)
      ? ids.filter((selected) => selected !== id)
      : [...ids, id],
  };
}

export function tagsOf(tags: AskTags, layer: AskLayer): AskTag[] {
  switch (layer) {
    case "mood":
      return tags.moods;
    case "attribute":
      return tags.attributes;
    case "category":
      return tags.categories;
  }
}

export function tagPhrase(layer: AskLayer, tag: AskTag): string {
  if (layer === "mood") return MOOD_PHRASES[tag.slug] ?? tag.name;
  if (layer === "attribute") return ATTRIBUTE_PHRASES[tag.slug] ?? tag.name;
  return tag.name;
}

/**
 * 同じ層の言葉のつなぎ。検索ではカテゴリの中はいつも OR
 * （1つのスポットのカテゴリは1つだけ）、特徴と雰囲気の中は tagSearchMode に従う
 */
export function connectorOf(layer: AskLayer, filter: SpotFilter): AskConnector {
  if (layer === "category") return "か";
  return filter.tagSearchMode === "AND" ? "かつ" : "か";
}

export function selectedPhrases(
  filter: SpotFilter,
  tags: AskTags,
  layer: AskLayer,
): { id: string; phrase: string }[] {
  const byId = new Map(tagsOf(tags, layer).map((tag) => [tag.id, tag]));
  return selectedIdsOf(filter, layer).flatMap((id) => {
    const tag = byId.get(id);
    return tag ? [{ id, phrase: tagPhrase(layer, tag) }] : [];
  });
}

export function buildAskSentence(
  filter: SpotFilter,
  tags: AskTags,
): AskSentenceLayer[] {
  return ASK_LAYERS.map((layer) => {
    const phrases = selectedPhrases(filter, tags, layer).map((p) => p.phrase);
    let content: AskLayerContent;
    if (phrases.length === 0) {
      content = { kind: "empty", placeholder: PLACEHOLDERS[layer] };
    } else if (phrases.length >= SUMMARY_THRESHOLD) {
      content = { kind: "summary", first: phrases[0], total: phrases.length };
    } else {
      content = {
        kind: "words",
        words: phrases,
        connector: connectorOf(layer, filter),
      };
    }
    return { layer, label: ASK_LAYER_LABELS[layer], content };
  });
}

export function countSelected(filter: SpotFilter): number {
  return (
    filter.categoryIds.length +
    filter.attributeTagIds.length +
    filter.moodTagIds.length
  );
}

/** 「すべて／どれか」で結果が変わるのは、特徴か雰囲気で2つ以上選んだときだけ */
export function isModeEffective(filter: SpotFilter): boolean {
  return filter.attributeTagIds.length >= 2 || filter.moodTagIds.length >= 2;
}

/** 件数の前に添える、結果がどんな場所かの説明 */
export function describeResult(filter: SpotFilter): string {
  if (countSelected(filter) === 0) return "すべての場所";
  if (!isModeEffective(filter)) return "選んだ条件に当てはまる場所";
  return filter.tagSearchMode === "AND"
    ? "特徴と雰囲気は、選んだ言葉がすべて当てはまる場所"
    : "特徴と雰囲気は、選んだ言葉のどれかが当てはまる場所";
}
