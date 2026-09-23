"use client";

import { useState } from "react";
import Image from "next/image";
import type { ApolloCache } from "@apollo/client";
import { useMutation, useQuery } from "@apollo/client/react";
import { Bookmark, Check } from "lucide-react";
import { BottomSheet } from "@/components/common/BottomSheet";
import { useToast } from "@/components/common/toast/ToastProvider";
import { NewFolderForm } from "./NewFolderForm";
import {
  GET_MY_FOLDERS,
  GET_SPOT_BOOKMARK_STATE,
} from "@/graphql/queries/bookmark";
import {
  ADD_BOOKMARK,
  CREATE_FOLDER,
  REMOVE_BOOKMARK,
} from "@/graphql/mutations/bookmark";
import { getUserFacingErrorMessage } from "@/lib/graphql-error";
import { withFolderId, withoutFolderId } from "@/lib/bookmark";
import { formatCount } from "@/lib/format";

/** save: 未保存のスポットを1タップで保存する / manage: 保存先を付け外しする */
export type FolderSheetMode = "save" | "manage";

/** フォルダを選んでから閉じるまでの間。チェックが付いたことを目で追えるようにする */
const CLOSE_AFTER_SELECT_MS = 180;

interface FolderPickerSheetProps {
  spotId: string;
  mode: FolderSheetMode;
  onClose: () => void;
  /** 保存直後のトーストの「変更」から、管理モードで開き直す */
  onRequestManage: () => void;
}

interface FolderRow {
  id: string;
  name: string;
  spotCount: number;
  thumbnailUrl?: string | null;
}

