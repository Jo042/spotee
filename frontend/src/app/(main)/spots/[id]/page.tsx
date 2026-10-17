"use client";

import Link from "next/link";
import { useQuery } from "@apollo/client/react";
import { useParams } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { GET_SPOT } from "@/graphql/queries/spot";
import { GET_ME } from "@/graphql/queries/user";
import { SpotDetail } from "@/components/spot/SpotDetail";
import { isNotFoundError } from "@/lib/graphql-error";

function SpotDetailSkeleton() {
  return (
    <div className="mx-auto max-w-[720px] animate-pulse" aria-hidden="true">
      <div className="mb-4 h-9 w-28 rounded bg-gray-100" />
      <div className="aspect-video rounded-xl bg-gray-100" />
      <div className="mt-6 h-8 w-3/4 rounded bg-gray-100" />
      <div className="mt-3 h-4 w-1/2 rounded bg-gray-100" />
      <div className="mt-5 h-5 w-40 rounded bg-gray-100" />
      <div className="mt-6 space-y-2">
        <div className="h-4 w-full rounded bg-gray-100" />
        <div className="h-4 w-5/6 rounded bg-gray-100" />
      </div>
    </div>
  );
}

export default function SpotDetailPage() {
  const params = useParams();
  const id = params.id as string;

  const { user } = useAuth();
  const { data: meData } = useQuery(GET_ME, { skip: !user });
  const { data, loading, error, refetch } = useQuery(GET_SPOT, {
    variables: { id },
  });

  let content: React.ReactNode;
  if (loading && !data) {
    content = <SpotDetailSkeleton />;
  } else if (data?.spot) {
    const isOwner = !!meData?.me && meData.me.id === data.spot.user.id;
    content = <SpotDetail spot={data.spot} isOwner={isOwner} />;
  } else if (error && !isNotFoundError(error)) {
    content = (
      <div className="py-16 text-center">
        <p className="text-sm text-gray-700">
          スポットを読み込めませんでした。時間をおいて、もう一度お試しください。
        </p>
        <button
          type="button"
          onClick={() => refetch()}
          className="btn-secondary mt-4"
        >
          もう一度読み込む
        </button>
      </div>
    );
  } else {
    content = (
      <div className="py-16 text-center">
        <p className="text-sm text-gray-700">
          スポットが見つかりません。削除されたか、URL が違う可能性があります。
        </p>
        <Link href="/spots" className="btn-secondary mt-4">
          スポット一覧へ
        </Link>
      </div>
    );
  }

  return <main className="bg-white px-4 pb-16 pt-6 sm:pt-8">{content}</main>;
}
