"use client";

import { useState } from "react";
import { useMutation } from "@apollo/client/react";
import { BottomSheet } from "@/components/common/BottomSheet";
import { useToast } from "@/components/common/toast/ToastProvider";
import { RENAME_FOLDER } from "@/graphql/mutations/bookmark";
import { getUserFacingErrorMessage } from "@/lib/graphql-error";
import { FOLDER_NAME_MAX_LENGTH } from "./NewFolderForm";

interface RenameFolderDialogProps {
  folder: { id: string; name: string };
  onClose: () => void;
}

/** 開いているときだけ描画する前提（初期値に現在の名前を入れるため） */
export function RenameFolderDialog({
  folder,
  onClose,
}: RenameFolderDialogProps) {
  const toast = useToast();
  const [name, setName] = useState(folder.name);
  const [error, setError] = useState<string | null>(null);
  const [renameFolder, { loading }] = useMutation(RENAME_FOLDER);

  const trimmed = name.trim();
  const canSubmit = trimmed !== "" && trimmed !== folder.name && !loading;

  const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!canSubmit) return;
    setError(null);
    try {
      await renameFolder({
        variables: { id: folder.id, input: { name: trimmed } },
      });
      toast.success("フォルダ名を変更しました");
      onClose();
    } catch (err) {
      setError(
        getUserFacingErrorMessage(err, "フォルダ名を変更できませんでした"),
      );
    }
  };

  return (
    <BottomSheet
      open
      onClose={onClose}
      label="フォルダ名を変更"
      title="フォルダ名を変更"
      desktop="dialog"
    >
      <form onSubmit={handleSubmit}>
        <div className="flex items-center justify-between">
          <label
            htmlFor="rename-folder"
            className="text-xs font-bold text-gray-700"
          >
            フォルダ名
          </label>
          <span className="text-xs text-gray-400" aria-hidden="true">
            {name.length}/{FOLDER_NAME_MAX_LENGTH}
          </span>
        </div>
        <input
          id="rename-folder"
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={FOLDER_NAME_MAX_LENGTH}
          autoComplete="off"
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? "rename-folder-error" : undefined}
          className="mt-2 w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-[15px] text-gray-900 focus:border-primary-700 focus:outline-none focus:ring-1 focus:ring-primary-700"
        />
        {error && (
          <p
            id="rename-folder-error"
            role="alert"
            className="mt-2 text-xs text-red-600"
          >
            {error}
          </p>
        )}
        <div className="mt-5 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-lg border border-gray-200 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
          >
            キャンセル
          </button>
          <button
            type="submit"
            disabled={!canSubmit}
            className="flex-1 rounded-lg bg-primary-600 py-2.5 text-sm font-bold text-white transition hover:bg-primary-700 active:scale-[0.98] disabled:opacity-40"
          >
            保存
          </button>
        </div>
      </form>
    </BottomSheet>
  );
}
