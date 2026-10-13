"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useQuery } from "@apollo/client/react";
import { useAuth } from "@/hooks/useAuth";
import { GET_ME } from "@/graphql/queries/user";
import { AccountMenu } from "./AccountMenu";

interface NavLinkProps {
  href: string;
  label: string;
  active: boolean;
}

function NavLink({ href, label, active }: NavLinkProps) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={`group relative py-2 text-sm transition-colors ${
        active
          ? "font-bold text-gray-900"
          : "font-medium text-gray-600 hover:text-gray-900"
      }`}
    >
      {label}
      <span
        className={`absolute inset-x-0 bottom-0 h-0.5 origin-left bg-primary-700 transition-transform duration-200 ease-out ${
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
  const { data: meData } = useQuery(GET_ME, { skip: !user });
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

  const me = meData?.me;
  const isSpotsActive = pathname.startsWith("/spots");
  const isCollectionsActive = pathname.startsWith("/collections");
  const isMypageActive = pathname.startsWith("/mypage");

  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/90 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4">
        <div className="flex h-15 items-center justify-between gap-6">
          <Link
            href="/"
            className="font-display text-2xl font-black tracking-tight text-gray-900"
          >
            spotee
          </Link>

          <nav
            aria-label="メイン"
            className="hidden flex-1 items-center gap-6 md:flex"
          >
            <NavLink href="/spots" label="探す" active={isSpotsActive} />
            <NavLink
              href="/collections"
              label="特集"
              active={isCollectionsActive}
            />
          </nav>

          <div className="hidden items-center gap-4 md:flex">
            {loading ? (
              <div className="h-8 w-20 animate-pulse rounded bg-gray-100" />
            ) : user ? (
              <>
                <Link href="/spots/new" className="btn-primary">
                  投稿する
                </Link>
                <AccountMenu
                  name={me?.name ?? ""}
                  avatarUrl={me?.avatarUrl}
                  onSignOut={handleSignOut}
                />
              </>
            ) : (
              <Link href="/login" className="btn-primary">
                ログイン
              </Link>
            )}
          </div>

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
        <nav
          aria-label="メイン"
          className="border-t border-gray-100 bg-white px-4 py-3 md:hidden"
        >
          <div className="space-y-1">
            <MobileNavLink href="/spots" label="探す" active={isSpotsActive} />
            <MobileNavLink
              href="/collections"
              label="特集"
              active={isCollectionsActive}
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
                  <Link href="/spots/new" className="btn-primary w-full">
                    投稿する
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="block w-full rounded-lg px-3 py-2.5 text-left text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-900"
                  >
                    ログアウト
                  </button>
                </>
              ) : (
                <Link href="/login" className="btn-primary w-full">
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
