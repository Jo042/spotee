"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Search } from "lucide-react";
import { useQuery } from "@apollo/client/react";
import { SpotCard } from "@/components/spot/SpotCard";
import { GET_SPOTS } from "@/graphql/queries/spot";
import { SpotSortBy, SortOrder } from "@/graphql/generated/graphql";

export function HomeContent() {
  const router = useRouter();
  const [keyword, setKeyword] = useState("");

  const { data, loading } = useQuery(GET_SPOTS, {
    variables: {
      first: 8,
      sort: { sortBy: SpotSortBy.LikeCount, order: SortOrder.Desc },
    },
  });

  const spots = (data?.spots?.edges ?? [])
    .map((e) => e.node)
    .filter((n): n is NonNullable<typeof n> => n != null);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (keyword.trim()) {
      router.push(`/spots?keyword=${encodeURIComponent(keyword.trim())}`);
    } else {
      router.push("/spots");
    }
  };

  return (
    <main>
      <section className="bg-gradient-to-br from-primary-600 to-primary-500 py-20 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
            次の「行きたい場所」に出会おう
          </h1>
          <p className="text-primary-100 mb-8 text-sm md:text-base">
            みんなのお気に入りスポットを探して、シェアしよう
          </p>
          <form onSubmit={handleSearch} className="relative max-w-lg mx-auto">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
              <Search size={18} className="text-gray-400" />
            </div>
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="スポット名・キーワードで検索"
              className="w-full pl-12 pr-4 py-3 rounded-xl text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-white shadow-lg"
            />
            <button
              type="submit"
              className="absolute inset-y-0 right-3 flex items-center px-3 text-primary-700 font-medium text-sm"
            >
              検索
            </button>
          </form>
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-4 py-10">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-gray-900">人気のスポット</h2>
          <Link
            href="/spots"
            className="text-sm text-primary-700 hover:text-primary-800 font-medium"
          >
            もっと見る →
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="aspect-video bg-gray-200 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {spots.map((spot) => (
              <SpotCard key={spot.id} spot={spot} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
