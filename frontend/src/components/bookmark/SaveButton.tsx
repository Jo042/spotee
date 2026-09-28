"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Bookmark } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { FolderPickerSheet, type FolderSheetMode } from "./FolderPickerSheet";

interface SaveButtonProps {
  spotId: string;
  isBookmarked: boolean | null;
  variant?: "inline" | "pill";
}

/**
 * 未保存ならフォルダを選んで保存するシートを、保存済みなら保存先を
 * 付け外しするシートを開く（保存済みを押しても即解除はしない）
 */
export function SaveButton({
  spotId,
  isBookmarked,
  variant = "inline",
}: SaveButtonProps) {
  const { user } = useAuth();
  const router = useRouter();
  const [sheetMode, setSheetMode] = useState<FolderSheetMode | null>(null);

  const saved = isBookmarked ?? false;
  const label = saved ? "保存済み・保存先を変更" : "フォルダに保存";

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      router.push("/login");
      return;
    }
    setSheetMode(saved ? "manage" : "save");
  };

  const icon = (
    <Bookmark
      size={variant === "pill" ? 16 : 14}
      aria-hidden="true"
      className={saved ? "fill-primary-600" : ""}
    />
  );

  return (
    <>
      {variant === "pill" ? (
        <button
          type="button"
          onClick={handleClick}
          aria-label={label}
          aria-haspopup="dialog"
          className={`flex items-center gap-1.5 rounded-full border px-4 py-2 text-sm font-medium transition-colors active:scale-95 ${
            saved
              ? "border-primary-200 bg-primary-50 text-primary-600"
              : "border-gray-200 text-gray-500 hover:border-primary-200 hover:text-primary-600"
          }`}
        >
          {icon}
          <span>{saved ? "保存済み" : "保存"}</span>
        </button>
      ) : (
        <button
          type="button"
          onClick={handleClick}
          aria-label={label}
          aria-haspopup="dialog"
          className={`p-2 -m-2 transition-colors ${
            saved ? "text-primary-600" : "text-gray-400 hover:text-primary-600"
          }`}
        >
          {icon}
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
