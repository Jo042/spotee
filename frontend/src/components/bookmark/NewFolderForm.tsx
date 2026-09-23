"use client";

import { useState } from "react";
import { Plus } from "lucide-react";

export const FOLDER_NAME_MAX_LENGTH = 30;

interface NewFolderFormProps {
  /** 作成に成功したら true を返す。失敗時の文言は error で渡す */
  onSubmit: (name: string) => Promise<boolean>;
  error: string | null;
  submitting: boolean;
  /** フォルダが1つも無いときは、最初から入力欄を開いておく */
  defaultOpen: boolean;
}

export function NewFolderForm({
  onSubmit,
  error,
  submitting,
  defaultOpen,
}: NewFolderFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState("");

  if (!isOpen && !defaultOpen) {
    return (
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="flex w-full items-center gap-3 rounded-lg px-2 py-2.5 text-sm font-bold text-primary-600 transition-colors hover:bg-primary-50 hover:text-primary-700"
      >
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-dashed border-primary-200">
          <Plus size={18} aria-hidden="true" />
        </span>
        新しいフォルダを作成
      </button>
    );
  }

  const trimmed = name.trim();

  const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!trimmed || submitting) return;
    const created = await onSubmit(trimmed);
    if (created) {
      setName("");
      setIsOpen(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="rounded-lg bg-gray-50 p-3">
      <div className="flex items-center justify-between">
        <label
          htmlFor="new-folder-name"
          className="text-xs font-bold text-gray-700"
        >
          新しいフォルダ
        </label>
        <span className="text-xs text-gray-400" aria-hidden="true">
          {name.length}/{FOLDER_NAME_MAX_LENGTH}
        </span>
      </div>
      <div className="mt-2 flex gap-2">
        <input
          id="new-folder-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={FOLDER_NAME_MAX_LENGTH}
          placeholder="例: 行きたい、デート"
          autoComplete="off"
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? "new-folder-error" : undefined}
          className="min-w-0 flex-1 rounded-lg border border-gray-200 bg-white px-3 py-2 text-[15px] text-gray-900 placeholder:text-gray-400 focus:border-primary-700 focus:outline-none focus:ring-1 focus:ring-primary-700"
        />
        <button
          type="submit"
          disabled={!trimmed || submitting}
          className="shrink-0 rounded-lg bg-primary-600 px-4 text-sm font-bold text-white transition hover:bg-primary-700 active:scale-[0.98] disabled:opacity-40"
        >
          作成
        </button>
      </div>
      {error && (
        <p
          id="new-folder-error"
          role="alert"
          className="mt-2 text-xs text-red-600"
        >
          {error}
        </p>
      )}
    </form>
  );
}
