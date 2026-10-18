"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { BackLink } from "@/components/common/BackLink";
import { CollectionForm } from "@/components/collection/CollectionForm";

export default function NewCollectionPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <p className="py-24 text-center text-sm text-gray-500">読み込み中...</p>
    );
  }

  return (
    <main className="bg-white px-4 pb-20 pt-6 sm:pt-8">
      <div className="mx-auto max-w-[640px]">
        <BackLink fallbackHref="/collections" fallbackLabel="特集一覧" />
        <h1 className="mb-8 mt-2 text-2xl font-bold text-gray-900">
          特集を作る
        </h1>
        <CollectionForm />
      </div>
    </main>
  );
}
