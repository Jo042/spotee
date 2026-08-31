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
  onConfirm: (area: CropArea) => void;
  onSkip: () => void;
  onDiscard: () => void;
}

const FOCUSABLE_SELECTOR =
  'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

export function ImageCropModal({
  imageSrc,
  progressLabel,
  onConfirm,
  onSkip,
  onDiscard,
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

    // 先頭の要素（＝破棄ボタン）に当てると、開いた直後の Enter で写真を捨てて
    // しまうため、ダイアログ自体にフォーカスを移す
    dialogRef.current?.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onDiscard();
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
  }, [onDiscard]);

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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-label="画像の切り抜き"
    >
      <div
        ref={dialogRef}
        tabIndex={-1}
        className="flex h-dvh w-full flex-col outline-none overflow-hidden bg-white sm:h-auto sm:max-w-5xl sm:rounded-2xl sm:shadow-xl"
      >
        <header className="flex shrink-0 items-center justify-between gap-3 border-b border-gray-100 px-2 py-2 sm:px-5 sm:py-3">
          <button
            type="button"
            onClick={onDiscard}
            className="flex min-h-11 items-center rounded-lg px-3 text-sm font-bold text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700"
          >
            この写真を使わない
          </button>
          <h2 className="hidden text-lg font-bold text-gray-900 sm:block">
            画像の切り抜き
          </h2>
          <span className="px-2 text-sm text-gray-500">{progressLabel}</span>
        </header>

        <div className="relative min-h-0 flex-1 bg-gray-900 sm:h-[65vh] sm:flex-none">
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            maxZoom={maxZoom}
            aspect={SPOT_IMAGE_ASPECT}
            showGrid
            // 画像全体が見えるように収める。クロップ領域の高さから表示サイズが
            // 決まる前提なので、cover に変えるとレイアウトの根拠が崩れる
            objectFit="contain"
            // 既定ではクロップ領域上のホイール／2本指スクロールでズームしてしまう。
            // ズームはスライダーと実機のピンチ（別系統のタッチ処理）に任せる
            zoomWithScroll={false}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onMediaLoaded={handleMediaLoaded}
            onCropComplete={handleCropComplete}
          />
        </div>

        <div className="shrink-0 space-y-3 px-4 py-4 sm:px-5">
          <p className="text-sm text-gray-500">
            カード表示に合わせて 16:9 で切り抜かれます
          </p>

          <label className="flex min-h-11 items-center gap-3">
            <span className="shrink-0 text-sm text-gray-600">ズーム</span>
            <input
              type="range"
              min={1}
              max={maxZoom}
              step={0.01}
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              disabled={maxZoom <= 1}
              aria-label="ズーム"
              className="h-2 flex-1 cursor-pointer appearance-none rounded-full bg-gray-200 accent-primary-600 disabled:cursor-not-allowed disabled:opacity-40 [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary-600 [&::-webkit-slider-thumb]:shadow-sm"
            />
          </label>

          <div className="grid grid-cols-2 gap-3 sm:flex sm:justify-end">
            <button
              type="button"
              onClick={onSkip}
              className="min-h-11 rounded-lg border border-gray-200 px-5 text-sm font-bold text-gray-700 transition-colors hover:bg-gray-50 sm:min-w-40"
            >
              切り抜かずに使う
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={!croppedArea}
              className="min-h-11 rounded-lg bg-primary-600 px-5 text-sm font-bold text-white transition-colors hover:bg-primary-700 active:scale-[0.98] disabled:opacity-40 sm:min-w-40"
            >
              決定
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
