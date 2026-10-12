"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { useMutation } from "@apollo/client/react";
import {
  CREATE_COLLECTION,
  UPDATE_COLLECTION,
} from "@/graphql/mutations/collection";
import { ImageUploader } from "@/components/common/ImageUploader";
import { useToast } from "@/components/common/toast/ToastProvider";
import { getUserFacingErrorMessage } from "@/lib/graphql-error";
import { evictCollectionLists } from "@/lib/collection-cache";
import {
  COLLECTION_DESCRIPTION_MAX_LENGTH,
  COLLECTION_SPOTS_MAX,
  COLLECTION_TITLE_MAX_LENGTH,
  moveSpot,
  toCollectionInput,
  toggleSpot,
  updateComment,
  type SelectedSpot,
} from "@/lib/collection-form";
import { SpotPicker } from "./SpotPicker";
import { SelectedSpotList } from "./SelectedSpotList";

interface CollectionFormValues {
  title: string;
  description: string;
}

interface CollectionFormProps {
  /** 指定すると編集。無ければ作成 */
  collectionId?: string;
  initialValues?: {
    title: string;
    description: string | null;
    coverImageUrl: string | null;
    spots: SelectedSpot[];
  };
}

const inputClass =
  "w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-[15px] text-gray-900 placeholder:text-gray-400 transition focus:border-primary-700 focus:outline-none focus:ring-1 focus:ring-primary-700";

export function CollectionForm({
  collectionId,
  initialValues,
}: CollectionFormProps) {
  const router = useRouter();
  const toast = useToast();
  const isEditMode = !!collectionId;

  const [coverImages, setCoverImages] = useState<string[]>(
    initialValues?.coverImageUrl ? [initialValues.coverImageUrl] : [],
  );
  const [spots, setSpots] = useState<SelectedSpot[]>(
    initialValues?.spots ?? [],
  );

  const [createCollection, { loading: creating }] = useMutation(
    CREATE_COLLECTION,
    { update: (cache) => evictCollectionLists(cache) },
  );
  const [updateCollection, { loading: updating }] = useMutation(
    UPDATE_COLLECTION,
    { update: (cache) => evictCollectionLists(cache) },
  );
  const loading = creating || updating;

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<CollectionFormValues>({
    defaultValues: {
      title: initialValues?.title ?? "",
      description: initialValues?.description ?? "",
    },
  });

  const onSubmit = async (values: CollectionFormValues) => {
    if (spots.length === 0) {
      toast.error("スポットを1件以上選んでください");
      return;
    }

    const input = toCollectionInput(
      { ...values, coverImageUrl: coverImages[0] ?? null },
      spots,
    );

    try {
      if (collectionId) {
        await updateCollection({ variables: { id: collectionId, input } });
        toast.success("特集を更新しました");
        router.push(`/collections/${collectionId}`);
      } else {
        const result = await createCollection({ variables: { input } });
        toast.success("特集を作成しました");
        router.push(`/collections/${result.data?.createCollection.id}`);
      }
    } catch (err) {
      toast.error(
        getUserFacingErrorMessage(
          err,
          isEditMode ? "特集の更新に失敗しました" : "特集の作成に失敗しました",
        ),
      );
    }
  };

  const titleLength = useWatch({ control, name: "title" }).length;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      <div>
        <div className="mb-1 flex items-baseline justify-between">
          <label htmlFor="title" className="text-sm font-medium text-gray-700">
            タイトル <span className="text-red-500">*</span>
          </label>
          <span className="text-xs text-gray-400">
            {titleLength}/{COLLECTION_TITLE_MAX_LENGTH}
          </span>
        </div>
        <input
          id="title"
          type="text"
          maxLength={COLLECTION_TITLE_MAX_LENGTH}
          {...register("title", {
            validate: (value) =>
              value.trim() !== "" || "タイトルを入力してください",
          })}
          className={inputClass}
          placeholder="例: 雨の日の横浜デート10選"
        />
        {errors.title && (
          <p className="mt-1 text-sm text-red-500">{errors.title.message}</p>
        )}
      </div>

      <div>
        <label
          htmlFor="description"
          className="mb-1 block text-sm font-medium text-gray-700"
        >
          説明
        </label>
        <textarea
          id="description"
          rows={3}
          maxLength={COLLECTION_DESCRIPTION_MAX_LENGTH}
          {...register("description")}
          className={inputClass}
          placeholder="どんな人に、どんな場面で行ってほしいかを書いてください"
        />
      </div>

      <div>
        <p className="mb-1 text-sm font-medium text-gray-700">カバー画像</p>
        <p className="mb-2 text-xs text-gray-500">
          設定しないときは、一覧のカードに先頭のスポットの写真が使われます
        </p>
        <ImageUploader
          images={coverImages}
          onChange={setCoverImages}
          maxImages={1}
        />
      </div>

      <section aria-labelledby="pick-spots-heading">
        <div className="mb-2 flex items-baseline justify-between">
          <h2
            id="pick-spots-heading"
            className="text-sm font-medium text-gray-700"
          >
            スポットを選ぶ <span className="text-red-500">*</span>
          </h2>
          <span className="text-xs text-gray-500">
            {spots.length}/{COLLECTION_SPOTS_MAX} 件
          </span>
        </div>
        <SpotPicker
          selected={spots}
          onToggle={(spot) => setSpots((prev) => toggleSpot(prev, spot))}
        />
      </section>

      <section aria-labelledby="order-heading">
        <h2
          id="order-heading"
          className="mb-2 text-sm font-medium text-gray-700"
        >
          並び順と添え書き
        </h2>
        <SelectedSpotList
          spots={spots}
          onMove={(index, direction) =>
            setSpots((prev) => moveSpot(prev, index, direction))
          }
          onRemove={(spot) => setSpots((prev) => toggleSpot(prev, spot))}
          onCommentChange={(spotId, comment) =>
            setSpots((prev) => updateComment(prev, spotId, comment))
          }
        />
      </section>

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-lg bg-primary-600 px-4 py-3 font-bold text-white transition hover:bg-primary-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading
          ? "保存中..."
          : isEditMode
            ? "特集を更新する"
            : "特集を作成する"}
      </button>
    </form>
  );
}
