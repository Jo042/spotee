"use client";

import { useQuery } from "@apollo/client/react";
import { GET_SPOTS } from "@/graphql/queries/spot";
import { SpotList } from "@/components/spot/SpotList";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import type { GetSpotsResponse, GetSpotsVariables } from "@/graphql/types/spot";

export default function SpotsPage() {
  const { user } = useAuth();

  const { data, loading, error } = useQuery<
    GetSpotsResponse,
    GetSpotsVariables
  >(GET_SPOTS, { variables: { first: 20 } });

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-500">エラーが発生しました: {error.message}</p>
      </div>
    );
  }

  const spots = data?.spots?.edges?.map((edge) => edge.node) ?? [];

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">スポット一覧</h1>
              {data?.spots?.totalCount !== undefined && (
                <p className="text-sm text-gray-500 mt-1">
                  全 {data.spots.totalCount} 件
                </p>
              )}
            </div>

            {user && (
              <Link
                href="/spots/new"
                className="bg-primary-500 text-white px-4 py-2 rounded-lg hover:bg-primary-600 transition-colors"
              >
                スポットを投稿
              </Link>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <SpotList spots={spots} loading={loading} />
      </div>
    </main>
  );
}
