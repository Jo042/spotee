"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@apollo/client/react";
import { useAuth } from "@/hooks/useAuth";
import { ProfileEditForm } from "@/components/mypage/ProfileEditForm";
import { BackLink } from "@/components/common/BackLink";
import { GET_ME } from "@/graphql/queries/user";

export function ProfileEditContent() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const { data, loading } = useQuery(GET_ME, { skip: !user });

  // ログインしていなければログインの画面へ（描画の途中では移動しない）
  useEffect(() => {
    if (!authLoading && !user) router.replace("/login");
  }, [authLoading, user, router]);

  const me = data?.me;

  if (authLoading || !user || (loading && !me)) {
    return (
      <p className="py-24 text-center text-sm text-gray-500">読み込み中...</p>
    );
  }

  return (
    <main className="mx-auto w-full max-w-[480px] px-4 pb-20 pt-6 sm:pt-8">
      <BackLink fallbackHref="/mypage" fallbackLabel="マイページ" />
      <h1 className="mb-8 mt-3 text-2xl font-bold text-gray-900">
        プロフィールを編集する
      </h1>
      {me && (
        <ProfileEditForm
          initialName={me.name}
          initialBio={me.bio}
          initialAvatarUrl={me.avatarUrl}
        />
      )}
    </main>
  );
}
