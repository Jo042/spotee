"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery } from "@apollo/client/react";
import { useAuth } from "@/hooks/useAuth";
import { GET_COLLECTION } from "@/graphql/queries/collection";
import { GET_ME } from "@/graphql/queries/user";
import { BackLink } from "@/components/common/BackLink";
import { isNotFoundError } from "@/lib/graphql-error";
import { CollectionForm } from "./CollectionForm";

export function CollectionEditContent({
  collectionId,
}: {
  collectionId: string;
}) {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { data: meData, loading: meLoading } = useQuery(GET_ME, {
    skip: !user,
  });
  const { data, loading, error, refetch } = useQuery(GET_COLLECTION, {
    variables: { id: collectionId },
  });

  const collection = data?.collection;
  const isReady = !authLoading && !meLoading && !loading;
  const isOwner =
    !!collection && !!meData?.me && meData.me.id === collection.user.id;

  // 編集できるのは作成者だけ。画面で戻すのは見た目のためで、守りはサーバーにある
  useEffect(() => {
    if (!isReady) return;
    if (!user) {
      router.replace("/login");
    } else if (collection && !isOwner) {
      router.replace(`/collections/${collectionId}`);
    }
  }, [isReady, user, collection, isOwner, router, collectionId]);

  if (isReady && !collection) {
    const notFound = !error || isNotFoundError(error);
    return (
      <main className="px-4 py-16 text-center">
        <p className="text-sm text-gray-700">
          {notFound
            ? "特集が見つかりません。削除されたか、URL が違う可能性があります。"
            : "特集を読み込めませんでした。時間をおいて、もう一度お試しください。"}
        </p>
        {notFound ? (
          <Link href="/collections" className="btn-secondary mt-4">
            特集一覧へ
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

  if (!collection || !isOwner) {
    return (
      <p className="py-24 text-center text-sm text-gray-500">読み込み中...</p>
    );
  }

  return (
    <main className="bg-white px-4 pb-20 pt-6 sm:pt-8">
      <div className="mx-auto max-w-[640px]">
        <BackLink
          fallbackHref={`/collections/${collectionId}`}
          fallbackLabel="特集に戻る"
        />
        <h1 className="mb-8 mt-2 text-2xl font-bold text-gray-900">
          特集を編集する
        </h1>
        <CollectionForm
          collectionId={collectionId}
          initialValues={{
            title: collection.title,
            description: collection.description ?? null,
            coverImageUrl: collection.coverImageUrl ?? null,
            spots: collection.spots.map((item) => ({
              spotId: item.spot.id,
              title: item.spot.title,
              imageUrl: item.spot.images[0]?.url ?? null,
              comment: item.comment ?? "",
            })),
          }}
        />
      </div>
    </main>
  );
}
