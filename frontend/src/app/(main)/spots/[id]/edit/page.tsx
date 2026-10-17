"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@apollo/client/react";
import { useAuth } from "@/hooks/useAuth";
import { GET_SPOT } from "@/graphql/queries/spot";
import { GET_ME } from "@/graphql/queries/user";
import { SpotForm } from "@/components/spot/SpotForm";
import { PriceRange } from "@/graphql/generated/graphql";
import { isNotFoundError } from "@/lib/graphql-error";

const priceRangeNumberMap: Partial<Record<PriceRange, number>> = {
  [PriceRange.Under_1000]: 1,
  [PriceRange.Range_1000_3000]: 2,
  [PriceRange.Range_3000_5000]: 3,
  [PriceRange.Over_5000]: 4,
};

export default function SpotEditPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const { user, loading: authLoading } = useAuth();
  const { data: meData, loading: meLoading } = useQuery(GET_ME, {
    skip: !user,
  });
  const {
    data: spotData,
    loading: spotLoading,
    error,
    refetch,
  } = useQuery(GET_SPOT, { variables: { id } });

  const loading = authLoading || meLoading || (spotLoading && !spotData);
  const spot = spotData?.spot;
  const me = meData?.me;
  // 持ち主以外は詳細へ戻す（描画の途中で移動しない）
  const isNotOwner = !loading && !!spot && (!me || me.id !== spot.user.id);

  useEffect(() => {
    if (isNotOwner) router.replace(`/spots/${id}`);
  }, [isNotOwner, router, id]);

  if (loading || isNotOwner) {
    return (
      <p className="py-24 text-center text-sm text-gray-500">読み込み中...</p>
    );
  }

  if (!spot) {
    const notFound = !error || isNotFoundError(error);
    return (
      <main className="px-4 py-16 text-center">
        <p className="text-sm text-gray-700">
          {notFound
            ? "スポットが見つかりません。削除されたか、URL が違う可能性があります。"
            : "スポットを読み込めませんでした。時間をおいて、もう一度お試しください。"}
        </p>
        {notFound ? (
          <Link href="/spots" className="btn-secondary mt-4">
            スポット一覧へ
          </Link>
        ) : (
          <button
            type="button"
            onClick={() => refetch()}
            className="btn-secondary mt-4"
          >
            もう一度読み込む
          </button>
        )}
      </main>
    );
  }

  return (
    <main className="bg-white px-4 pb-20 pt-8 sm:pt-10">
      <div className="mx-auto max-w-[640px]">
        <h1 className="mb-8 text-2xl font-bold text-gray-900">
          スポットを編集する
        </h1>
        <SpotForm
          spotId={id}
          initialValues={{
            title: spot.title,
            description: spot.description ?? null,
            address: spot.address,
            categoryId: spot.category.id,
            priceRange: spot.priceRange
              ? (priceRangeNumberMap[spot.priceRange] ?? null)
              : null,
            businessHours: spot.businessHours ?? null,
            imageUrls: spot.images.map((img) => img.url),
            attributeTagIds: (spot.attributeTags ?? []).map((t) => t.id),
            moodTagIds: (spot.moodTags ?? []).map((t) => t.id),
          }}
        />
      </div>
    </main>
  );
}
