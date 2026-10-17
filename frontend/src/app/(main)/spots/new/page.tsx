"use client";

import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { SpotForm } from "@/components/spot/SpotForm";

export default function NewSpotPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <p className="py-24 text-center text-sm text-gray-500">読み込み中...</p>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <main className="bg-white px-4 pb-20 pt-8 sm:pt-10">
      <div className="mx-auto max-w-[640px]">
        <h1 className="mb-8 text-2xl font-bold text-gray-900">
          スポットを投稿する
        </h1>
        <SpotForm />
      </div>
    </main>
  );
}
