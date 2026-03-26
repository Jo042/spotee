"use client";

import { useQuery } from "@apollo/client/react";
import { useParams } from "next/navigation";
import { GET_SPOT } from "@/graphql/queries/spot";
import { SpotDetail } from "@/components/spot/SpotDetail";

interface GetSpotResult {
  spot: {
    id: string;
    title: string;
    description: string | null;
    address: string;
    priceRange: number | null;
    businessHours: string | null;
    likeCount: number;
    createdAt: string;
    images: { id: string; url: string; order: number }[];
    category: { id: string; name: string };
    user: { id: string; name: string; avatarUrl: string | null };
  } | null;
}

export default function SpotDetailPage() {
  const params = useParams();
  const id = params.id as string;

  const { data, loading, error } = useQuery<GetSpotResult>(GET_SPOT, {
    variables: { id },
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>読み込み中...</p>
      </div>
    );
  }

  if (error || !data?.spot) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-500">スポットが見つかりませんでした</p>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 py-8 px-4">
      <SpotDetail spot={data.spot} />
    </main>
  );
}
