"use client";

import Image from "next/image";
import { ArrowDown, ArrowUp, ImageOff, X } from "lucide-react";
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
      <p className="border-t border-gray-200 py-6 text-center text-sm text-gray-500">
        上の一覧からスポットを選ぶと、ここに並びます
      </p>
    );
  }

  return (
    <ol className="space-y-3">
      {spots.map((spot, index) => (
        <li key={spot.spotId} className="border-t border-gray-200 py-4">
          <div className="flex items-center gap-3">
            <span className="w-14 shrink-0 text-sm font-bold text-primary-700">
              {index + 1}か所目
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
            <span className="sr-only">{spot.title} のひとこと</span>
            <textarea
              value={spot.comment}
              onChange={(e) => onCommentChange(spot.spotId, e.target.value)}
              maxLength={COLLECTION_COMMENT_MAX_LENGTH}
              rows={2}
              placeholder="ひとこと（任意）: この特集に入れた理由、行くときのコツなど"
              className="text-input text-sm"
            />
            <span className="mt-0.5 block text-right text-xs tabular-nums text-gray-500">
              {spot.comment.length}/{COLLECTION_COMMENT_MAX_LENGTH}
            </span>
          </label>
        </li>
      ))}
    </ol>
  );
}
