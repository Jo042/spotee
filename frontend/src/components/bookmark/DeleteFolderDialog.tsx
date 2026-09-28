"use client";

import { useRouter } from "next/navigation";
import { useMutation } from "@apollo/client/react";
import { BottomSheet } from "@/components/common/BottomSheet";
import { useToast } from "@/components/common/toast/ToastProvider";
import { DELETE_FOLDER } from "@/graphql/mutations/bookmark";
import { getUserFacingErrorMessage } from "@/lib/graphql-error";

interface DeleteFolderDialogProps {
  folder: { id: string; name: string };
  /** 表示中のスポット。削除後に保存状態を取り直させる */
  spotIds: readonly string[];
  onClose: () => void;
}

export function DeleteFolderDialog({
  folder,
  spotIds,
  onClose,
}: DeleteFolderDialogProps) {
  const router = useRouter();
  const toast = useToast();

  const [deleteFolder, { loading }] = useMutation(DELETE_FOLDER, {
    update(cache, { data }) {
      if (!data) return;
      cache.evict({
        id: cache.identify({ __typename: "Folder", id: data.deleteFolder }),
      });
      // このフォルダにしか入っていなかったスポットは未保存に戻る。
      // どれが戻るかは手元で分からないので、保存状態を捨てて取り直させる
      for (const spotId of spotIds) {
        const id = cache.identify({ __typename: "Spot", id: spotId });
        cache.evict({ id, fieldName: "isBookmarked" });
        cache.evict({ id, fieldName: "bookmarkFolderIds" });
      }
      cache.gc();
    },
  });

  const handleDelete = async () => {
    try {
      await deleteFolder({ variables: { id: folder.id } });
      toast.success(`「${folder.name}」を削除しました`);
      router.replace("/mypage?tab=folders");
    } catch (err) {
      toast.error(
        getUserFacingErrorMessage(err, "フォルダを削除できませんでした"),
      );
      onClose();
    }
  };

  return (
    <BottomSheet
      open
      onClose={onClose}
      label="フォルダを削除"
      title="フォルダを削除しますか？"
      desktop="dialog"
    >
      <p className="text-sm leading-relaxed text-gray-600">
        「<span className="font-bold text-gray-900">{folder.name}</span>
        」を削除します。このフォルダへの保存もすべて解除されます（スポット自体は削除されません）。
      </p>
      <div className="mt-5 flex gap-3">
        <button
          type="button"
          onClick={onClose}
          className="flex-1 rounded-lg border border-gray-200 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
        >
          キャンセル
        </button>
        <button
          type="button"
          onClick={handleDelete}
          disabled={loading}
          className="flex-1 rounded-lg bg-red-600 py-2.5 text-sm font-bold text-white transition hover:bg-red-700 active:scale-[0.98] disabled:opacity-40"
        >
          削除する
        </button>
      </div>
    </BottomSheet>
  );
}
