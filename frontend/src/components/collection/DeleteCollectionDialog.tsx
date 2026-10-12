"use client";

import { useRouter } from "next/navigation";
import { useMutation } from "@apollo/client/react";
import { BottomSheet } from "@/components/common/BottomSheet";
import { useToast } from "@/components/common/toast/ToastProvider";
import { DELETE_COLLECTION } from "@/graphql/mutations/collection";
import { getUserFacingErrorMessage } from "@/lib/graphql-error";
import { evictCollectionLists } from "@/lib/collection-cache";

interface DeleteCollectionDialogProps {
  collection: { id: string; title: string };
  onClose: () => void;
}

export function DeleteCollectionDialog({
  collection,
  onClose,
}: DeleteCollectionDialogProps) {
  const router = useRouter();
  const toast = useToast();

  const [deleteCollection, { loading }] = useMutation(DELETE_COLLECTION, {
    update(cache, { data }) {
      if (!data) return;
      cache.evict({
        id: cache.identify({
          __typename: "Collection",
          id: data.deleteCollection,
        }),
      });
      evictCollectionLists(cache);
    },
  });

  const handleDelete = async () => {
    try {
      await deleteCollection({ variables: { id: collection.id } });
      toast.success(`「${collection.title}」を削除しました`);
      router.replace("/collections");
    } catch (err) {
      toast.error(getUserFacingErrorMessage(err, "特集を削除できませんでした"));
      onClose();
    }
  };

  return (
    <BottomSheet
      open
      onClose={onClose}
      label="特集を削除"
      title="特集を削除しますか？"
      desktop="dialog"
    >
      <p className="text-sm leading-relaxed text-gray-600">
        「<span className="font-bold text-gray-900">{collection.title}</span>
        」を削除します。特集に入れていたスポット自体は削除されません。
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
