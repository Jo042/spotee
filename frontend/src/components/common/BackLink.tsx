"use client";

import { useSyncExternalStore } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

interface BackLinkProps {
  /** 履歴が無いとき（直接アクセス）の遷移先 */
  fallbackHref: string;
  /** 履歴が無いときの表示文言 */
  fallbackLabel: string;
}

/** 履歴の深さは購読できる値ではないため、変更通知は行わない */
const subscribe = () => () => {};

const getSnapshot = () => window.history.length > 1;

/** サーバー描画時はブラウザの履歴を読めないので、フォールバック側で描く */
const getServerSnapshot = () => false;

/**
 * 来た経路に応じて戻り先を決めるリンク。
 * アプリ内から遷移してきていればブラウザの戻ると同じ挙動にし、
 * 直接アクセス（履歴なし）のときだけ fallbackHref へ送る。
 */
export function BackLink({ fallbackHref, fallbackLabel }: BackLinkProps) {
  const router = useRouter();
  const canGoBack = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );

  const className =
    "inline-flex min-h-11 items-center gap-1.5 text-sm text-gray-500 transition-colors hover:text-gray-900";

  if (!canGoBack) {
    return (
      <Link href={fallbackHref} className={className}>
        <ArrowLeft size={16} />
        {fallbackLabel}
      </Link>
    );
  }

  return (
    <button type="button" onClick={() => router.back()} className={className}>
      <ArrowLeft size={16} />
      戻る
    </button>
  );
}
