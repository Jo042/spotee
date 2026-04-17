"use client";

import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";

export function Header() {
  const { user, loading, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="text-xl font-bold text-primary-500">
            Spotee
          </Link>

          <nav className="flex items-center gap-6">
            <Link
              href="/spots"
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              スポット一覧
            </Link>

            {loading ? (
              <div className="w-20 h-8 bg-gray-100 rounded animate-pulse" />
            ) : user ? (
              <div className="flex items-center gap-4">
                <Link
                  href="/mypage"
                  className="text-gray-600 hover:text-gray-900 transition-colors"
                >
                  マイページ
                </Link>
                <button
                  onClick={handleSignOut}
                  className="text-gray-600 hover:text-gray-900 transition-colors"
                >
                  ログアウト
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="bg-primary-700 text-white px-4 py-2 rounded-lg hover:bg-primary-800 transition-colors"
              >
                ログイン
              </Link>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}
