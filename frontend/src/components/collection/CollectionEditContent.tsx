"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@apollo/client/react";
import { useAuth } from "@/hooks/useAuth";
import { GET_COLLECTION } from "@/graphql/queries/collection";
import { GET_ME } from "@/graphql/queries/user";
import { BackLink } from "@/components/common/BackLink";
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
  const { data, loading } = useQuery(GET_COLLECTION, {
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
    return (
      <div className="min-h-screen flex items-center justify-center text-sm text-gray-500">
        特集が見つかりません
      </div>
    );
  }

  if (!collection || !isOwner) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>読み込み中...</p>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-8">
      <div className="mx-auto max-w-2xl">
        <BackLink
          fallbackHref={`/collections/${collectionId}`}
          fallbackLabel="特集に戻る"
        />
        <h1 className="mb-8 mt-2 text-2xl font-bold text-gray-900">
          特集を編集
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
