"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { useMutation, useQuery } from "@apollo/client/react";
import { CREATE_SPOT } from "@/graphql/mutations/spot";
import { GET_ALL_TAGS } from "@/graphql/queries/tag";
import { ImageUploader } from "@/components/common/ImageUploader";

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

interface CreateSpotResult {
  createSpot: {
    id: string;
    title: string;
  };
}

interface GetAllTagsResult {
  categories: { id: string; name: string; slug: string }[];
  attributeTags: { id: string; name: string; slug: string }[];
  moodTags: { id: string; name: string; slug: string }[];
}

export function SpotForm() {
  const router = useRouter();

  const [imageUrls, setImageUrls] = useState<string[]>([]);

  const { data: tagData, loading: tagLoading } =
    useQuery<GetAllTagsResult>(GET_ALL_TAGS);

  const [createSpot, { loading: creating }] =
    useMutation<CreateSpotResult>(CREATE_SPOT);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<SpotFormData>({
    defaultValues: {
      title: "",
      description: "",
      address: "",
      categoryId: "",
      priceRange: null,
      businessHours: "",
      attributeTagIds: [],
      moodTagIds: [],
    },
  });

  const selectedAttributeTags = watch("attributeTagIds");
  const selectedMoodTags = watch("moodTagIds");

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

  const priceRangeEnumMap: Record<number, string> = {
    1: "UNDER_1000",
    2: "RANGE_1000_3000",
    3: "RANGE_3000_5000",
    4: "OVER_5000",
  };

  const onSubmit = async (data: SpotFormData) => {
    if (imageUrls.length === 0) {
      alert("画像を最低1枚アップロードしてください");
      return;
    }

    try {
      const result = await createSpot({
        variables: {
          input: {
            title: data.title,
            description: data.description || null,
            address: data.address,
            categoryId: data.categoryId,
            priceRange: data.priceRange
              ? priceRangeEnumMap[data.priceRange]
              : null,
            businessHours: data.businessHours || null,
            imageUrls,
            attributeTagIds: data.attributeTagIds,
            moodTagIds: data.moodTagIds,
          },
        },
      });

      router.push(`/spots/${result.data?.createSpot.id}`);
    } catch (error) {
      console.error("Failed to create spot:", error);
      alert("スポットの投稿に失敗しました");
    }
  };

  if (tagLoading) {
    return <div className="text-center py-8">読み込み中...</div>;
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-6 max-w-2xl mx-auto"
    >
      <div>
        <label
          htmlFor="title"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          スポット名 <span className="text-red-500">*</span>
        </label>
        <input
          id="title"
          type="text"
          {...register("title", { required: "スポット名は必須です" })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
          placeholder="例: 渋谷のおしゃれカフェ"
        />
        {errors.title && (
          <p className="mt-1 text-sm text-red-500">{errors.title.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          写真 <span className="text-red-500">*</span>（1〜5枚）
        </label>
        <ImageUploader
          images={imageUrls}
          onChange={setImageUrls}
          maxImages={5}
        />
      </div>

      <div>
        <label
          htmlFor="address"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          住所 <span className="text-red-500">*</span>
        </label>
        <input
          id="address"
          type="text"
          {...register("address", { required: "住所は必須です" })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
          placeholder="例: 東京都渋谷区〇〇1-2-3"
        />
        {errors.address && (
          <p className="mt-1 text-sm text-red-500">{errors.address.message}</p>
        )}
      </div>

      <div>
        <label
          htmlFor="categoryId"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          カテゴリ <span className="text-red-500">*</span>
        </label>
        <select
          id="categoryId"
          {...register("categoryId", {
            required: "カテゴリを選択してください",
          })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          <option value="">選択してください</option>
          {tagData?.categories.map((category: { id: string; name: string }) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
        {errors.categoryId && (
          <p className="mt-1 text-sm text-red-500">
            {errors.categoryId.message}
          </p>
        )}
      </div>

      <div>
        <label
          htmlFor="description"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          説明
        </label>
        <textarea
          id="description"
          {...register("description")}
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
          placeholder="このスポットの魅力を教えてください"
        />
      </div>

      <div>
        <label
          htmlFor="priceRange"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          価格帯
        </label>
        <select
          id="priceRange"
          {...register("priceRange", { valueAsNumber: true })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          <option value="">選択してください</option>
          <option value={1}>~1,000円</option>
          <option value={2}>1,000~3,000円</option>
          <option value={3}>3,000~5,000円</option>
          <option value={4}>5,000円~</option>
        </select>
      </div>

      <div>
        <label
          htmlFor="businessHours"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          営業時間
        </label>
        <input
          id="businessHours"
          type="text"
          {...register("businessHours")}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
          placeholder="例: 10:00-22:00（定休日: 月曜）"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          属性タグ（複数選択可）
        </label>
        <div className="flex flex-wrap gap-2">
          {tagData?.attributeTags.map((tag: { id: string; name: string }) => (
            <button
              key={tag.id}
              type="button"
              onClick={() =>
                toggleTag("attributeTagIds", tag.id, selectedAttributeTags)
              }
              className={`px-3 py-1 rounded-full text-sm transition-colors ${
                selectedAttributeTags.includes(tag.id)
                  ? "bg-primary-700 text-white"
                  : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
              }`}
            >
              {tag.name}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          ムードタグ（複数選択可）
        </label>
        <div className="flex flex-wrap gap-2">
          {tagData?.moodTags.map((tag: { id: string; name: string }) => (
            <button
              key={tag.id}
              type="button"
              onClick={() => toggleTag("moodTagIds", tag.id, selectedMoodTags)}
              className={`px-3 py-1 rounded-full text-sm transition-colors ${
                selectedMoodTags.includes(tag.id)
                  ? "bg-primary-700 text-white"
                  : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
              }`}
            >
              {tag.name}
            </button>
          ))}
        </div>
      </div>

      <div className="pt-4">
        <button
          type="submit"
          disabled={creating}
          className="w-full py-3 px-4 bg-primary-700 text-white font-medium rounded-lg hover:bg-primary-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {creating ? "投稿中..." : "スポットを投稿する"}
        </button>
      </div>
    </form>
  );
}
