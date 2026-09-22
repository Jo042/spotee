"use client";

import { useSyncExternalStore } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import {
  subscribeInAppNavigation,
  getInAppNavigationSnapshot,
  getInAppNavigationServerSnapshot,
} from "@/lib/in-app-navigation";

interface BackLinkProps {
  /** アプリ内の移動が無いとき（直接アクセス）の遷移先 */
  fallbackHref: string;
  /** 直接アクセス時の表示文言 */
  fallbackLabel: string;
}

/**
 * 来た経路に応じて戻り先を決めるリンク。
 * アプリ内を一度でも移動していればブラウザの戻ると同じ挙動にし、
 * 直接アクセスのときだけ fallbackHref へ送る。
 */
export function BackLink({ fallbackHref, fallbackLabel }: BackLinkProps) {
  const router = useRouter();
  const canGoBack = useSyncExternalStore(
    subscribeInAppNavigation,
    getInAppNavigationSnapshot,
    getInAppNavigationServerSnapshot,
  );

  const className =
    "inline-flex min-h-11 items-center gap-1.5 text-sm text-gray-500 transition-colors hover:text-gray-900";

  if (!canGoBack) {
    return (
      <Link href={fallbackHref} aria-label="戻る" className={className}>
        <ArrowLeft size={16} />
        {fallbackLabel}
      </Link>
    );
  }

  return (
    <button
      type="button"
      onClick={() => router.back()}
      aria-label="戻る"
      className={className}
    >
      <ArrowLeft size={16} />
      戻る
    </button>
  );
}
