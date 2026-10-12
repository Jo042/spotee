"use client";

import Image from "next/image";
import { ArrowDown, ArrowUp, ImageOff, X } from "lucide-react";
import { formatRank } from "@/lib/format";
import {
  COLLECTION_COMMENT_MAX_LENGTH,
  type SelectedSpot,
} from "@/lib/collection-form";

interface SelectedSpotListProps {
  spots: readonly SelectedSpot[];
  onMove: (index: number, direction: -1 | 1) => void;
  onRemove: (spot: SelectedSpot) => void;
  onCommentChange: (spotId: string, comment: string) => void;
}

const iconButton =
  "flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-gray-600 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-30";

/** 選んだスポットの並び順と添え書き */
export function SelectedSpotList({
  spots,
  onMove,
  onRemove,
  onCommentChange,
}: SelectedSpotListProps) {
  if (spots.length === 0) {
    return (
      <p className="rounded-lg bg-gray-50 px-4 py-6 text-center text-sm text-gray-500">
        上の一覧からスポットを選ぶと、ここに並びます
      </p>
    );
  }

  return (
    <ol className="space-y-3">
      {spots.map((spot, index) => (
        <li
          key={spot.spotId}
          className="rounded-xl border border-gray-200 bg-white p-3"
        >
          <div className="flex items-center gap-3">
            <span className="w-7 shrink-0 text-base font-bold tabular-nums text-primary-700">
              {formatRank(index + 1)}
            </span>
            <span className="relative h-12 w-12 shrink-0 overflow-hidden rounded-md bg-gray-100">
              {spot.imageUrl ? (
                <Image
                  src={spot.imageUrl}
                  alt=""
                  fill
                  sizes="48px"
                  className="object-cover"
                />
              ) : (
                <span className="flex h-full items-center justify-center text-gray-400">
                  <ImageOff size={16} aria-hidden="true" />
                </span>
              )}
            </span>
            <span className="min-w-0 flex-1 truncate text-sm font-medium text-gray-900">
              {spot.title}
            </span>
            <div className="flex shrink-0 gap-1.5">
              <button
                type="button"
                onClick={() => onMove(index, -1)}
                disabled={index === 0}
                aria-label={`${spot.title} を上へ移動`}
                className={iconButton}
              >
                <ArrowUp size={16} aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={() => onMove(index, 1)}
                disabled={index === spots.length - 1}
                aria-label={`${spot.title} を下へ移動`}
                className={iconButton}
              >
                <ArrowDown size={16} aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={() => onRemove(spot)}
                aria-label={`${spot.title} を特集から外す`}
                className={iconButton}
              >
                <X size={16} aria-hidden="true" />
              </button>
            </div>
          </div>

          <label className="mt-3 block">
            <span className="sr-only">{spot.title} の添え書き</span>
            <textarea
              value={spot.comment}
              onChange={(e) => onCommentChange(spot.spotId, e.target.value)}
              maxLength={COLLECTION_COMMENT_MAX_LENGTH}
              rows={2}
              placeholder="添え書き（任意）: このスポットをこの特集に入れた理由など"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 transition focus:border-primary-700 focus:outline-none focus:ring-1 focus:ring-primary-700"
            />
            <span className="mt-0.5 block text-right text-xs text-gray-400">
              {spot.comment.length}/{COLLECTION_COMMENT_MAX_LENGTH}
            </span>
          </label>
        </li>
      ))}
    </ol>
  );
}
