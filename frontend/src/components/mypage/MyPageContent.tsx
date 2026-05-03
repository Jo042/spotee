"use client";

import { useState } from "react";
import { useQuery } from "@apollo/client/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { UserCircle, Pencil } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { SpotCard } from "@/components/spot/SpotCard";
import { GET_ME, GET_MY_SPOTS, GET_MY_LIKED_SPOTS } from "@/graphql/queries/user";

type Tab = "spots" | "liked";

export function MyPageContent() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>("spots");

  const { data: meData, loading: meLoading } = useQuery(GET_ME, { skip: !user });
  const { data: spotsData, loading: spotsLoading } = useQuery(GET_MY_SPOTS, {
    variables: { first: 20 },
    skip: !user || activeTab !== "spots",
  });
  const { data: likedData, loading: likedLoading } = useQuery(GET_MY_LIKED_SPOTS, {
    variables: { first: 20 },
    skip: !user || activeTab !== "liked",
  });

  if (authLoading) {
    return <div className="min-h-screen flex items-center justify-center">読み込み中...</div>;
  }

  if (!user) {
    router.push("/login");
    return null;
  }

  const me = meData?.me;
  const mySpots = (spotsData?.mySpots?.edges ?? [])
    .map((e) => e.node)
    .filter((n): n is NonNullable<typeof n> => n != null);
  const myLikedSpots = (likedData?.myLikedSpots?.edges ?? [])
    .map((e) => e.node)
    .filter((n): n is NonNullable<typeof n> => n != null);

  const activeSpots = activeTab === "spots" ? mySpots : myLikedSpots;
  const activeLoading = activeTab === "spots" ? spotsLoading : likedLoading;
  const totalCount =
    activeTab === "spots"
      ? spotsData?.mySpots?.totalCount
      : likedData?.myLikedSpots?.totalCount;

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="flex items-center gap-4 flex-1">
            <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
              {me?.avatarUrl ? (
                <img src={me.avatarUrl} alt={me.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  <UserCircle size={48} />
                </div>
              )}
            </div>
            <div className="flex-1">
              {meLoading ? (
                <div className="h-6 w-32 bg-gray-200 rounded animate-pulse" />
              ) : (
                <h1 className="text-xl font-bold text-gray-900">{me?.name ?? user.email}</h1>
              )}
              {me?.bio && <p className="text-sm text-gray-500 mt-1">{me.bio}</p>}
            </div>
            <Link
              href="/mypage/edit"
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <Pencil size={20} />
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4">
        <div className="flex border-b border-gray-200 bg-white">
          {(["spots", "liked"] as Tab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-3 text-sm font-medium transition-colors ${
                activeTab === tab
                  ? "text-primary-700 border-b-2 border-primary-700"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab === "spots" ? "投稿" : "いいね"}
            </button>
          ))}
        </div>

        <div className="py-6">
          {totalCount !== undefined && (
            <p className="text-sm text-gray-500 mb-4">全 {totalCount} 件</p>
          )}
          {activeLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="aspect-video bg-gray-200 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : activeSpots.length === 0 ? (
            <p className="text-center text-gray-400 py-16">
              {activeTab === "spots" ? "まだ投稿がありません" : "まだいいねしたスポットがありません"}
            </p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {activeSpots.map((spot) => (
                <SpotCard key={spot.id} spot={spot} />
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
