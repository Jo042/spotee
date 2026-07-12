"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { useQuery } from "@apollo/client/react";
import { useAuth } from "@/hooks/useAuth";
import { ProfileEditForm } from "@/components/mypage/ProfileEditForm";
import { GET_ME } from "@/graphql/queries/user";

export function ProfileEditContent() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const { data, loading } = useQuery(GET_ME, { skip: !user });

  if (authLoading || loading) {
    return <div className="min-h-screen flex items-center justify-center">読み込み中...</div>;
  }

  if (!user) {
    router.push("/login");
    return null;
  }

  const me = data?.me;

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-lg mx-auto px-4 py-8 sm:py-10">
        <Link
          href="/mypage"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft size={16} />
          マイページ
        </Link>

        <div className="mt-4 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm sm:p-8">
          <h1 className="text-xl font-bold text-gray-900">プロフィール編集</h1>
          {me && (
            <div className="mt-6">
              <ProfileEditForm
                initialName={me.name}
                initialBio={me.bio}
                initialAvatarUrl={me.avatarUrl}
              />
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
