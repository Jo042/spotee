"use client";

import { useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Avatar } from "@/components/common/Avatar";

interface AccountMenuProps {
  name: string;
  avatarUrl?: string | null;
  onSignOut: () => void;
}

/** アバターを押すと開くアカウントのメニュー（PC のヘッダー用） */
export function AccountMenu({ name, avatarUrl, onSignOut }: AccountMenuProps) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const [prevPathname, setPrevPathname] = useState(pathname);
  const rootRef = useRef<HTMLDivElement>(null);
  const menuId = useId();

  if (prevPathname !== pathname) {
    setPrevPathname(pathname);
    setOpen(false);
  }

  useEffect(() => {
    if (!open) return;
    const handlePointer = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", handlePointer);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handlePointer);
      document.removeEventListener("keydown", handleKey);
    };
  }, [open]);

  const itemClass =
    "block w-full px-4 py-2.5 text-left text-sm text-gray-700 transition-colors hover:bg-gray-50 hover:text-gray-900 focus-visible:bg-gray-50 focus-visible:outline-none";

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        aria-controls={menuId}
        aria-label={`${name} のメニューを${open ? "閉じる" : "開く"}`}
        className="flex rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-300 focus-visible:ring-offset-2"
      >
        <Avatar name={name} src={avatarUrl} size={32} />
      </button>

      {open && (
        <div
          id={menuId}
          className="absolute right-0 z-50 mt-2 w-56 overflow-hidden rounded-xl border border-gray-200 bg-white py-1.5 shadow-lg"
        >
          <p className="truncate px-4 pb-2 pt-1 text-xs text-gray-500">
            {name}
          </p>
          <Link href="/mypage" className={itemClass}>
            マイページ
          </Link>
          <Link href="/mypage/edit" className={itemClass}>
            プロフィールを編集
          </Link>
          <div className="my-1.5 border-t border-gray-100" />
          <button type="button" onClick={onSignOut} className={itemClass}>
            ログアウト
          </button>
        </div>
      )}
    </div>
  );
}