export function FolderPickerSheet({
  spotId,
  mode,
  onClose,
  onRequestManage,
}: FolderPickerSheetProps) {
  const toast = useToast();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [createError, setCreateError] = useState<string | null>(null);

  const { data: foldersData, loading: foldersLoading } = useQuery(
    GET_MY_FOLDERS,
    { fetchPolicy: "cache-and-network" },
  );
  const { data: stateData } = useQuery(GET_SPOT_BOOKMARK_STATE, {
    variables: { id: spotId },
    fetchPolicy: "cache-and-network",
  });

  const folders: FolderRow[] = foldersData?.myFolders ?? [];
  const savedIds = stateData?.spot?.bookmarkFolderIds ?? [];

  const [addBookmark] = useMutation(ADD_BOOKMARK);
  const [removeBookmark] = useMutation(REMOVE_BOOKMARK);
  const [createFolder, { loading: creating }] = useMutation(CREATE_FOLDER, {
    update(cache, { data }) {
      const created = data?.createFolder;
      if (!created) return;
      cache.updateQuery({ query: GET_MY_FOLDERS }, (prev) =>
        prev ? { myFolders: [created, ...prev.myFolders] } : prev,
      );
    },
  });

  /**
   * 件数だけをキャッシュ上で直す。一覧を取り直すと「直近使った順」で並び替わり、
   * 付け外しの最中に行が動いてしまうため、並びは次に開いたときに更新する
   */
  const adjustSpotCount =
    (folderId: string, delta: 1 | -1) => (cache: ApolloCache) => {
      cache.modify({
        id: cache.identify({ __typename: "Folder", id: folderId }),
        fields: { spotCount: (count: number) => Math.max(0, count + delta) },
      });
    };

  const save = (folder: FolderRow) =>
    addBookmark({
      variables: { spotId, folderId: folder.id },
      optimisticResponse: {
        addBookmark: {
          __typename: "Spot",
          id: spotId,
          isBookmarked: true,
          bookmarkFolderIds: withFolderId(savedIds, folder.id),
        },
      },
      update: savedIds.includes(folder.id)
        ? undefined
        : adjustSpotCount(folder.id, 1),
    });

  const unsave = (folder: FolderRow) => {
    const next = withoutFolderId(savedIds, folder.id);
    return removeBookmark({
      variables: { spotId, folderId: folder.id },
      optimisticResponse: {
        removeBookmark: {
          __typename: "Spot",
          id: spotId,
          isBookmarked: next.length > 0,
          bookmarkFolderIds: next,
        },
      },
      update: savedIds.includes(folder.id)
        ? adjustSpotCount(folder.id, -1)
        : undefined,
    });
  };

  const notifyError = (error: unknown, fallback: string) =>
    toast.error(getUserFacingErrorMessage(error, fallback));

  const saveAndClose = (folder: FolderRow) => {
    setSelectedId(folder.id);
    setTimeout(onClose, CLOSE_AFTER_SELECT_MS);
    save(folder)
      .then(() =>
        toast.success(`「${folder.name}」に保存しました`, {
          action: { label: "変更", onClick: onRequestManage },
        }),
      )
      .catch((error: unknown) => notifyError(error, "保存に失敗しました"));
  };

  const toggle = (folder: FolderRow) => {
    const request = savedIds.includes(folder.id) ? unsave : save;
    request(folder).catch((error: unknown) =>
      notifyError(error, "保存先の変更に失敗しました"),
    );
  };

  const handleCreate = async (name: string): Promise<boolean> => {
    setCreateError(null);
    try {
      const { data } = await createFolder({ variables: { input: { name } } });
      const created = data?.createFolder;
      if (!created) return false;
      if (mode === "save") {
        saveAndClose(created);
      } else {
        toggle(created);
      }
      return true;
    } catch (error) {
      setCreateError(
        getUserFacingErrorMessage(error, "フォルダを作成できませんでした"),
      );
      return false;
    }
  };

  const isFirstLoad = foldersLoading && !foldersData;

  return (
    <BottomSheet
      open
      onClose={onClose}
      label={mode === "save" ? "フォルダに保存" : "保存先のフォルダ"}
      title={mode === "save" ? "フォルダに保存" : "保存先のフォルダ"}
      desktop="dialog"
      footer={
        mode === "manage" ? (
          <button
            type="button"
            onClick={onClose}
            className="w-full rounded-lg bg-primary-600 py-3 text-sm font-bold text-white transition hover:bg-primary-700 active:scale-[0.98]"
          >
            完了
          </button>
        ) : undefined
      }
    >
      {isFirstLoad ? (
        <FolderListSkeleton />
      ) : (
        <ul className="-mx-2 space-y-0.5" aria-label="フォルダ">
          {folders.map((folder) => (
            <li key={folder.id}>
              {mode === "save" ? (
                <button
                  type="button"
                  onClick={() => saveAndClose(folder)}
                  disabled={selectedId !== null}
                  className="flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left transition-colors hover:bg-gray-50 disabled:cursor-default"
                >
                  <FolderSummary folder={folder} />
                  {selectedId === folder.id && (
                    <Check
                      size={20}
                      aria-hidden="true"
                      className="shrink-0 text-primary-600 animate-scale-in motion-reduce:animate-none"
                    />
                  )}
                </button>
              ) : (
                <button
                  type="button"
                  role="checkbox"
                  aria-checked={savedIds.includes(folder.id)}
                  onClick={() => toggle(folder)}
                  className="flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left transition-colors hover:bg-gray-50"
                >
                  <FolderSummary folder={folder} />
                  <CheckboxMark checked={savedIds.includes(folder.id)} />
                </button>
              )}
            </li>
          ))}
        </ul>
      )}

      <div className={folders.length > 0 ? "mt-2" : ""}>
        <NewFolderForm
          onSubmit={handleCreate}
          error={createError}
          submitting={creating}
          defaultOpen={!isFirstLoad && folders.length === 0}
        />
      </div>
    </BottomSheet>
  );
}

function FolderSummary({ folder }: { folder: FolderRow }) {
  return (
    <>
      <span className="relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-gray-100 text-gray-400">
        {folder.thumbnailUrl ? (
          <Image
            src={folder.thumbnailUrl}
            alt=""
            fill
            sizes="40px"
            className="object-cover"
          />
        ) : (
          <Bookmark size={18} aria-hidden="true" />
        )}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-bold text-gray-900">
          {folder.name}
        </span>
        <span className="block text-xs text-gray-500">
          {formatCount(folder.spotCount)}件
        </span>
      </span>
    </>
  );
}

function CheckboxMark({ checked }: { checked: boolean }) {
  return (
    <span
      aria-hidden="true"
      className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md border transition-colors ${
        checked
          ? "border-primary-600 bg-primary-600 text-white"
          : "border-gray-300 bg-white text-transparent"
      }`}
    >
      <Check size={16} strokeWidth={3} />
    </span>
  );
}

function FolderListSkeleton() {
  return (
    <div className="space-y-3" aria-label="読み込み中">
      {[0, 1, 2].map((i) => (
        <div key={i} className="flex items-center gap-3">
          <div className="h-10 w-10 animate-pulse rounded-lg bg-gray-100" />
          <div className="h-4 flex-1 animate-pulse rounded bg-gray-100" />
        </div>
      ))}
    </div>
  );
}
