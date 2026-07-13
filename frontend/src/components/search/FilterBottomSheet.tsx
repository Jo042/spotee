"use client";

import { useEffect, useRef, useState } from "react";
import { FilterPanel } from "./FilterPanel";

interface FilterBottomSheetProps {
  open: boolean;
  totalCount?: number;
  onClose: () => void;
}

const SWIPE_CLOSE_THRESHOLD_PX = 80;

const FOCUSABLE_SELECTOR =
  'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

export function FilterBottomSheet({ open, totalCount, onClose }: FilterBottomSheetProps) {
  const sheetRef = useRef<HTMLDivElement>(null);
  const touchStartY = useRef<number | null>(null);
  const [dragY, setDragY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const previouslyFocused = document.activeElement as HTMLElement | null;

    const getFocusable = () => {
      const sheet = sheetRef.current;
      if (!sheet) return [];
      return Array.from(sheet.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter(
        (el) => !el.hasAttribute("disabled"),
      );
    };

    getFocusable()[0]?.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
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
  }, [open, onClose]);

  if (!open) return null;

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartY.current == null) return;
    setDragY(Math.max(0, e.touches[0].clientY - touchStartY.current));
  };

  const handleTouchEnd = () => {
    touchStartY.current = null;
    setIsDragging(false);
    if (dragY > SWIPE_CLOSE_THRESHOLD_PX) {
      onClose();
    }
    setDragY(0);
  };

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      <div
        className="absolute inset-0 bg-black/40 animate-fade-in motion-reduce:animate-none"
        onClick={onClose}
      />
      <div
        ref={sheetRef}
        role="dialog"
        aria-modal="true"
        aria-label="絞り込み"
        style={{
          transform: dragY > 0 ? `translateY(${dragY}px)` : undefined,
          transition: isDragging ? "none" : undefined,
        }}
        className="absolute bottom-0 left-0 right-0 flex flex-col bg-white rounded-t-2xl max-h-[85vh] animate-sheet-up motion-reduce:animate-none transition-transform duration-200 ease-out"
      >
        <div
          className="relative flex justify-center pt-3 pb-2 touch-none"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <span className="w-10 h-1 rounded-full bg-gray-300" aria-hidden="true" />
          <button
            onClick={onClose}
            aria-label="閉じる"
            className="absolute right-3 top-2 p-1.5 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="overflow-y-auto px-5 py-4">
          <FilterPanel />
        </div>
        <div className="border-t border-gray-100 px-5 py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))]">
          <button
            onClick={onClose}
            className="w-full bg-primary-600 text-white text-sm font-bold py-3 rounded-lg hover:bg-primary-700 active:scale-[0.98] transition"
          >
            {typeof totalCount === "number"
              ? `${totalCount}件のスポットを表示`
              : "スポットを表示"}
          </button>
        </div>
      </div>
    </div>
  );
}
