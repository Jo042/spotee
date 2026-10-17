"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { useMutation, useQuery } from "@apollo/client/react";
import { CREATE_SPOT, UPDATE_SPOT } from "@/graphql/mutations/spot";
import { GET_ALL_TAGS } from "@/graphql/queries/tag";
import { ImageUploader } from "@/components/common/ImageUploader";
import { useToast } from "@/components/common/toast/ToastProvider";
import { getUserFacingErrorMessage } from "@/lib/graphql-error";
import { PriceRange } from "@/graphql/generated/graphql";
import { FieldError, FieldLabel } from "@/components/common/FieldLabel";
import { charCountLabel, SPOT_INPUT_LIMITS } from "@/lib/spot-form";

interface SpotFormData {
  title: string;
  description: string;
  address: string;
  categoryId: string;
  priceRange: number | null;
  businessHours: string;
  attributeTagIds: string[];
  moodTagIds: string[];
}

interface SpotFormProps {
  spotId?: string;
  initialValues?: {
    title: string;
    description: string | null;
    address: string;
    categoryId: string;
    priceRange: number | null;
    businessHours: string | null;
    imageUrls: string[];
    attributeTagIds: string[];
    moodTagIds: string[];
  };
}

interface GetAllTagsResult {
  categories: { id: string; name: string; slug: string }[];
  attributeTags: { id: string; name: string; slug: string }[];
  moodTags: { id: string; name: string; slug: string }[];
}

const priceRangeEnumMap: Record<number, PriceRange> = {
  1: PriceRange.Under_1000,
  2: PriceRange.Range_1000_3000,
  3: PriceRange.Range_3000_5000,
  4: PriceRange.Over_5000,
};

