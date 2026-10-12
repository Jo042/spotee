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
      <div className="min-h-screen flex items-center justify-center">
        <p>読み込み中...</p>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-8">
      <div className="mx-auto max-w-2xl">
        <BackLink fallbackHref="/collections" fallbackLabel="特集一覧" />
        <h1 className="mb-8 mt-2 text-2xl font-bold text-gray-900">
          特集を作る
        </h1>
        <CollectionForm />
      </div>
    </main>
  );
}
