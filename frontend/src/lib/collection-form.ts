import type { CollectionInput } from "@/graphql/generated/graphql";

/**
 * サーバーの検証の上限（backend/src/collection/dto/collection-input.constants.ts）の写し。
 * 値が一致することを単体テストで確かめている
 */
export const COLLECTION_TITLE_MAX_LENGTH = 60;
export const COLLECTION_DESCRIPTION_MAX_LENGTH = 1000;
export const COLLECTION_COMMENT_MAX_LENGTH = 200;
export const COLLECTION_SPOTS_MAX = 30;

export interface SelectedSpot {
  spotId: string;
  title: string;
  imageUrl: string | null;
  comment: string;
}

/** 選んでいなければ末尾に足し、選んでいれば外す。上限に達していたら足さない */
export function toggleSpot(
  spots: readonly SelectedSpot[],
  spot: Omit<SelectedSpot, "comment">,
  max: number = COLLECTION_SPOTS_MAX,
): SelectedSpot[] {
  if (spots.some((s) => s.spotId === spot.spotId)) {
    return spots.filter((s) => s.spotId !== spot.spotId);
  }
  if (spots.length >= max) return [...spots];
  return [...spots, { ...spot, comment: "" }];
}

/** index の項目を1つ前（-1）または1つ後ろ（1）と入れ替える。端では何もしない */
export function moveSpot(
  spots: readonly SelectedSpot[],
  index: number,
  direction: -1 | 1,
): SelectedSpot[] {
  const target = index + direction;
  if (target < 0 || target >= spots.length) return [...spots];

  const next = [...spots];
  [next[index], next[target]] = [next[target], next[index]];
  return next;
}

export function updateComment(
  spots: readonly SelectedSpot[],
  spotId: string,
  comment: string,
): SelectedSpot[] {
  return spots.map((s) => (s.spotId === spotId ? { ...s, comment } : s));
}

const trimOrNull = (value: string | null | undefined) => {
  const trimmed = value?.trim() ?? "";
  return trimmed === "" ? null : trimmed;
};

/** 送信する形に直す。並びは画面の順のまま（サーバーが配列の順を表示順にする） */
export function toCollectionInput(
  values: { title: string; description: string; coverImageUrl: string | null },
  spots: readonly SelectedSpot[],
): CollectionInput {
  return {
    title: values.title.trim(),
    description: trimOrNull(values.description),
    coverImageUrl: values.coverImageUrl,
    spots: spots.map((s) => ({
      spotId: s.spotId,
      comment: trimOrNull(s.comment),
    })),
  };
}
