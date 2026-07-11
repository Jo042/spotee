"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";

interface NavLinkProps {
  href: string;
  label: string;
  active: boolean;
}

function NavLink({ href, label, active }: NavLinkProps) {
  return (
    <Link
      href={href}
      className={`group relative py-2 text-sm font-medium transition-colors ${
        active ? "text-gray-900" : "text-gray-600 hover:text-gray-900"
      }`}
    >
      {label}
      <span
        className={`absolute inset-x-0 bottom-0 h-0.5 origin-left bg-primary-600 transition-transform duration-200 ease-out ${
          active ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
        }`}
      />
    </Link>
  );
}

interface MobileNavLinkProps {
  href: string;
  label: string;
  active: boolean;
}

function MobileNavLink({ href, label, active }: MobileNavLinkProps) {
  return (
    <Link
      href={href}
      className={`block rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
        active
          ? "bg-primary-50 text-primary-700"
          : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
      }`}
    >
      {label}
    </Link>
  );
}

export function Header() {
  const { user, loading, signOut } = useAuth();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [prevPathname, setPrevPathname] = useState(pathname);

  if (prevPathname !== pathname) {
    setPrevPathname(pathname);
    setMenuOpen(false);
  }

  const handleSignOut = async () => {
    await signOut();
  };

  const isSpotsActive = pathname.startsWith("/spots");
  const isMypageActive = pathname.startsWith("/mypage");

  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/90 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4">
        <div className="flex h-16 items-center justify-between">
          <Link
            href="/"
            className="text-2xl font-bold tracking-tight text-primary-500"
          >
            Spotee
            <span className="text-primary-600">.</span>
          </Link>

          <nav className="hidden items-center gap-6 md:flex">
            <NavLink href="/spots" label="スポット一覧" active={isSpotsActive} />

            {loading ? (
              <div className="h-8 w-20 animate-pulse rounded bg-gray-100" />
            ) : user ? (
              <>
                <NavLink
                  href="/mypage"
                  label="マイページ"
                  active={isMypageActive}
                />
                <button
                  onClick={handleSignOut}
                  className="text-sm font-medium text-gray-600 transition-colors hover:text-gray-900"
                >
                  ログアウト
                </button>
                <Link
                  href="/spots/new"
                  className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-primary-700 active:scale-95"
                >
                  スポットを投稿
                </Link>
              </>
            ) : (
              <Link
                href="/login"
                className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-primary-700 active:scale-95"
              >
                ログイン
              </Link>
            )}
          </nav>

          <button
            onClick={() => setMenuOpen((prev) => !prev)}
            aria-expanded={menuOpen}
            aria-label={menuOpen ? "メニューを閉じる" : "メニューを開く"}
            className="-mr-2 flex h-11 w-11 items-center justify-center rounded-lg text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-900 md:hidden"
          >
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
            >
              {menuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4 7h16M4 12h16M4 17h16"
                />
              )}
            </svg>
          </button>
        </div>
      </div>

      {menuOpen && (
        <nav className="border-t border-gray-100 bg-white px-4 py-3 md:hidden">
          <div className="space-y-1">
            <MobileNavLink
              href="/spots"
              label="スポット一覧"
              active={isSpotsActive}
            />

            {!loading && user && (
              <MobileNavLink
                href="/mypage"
                label="マイページ"
                active={isMypageActive}
              />
            )}
          </div>

          {!loading && (
            <div className="mt-3 space-y-1 border-t border-gray-100 pt-3">
              {user ? (
                <>
                  <Link
                    href="/spots/new"
                    className="block rounded-lg bg-primary-600 px-4 py-2.5 text-center text-sm font-bold text-white transition hover:bg-primary-700 active:scale-95"
                  >
                    スポットを投稿
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="block w-full rounded-lg px-3 py-2.5 text-left text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-900"
                  >
                    ログアウト
                  </button>
                </>
              ) : (
                <Link
                  href="/login"
                  className="block rounded-lg bg-primary-600 px-4 py-2.5 text-center text-sm font-bold text-white transition hover:bg-primary-700 active:scale-95"
                >
                  ログイン
                </Link>
              )}
            </div>
          )}
        </nav>
      )}
    </header>
  );
}
