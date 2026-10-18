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
import { FieldError, FieldLabel } from "@/components/common/FieldLabel";
import { charCountLabel } from "@/lib/format";
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

  const [title, description] = useWatch({
    control,
    name: ["title", "description"],
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      <div>
        <FieldLabel id="cover-label" optional>
          カバー画像
        </FieldLabel>
        <p className="mb-2 text-xs text-gray-500">
          選ばないときは、一覧のカードに1か所目のスポットの写真を使います
        </p>
        <ImageUploader
          images={coverImages}
          onChange={setCoverImages}
          maxImages={1}
        />
      </div>

      <div>
        <FieldLabel
          htmlFor="title"
          count={charCountLabel(title, COLLECTION_TITLE_MAX_LENGTH)}
        >
          タイトル
        </FieldLabel>
        <input
          id="title"
          type="text"
          maxLength={COLLECTION_TITLE_MAX_LENGTH}
          aria-invalid={!!errors.title}
          aria-describedby={errors.title ? "title-error" : undefined}
          {...register("title", {
            validate: (value) =>
              value.trim() !== "" || "タイトルを入力してください",
          })}
          className="text-input"
          placeholder="例: 雨の日に行きたい、屋内で過ごせる場所"
        />
        <FieldError id="title-error" message={errors.title?.message} />
      </div>

      <div>
        <FieldLabel
          htmlFor="description"
          optional
          count={charCountLabel(description, COLLECTION_DESCRIPTION_MAX_LENGTH)}
        >
          説明
        </FieldLabel>
        <textarea
          id="description"
          rows={4}
          maxLength={COLLECTION_DESCRIPTION_MAX_LENGTH}
          {...register("description")}
          className="text-input leading-relaxed"
          placeholder="どんな人に、どんな場面で行ってほしいかを書いてください"
        />
      </div>

      <section aria-labelledby="pick-spots-heading">
        <FieldLabel
          id="pick-spots-heading"
          count={`${spots.length}/${COLLECTION_SPOTS_MAX}か所`}
        >
          スポットを選ぶ
        </FieldLabel>
        <p className="mb-3 text-xs text-gray-500">
          自分が投稿したスポットから選びます。押した順に並び、もう一度押すと外れます
        </p>
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
          並び順とひとこと
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
        className="btn-primary w-full py-3"
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
