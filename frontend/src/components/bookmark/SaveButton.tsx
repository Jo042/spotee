"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Bookmark } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { FolderPickerSheet, type FolderSheetMode } from "./FolderPickerSheet";

interface SaveButtonProps {
  spotId: string;
  isBookmarked: boolean | null;
  /** overlay: カードの写真の上に重ねる白いアイコン。labeled: 詳細ページ（アイコンと「保存」） */
  variant?: "overlay" | "labeled";
}

/**
 * 未保存ならフォルダを選んで保存するシートを、保存済みなら保存先を
 * 付け外しするシートを開く（保存済みを押しても即解除はしない）
 */
export function SaveButton({
  spotId,
  isBookmarked,
  variant = "overlay",
}: SaveButtonProps) {
  const { user } = useAuth();
  const router = useRouter();
  const [sheetMode, setSheetMode] = useState<FolderSheetMode | null>(null);
  const [popCount, setPopCount] = useState(0);

  const saved = isBookmarked ?? false;
  const label = saved ? "保存済み・保存先を変更" : "フォルダに保存";

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      router.push("/login");
      return;
    }
    setPopCount((n) => n + 1);
    setSheetMode(saved ? "manage" : "save");
  };

  const popClass = popCount > 0 ? "motion-safe:animate-pop" : "";

  return (
    <>
      {variant === "labeled" ? (
        <button
          type="button"
          onClick={handleClick}
          aria-label={label}
          aria-haspopup="dialog"
          className="flex items-center gap-1.5 text-sm font-medium text-gray-900 transition-colors hover:text-gray-600"
        >
          <Bookmark
            key={popCount}
            size={20}
            aria-hidden="true"
            className={`${saved ? "fill-gray-900" : ""} ${popClass}`}
          />
          <span>{saved ? "保存済み" : "保存"}</span>
        </button>
      ) : (
        <button
          type="button"
          onClick={handleClick}
          aria-label={label}
          aria-haspopup="dialog"
          className="p-2 text-white drop-shadow-[0_1px_3px_rgb(0_0_0/0.45)] transition-transform hover:scale-110"
        >
          <Bookmark
            key={popCount}
            size={20}
            aria-hidden="true"
            className={`${saved ? "fill-white" : ""} ${popClass}`}
          />
        </button>
      )}

      {sheetMode && (
        <FolderPickerSheet
          key={sheetMode}
          spotId={spotId}
          mode={sheetMode}
          onClose={() => setSheetMode(null)}
          onRequestManage={() => setSheetMode("manage")}
        />
      )}
    </>
  );
}