export function SpotForm({ spotId, initialValues }: SpotFormProps) {
  const router = useRouter();
  const toast = useToast();
  const isEditMode = !!spotId;

  const [imageUrls, setImageUrls] = useState<string[]>(
    initialValues?.imageUrls ?? [],
  );

  const { data: tagData, loading: tagLoading } =
    useQuery<GetAllTagsResult>(GET_ALL_TAGS);

  const [createSpot, { loading: creating }] = useMutation(CREATE_SPOT);
  const [updateSpot, { loading: updating }] = useMutation(UPDATE_SPOT);
  const loading = isEditMode ? updating : creating;

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    control,
  } = useForm<SpotFormData>({
    defaultValues: {
      title: initialValues?.title ?? "",
      description: initialValues?.description ?? "",
      address: initialValues?.address ?? "",
      categoryId: initialValues?.categoryId ?? "",
      priceRange: initialValues?.priceRange ?? null,
      businessHours: initialValues?.businessHours ?? "",
      attributeTagIds: initialValues?.attributeTagIds ?? [],
      moodTagIds: initialValues?.moodTagIds ?? [],
    },
  });

  const [
    selectedAttributeTags,
    selectedMoodTags,
    title,
    description,
    address,
    businessHours,
  ] = useWatch({
    control,
    name: [
      "attributeTagIds",
      "moodTagIds",
      "title",
      "description",
      "address",
      "businessHours",
    ],
  });

  const toggleTag = (
    field: "attributeTagIds" | "moodTagIds",
    tagId: string,
    currentValue: string[],
  ) => {
    if (currentValue.includes(tagId)) {
      setValue(
        field,
        currentValue.filter((id) => id !== tagId),
      );
    } else {
      setValue(field, [...currentValue, tagId]);
    }
  };

  const onSubmit = async (data: SpotFormData) => {
    if (imageUrls.length === 0) {
      toast.error("画像を1枚以上選択してください");
      return;
    }

    const input = {
      title: data.title,
      description: data.description || null,
      address: data.address,
      categoryId: data.categoryId,
      priceRange: data.priceRange ? priceRangeEnumMap[data.priceRange] : null,
      businessHours: data.businessHours || null,
      imageUrls,
      attributeTagIds: data.attributeTagIds,
      moodTagIds: data.moodTagIds,
    };

    try {
      if (isEditMode) {
        await updateSpot({ variables: { id: spotId, input } });
        toast.success("スポットを更新しました");
        router.push(`/spots/${spotId}`);
      } else {
        const result = await createSpot({ variables: { input } });
        toast.success("スポットを投稿しました");
        router.push(`/spots/${result.data?.createSpot.id}`);
      }
    } catch (err) {
      toast.error(
        getUserFacingErrorMessage(
          err,
          isEditMode
            ? "スポットの更新に失敗しました"
            : "スポットの投稿に失敗しました",
        ),
      );
    }
  };

  if (tagLoading) {
    return (
      <p className="py-8 text-center text-sm text-gray-500">読み込み中...</p>
    );
  }

  const tagGroups: {
    field: "moodTagIds" | "attributeTagIds";
    label: string;
    tags: { id: string; name: string }[];
    selected: string[];
  }[] = [
    {
      field: "moodTagIds",
      label: "雰囲気",
      tags: tagData?.moodTags ?? [],
      selected: selectedMoodTags,
    },
    {
      field: "attributeTagIds",
      label: "特徴",
      tags: tagData?.attributeTags ?? [],
      selected: selectedAttributeTags,
    },
  ];

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-7">
      <div>
        <FieldLabel id="images-label" count={`${imageUrls.length}/5枚`}>
          写真
        </FieldLabel>
        <ImageUploader
          images={imageUrls}
          onChange={setImageUrls}
          maxImages={5}
        />
      </div>

      <div>
        <FieldLabel
          htmlFor="title"
          count={charCountLabel(title, SPOT_INPUT_LIMITS.title)}
        >
          スポット名
        </FieldLabel>
        <input
          id="title"
          type="text"
          maxLength={SPOT_INPUT_LIMITS.title}
          aria-invalid={!!errors.title}
          aria-describedby={errors.title ? "title-error" : undefined}
          {...register("title", {
            required: "スポット名を入力してください",
            validate: (v) => v.trim() !== "" || "スポット名を入力してください",
          })}
          className="text-input"
          placeholder="例: 窓辺の席が気持ちいい喫茶店"
        />
        <FieldError id="title-error" message={errors.title?.message} />
      </div>

      <div>
        <FieldLabel
          htmlFor="description"
          optional
          count={charCountLabel(description, SPOT_INPUT_LIMITS.description)}
        >
          説明
        </FieldLabel>
        <textarea
          id="description"
          maxLength={SPOT_INPUT_LIMITS.description}
          {...register("description")}
          rows={5}
          className="text-input leading-relaxed"
          placeholder="どんなところが好きか、行くときのコツなど"
        />
      </div>

      <div>
        <FieldLabel htmlFor="categoryId">カテゴリ</FieldLabel>
        <select
          id="categoryId"
          aria-invalid={!!errors.categoryId}
          aria-describedby={errors.categoryId ? "categoryId-error" : undefined}
          {...register("categoryId", {
            required: "カテゴリを選んでください",
          })}
          className="text-input"
        >
          <option value="">選んでください</option>
          {tagData?.categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
        <FieldError
          id="categoryId-error"
          message={errors.categoryId?.message}
        />
      </div>

      {tagGroups.map(({ field, label, tags, selected }) => (
        <div key={field}>
          <FieldLabel id={`${field}-label`} optional>
            {label}
          </FieldLabel>
          <div
            role="group"
            aria-labelledby={`${field}-label`}
            className="flex flex-wrap gap-2"
          >
            {tags.map((tag) => {
              const active = selected.includes(tag.id);
              return (
                <button
                  key={tag.id}
                  type="button"
                  aria-pressed={active}
                  onClick={() => toggleTag(field, tag.id, selected)}
                  className={`rounded-full border px-3 py-1.5 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-300 ${
                    active
                      ? "border-primary-700 bg-primary-50 font-bold text-primary-700"
                      : "border-gray-300 bg-white text-gray-700 hover:border-gray-400"
                  }`}
                >
                  {tag.name}
                </button>
              );
            })}
          </div>
        </div>
      ))}

      <section
        aria-labelledby="basic-info"
        className="space-y-7 border-t border-gray-200 pt-7"
      >
        <h2 id="basic-info" className="text-base font-bold text-gray-900">
          基本情報
        </h2>

        <div>
          <FieldLabel
            htmlFor="address"
            count={charCountLabel(address, SPOT_INPUT_LIMITS.address)}
          >
            住所
          </FieldLabel>
          <input
            id="address"
            type="text"
            maxLength={SPOT_INPUT_LIMITS.address}
            aria-invalid={!!errors.address}
            aria-describedby={errors.address ? "address-error" : undefined}
            {...register("address", {
              required: "住所を入力してください",
              validate: (v) => v.trim() !== "" || "住所を入力してください",
            })}
            className="text-input"
            placeholder="例: 東京都渋谷区〇〇1-2-3"
          />
          <FieldError id="address-error" message={errors.address?.message} />
        </div>

        <div>
          <FieldLabel htmlFor="priceRange" optional>
            価格帯
          </FieldLabel>
          <select
            id="priceRange"
            {...register("priceRange", { valueAsNumber: true })}
            className="text-input"
          >
            <option value="">選んでください</option>
            <option value={1}>~1,000円</option>
            <option value={2}>1,000~3,000円</option>
            <option value={3}>3,000~5,000円</option>
            <option value={4}>5,000円~</option>
          </select>
        </div>

        <div>
          <FieldLabel
            htmlFor="businessHours"
            optional
            count={charCountLabel(
              businessHours,
              SPOT_INPUT_LIMITS.businessHours,
            )}
          >
            営業時間
          </FieldLabel>
          <input
            id="businessHours"
            type="text"
            maxLength={SPOT_INPUT_LIMITS.businessHours}
            {...register("businessHours")}
            className="text-input"
            placeholder="例: 10:00-22:00（定休日: 月曜）"
          />
        </div>
      </section>

      <button
        type="submit"
        disabled={loading}
        className="btn-primary w-full py-3"
      >
        {loading
          ? isEditMode
            ? "更新中..."
            : "投稿中..."
          : isEditMode
            ? "スポットを更新する"
            : "スポットを投稿する"}
      </button>
    </form>
  );
}
