"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Cropper, { type Area, type MediaSize } from "react-easy-crop";
import {
  SPOT_IMAGE_ASPECT,
  calculateMaxZoom,
  type CropArea,
} from "@/lib/image-crop";

interface ImageCropModalProps {
  imageSrc: string;
  progressLabel: string;
  showSkipAll: boolean;
  onConfirm: (area: CropArea) => void;
  onSkip: () => void;
  onSkipAll: () => void;
  onCancel: () => void;
}

const FOCUSABLE_SELECTOR =
  'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

export function ImageCropModal({
  imageSrc,
  progressLabel,
  showSkipAll,
  onConfirm,
  onSkip,
  onSkipAll,
  onCancel,
}: ImageCropModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [maxZoom, setMaxZoom] = useState(1);
  const [croppedArea, setCroppedArea] = useState<CropArea | null>(null);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  useEffect(() => {
    const previouslyFocused = document.activeElement as HTMLElement | null;

    const getFocusable = () => {
      const dialog = dialogRef.current;
      if (!dialog) return [];
      return Array.from(
        dialog.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
      ).filter((el) => !el.hasAttribute("disabled"));
    };

    getFocusable()[0]?.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onCancel();
        return;
      }
      if (e.key !== "Tab") return;

      const focusable = getFocusable();
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      previouslyFocused?.focus();
    };
  }, [onCancel]);

  // width/height は表示上のサイズ。切り抜き座標は元画像のピクセル基準で返るため
  // ズーム上限も naturalWidth/naturalHeight から求める
  const handleMediaLoaded = useCallback((mediaSize: MediaSize) => {
    setMaxZoom(
      calculateMaxZoom({
        width: mediaSize.naturalWidth,
        height: mediaSize.naturalHeight,
      }),
    );
  }, []);

  const handleCropComplete = useCallback((_: Area, areaPixels: Area) => {
    setCroppedArea(areaPixels);
  }, []);

  const handleConfirm = () => {
    if (croppedArea) onConfirm(croppedArea);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
      role="dialog"
      aria-modal="true"
      aria-label="画像の切り抜き"
    >
      <div
        ref={dialogRef}
        className="flex w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-xl"
      >
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
          <h2 className="text-base font-semibold text-gray-900">
            画像の切り抜き
          </h2>
          <span className="text-sm text-gray-500">{progressLabel}</span>
        </div>

        <div className="relative aspect-video w-full bg-gray-900">
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            maxZoom={maxZoom}
            aspect={SPOT_IMAGE_ASPECT}
            showGrid
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onMediaLoaded={handleMediaLoaded}
            onCropComplete={handleCropComplete}
          />
        </div>

        <div className="space-y-4 px-5 py-4">
          <p className="text-sm text-gray-500">
            カード表示に合わせて 16:9 で切り抜かれます。ドラッグで位置を、スライダーで大きさを調整できます。
          </p>

          <label className="flex items-center gap-3">
            <span className="text-sm text-gray-600">ズーム</span>
            <input
              type="range"
              min={1}
              max={maxZoom}
              step={0.01}
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              disabled={maxZoom <= 1}
              aria-label="ズーム"
              className="flex-1 accent-primary-600 disabled:opacity-40"
            />
          </label>

          <div className="flex flex-wrap items-center justify-end gap-2">
            <button
              type="button"
              onClick={onCancel}
              className="rounded-lg px-4 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100"
            >
              この画像をやめる
            </button>
            {showSkipAll && (
              <button
                type="button"
                onClick={onSkipAll}
                className="rounded-lg px-4 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100"
              >
                残りすべてスキップ
              </button>
            )}
            <button
              type="button"
              onClick={onSkip}
              className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
            >
              切り抜かない
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={!croppedArea}
              className="rounded-lg bg-primary-600 px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary-700 disabled:opacity-40"
            >
              決定
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
