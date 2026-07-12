"use client";

import { useQuery } from "@apollo/client/react";
import { useParams } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { GET_SPOT } from "@/graphql/queries/spot";
import { GET_ME } from "@/graphql/queries/user";
import { SpotDetail } from "@/components/spot/SpotDetail";

export default function SpotDetailPage() {
  const params = useParams();
  const id = params.id as string;

  const { user } = useAuth();
  const { data: meData } = useQuery(GET_ME, { skip: !user });
  const { data, loading, error } = useQuery(GET_SPOT, { variables: { id } });

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

  const isOwner = !!meData?.me && meData.me.id === data.spot.user.id;

  return (
    <main className="min-h-screen bg-white py-8 px-4">
      <SpotDetail spot={data.spot} isOwner={isOwner} />
    </main>
  );
}
