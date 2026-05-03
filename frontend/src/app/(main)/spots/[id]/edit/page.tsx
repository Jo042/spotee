"use client";

import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@apollo/client/react";
import { useAuth } from "@/hooks/useAuth";
import { GET_SPOT } from "@/graphql/queries/spot";
import { GET_ME } from "@/graphql/queries/user";
import { SpotForm } from "@/components/spot/SpotForm";
import { PriceRange } from "@/graphql/generated/graphql";

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
  const { data: meData, loading: meLoading } = useQuery(GET_ME, { skip: !user });
  const { data: spotData, loading: spotLoading } = useQuery(GET_SPOT, {
    variables: { id },
  });

  if (authLoading || meLoading || spotLoading) {
    return <div className="min-h-screen flex items-center justify-center">読み込み中...</div>;
  }

  const spot = spotData?.spot;
  const me = meData?.me;

  if (!spot) {
    return <div className="min-h-screen flex items-center justify-center">スポットが見つかりませんでした</div>;
  }

  if (!me || me.id !== spot.user.id) {
    router.push(`/spots/${id}`);
    return null;
  }

  return (
    <main className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto mb-6">
        <h1 className="text-xl font-bold text-gray-900">スポットを編集</h1>
      </div>
      <SpotForm
        spotId={id}
        initialValues={{
          title: spot.title,
          description: spot.description ?? null,
          address: spot.address,
          categoryId: spot.category.id,
          priceRange: spot.priceRange ? (priceRangeNumberMap[spot.priceRange] ?? null) : null,
          businessHours: spot.businessHours ?? null,
          imageUrls: spot.images.map((img) => img.url),
          attributeTagIds: (spot.attributeTags ?? []).map((t) => t.id),
          moodTagIds: (spot.moodTags ?? []).map((t) => t.id),
        }}
      />
    </main>
  );
}
