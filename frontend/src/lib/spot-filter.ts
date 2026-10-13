import type { SpotFilterInput } from "@/graphql/generated/graphql";
import { TagSearchMode as GqlTagSearchMode } from "@/graphql/generated/graphql";

export type TagSearchMode = "AND" | "OR";

export interface SpotFilter {
  categoryIds: string[];
  attributeTagIds: string[];
  moodTagIds: string[];
  tagSearchMode: TagSearchMode;
  keyword?: string;
}

export const EMPTY_SPOT_FILTER: SpotFilter = {
  categoryIds: [],
  attributeTagIds: [],
  moodTagIds: [],
  tagSearchMode: "OR",
};

const ID_LIST_KEYS = ["categoryIds", "attributeTagIds", "moodTagIds"] as const;

interface ReadableParams {
  get(name: string): string | null;
}

export function parseSpotFilter(params: ReadableParams): SpotFilter {
  const readIds = (key: string) =>
    (params.get(key) ?? "").split(",").filter(Boolean);

  return {
    categoryIds: readIds("categoryIds"),
    attributeTagIds: readIds("attributeTagIds"),
    moodTagIds: readIds("moodTagIds"),
    tagSearchMode: params.get("tagSearchMode") === "AND" ? "AND" : "OR",
    keyword: params.get("keyword") || undefined,
  };
}

/** 絞り込みの条件を URL のパラメータに書く。並び順など、ほかのパラメータは残す */
export function writeSpotFilter(
  params: URLSearchParams,
  filter: SpotFilter,
): void {
  for (const key of ID_LIST_KEYS) {
    if (filter[key].length > 0) {
      params.set(key, filter[key].join(","));
    } else {
      params.delete(key);
    }
  }

  // 既定は OR なので、AND のときだけ書く
  if (filter.tagSearchMode === "AND") {
    params.set("tagSearchMode", "AND");
  } else {
    params.delete("tagSearchMode");
  }

  if (filter.keyword) {
    params.set("keyword", filter.keyword);
  } else {
    params.delete("keyword");
  }
}

export function buildSpotsHref(filter: SpotFilter): string {
  const params = new URLSearchParams();
  writeSpotFilter(params, filter);
  const query = params.toString();
  return query ? `/spots?${query}` : "/spots";
}

export function toSpotFilterInput(filter: SpotFilter): SpotFilterInput {
  return {
    categoryIds: filter.categoryIds.length > 0 ? filter.categoryIds : undefined,
    attributeTagIds:
      filter.attributeTagIds.length > 0 ? filter.attributeTagIds : undefined,
    moodTagIds: filter.moodTagIds.length > 0 ? filter.moodTagIds : undefined,
    tagSearchMode:
      filter.tagSearchMode === "AND"
        ? GqlTagSearchMode.And
        : GqlTagSearchMode.Or,
    keyword: filter.keyword,
  };
}
