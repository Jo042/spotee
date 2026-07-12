"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";

const RECOVERY_LINK_TIMEOUT_MS = 4000;

function Spinner({ className }: { className: string }) {
  return (
    <svg
      className={`animate-spin ${className}`}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
      />
    </svg>
  );
}

export default function ResetPasswordPage() {
  const router = useRouter();
  const { updatePassword, signOut } = useAuth();

  const [isRecoveryReady, setIsRecoveryReady] = useState(false);
  const [isLinkInvalid, setIsLinkInvalid] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setIsRecoveryReady(true);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY" || session) {
        setIsRecoveryReady(true);
      }
    });

    const timeoutId = setTimeout(() => {
      setIsRecoveryReady((ready) => {
        if (!ready) setIsLinkInvalid(true);
        return ready;
      });
    }, RECOVERY_LINK_TIMEOUT_MS);

    return () => {
      subscription.unsubscribe();
      clearTimeout(timeoutId);
    };
  }, []);

  const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const { error } = await updatePassword(password);

    if (error) {
      setError(error.message);
      setIsSubmitting(false);
      return;
    }

    await signOut();
    router.push("/login");
  };

  const inputClassName =
    "block w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-[15px] text-gray-900 placeholder:text-gray-400 transition focus:border-primary-700 focus:outline-none focus:ring-1 focus:ring-primary-700";

  if (isLinkInvalid) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12">
        <main className="w-full max-w-md">
          <div className="rounded-2xl border border-gray-200 bg-white px-6 py-10 shadow-sm sm:px-10">
            <div className="text-center">
              <Link
                href="/"
                className="inline-block text-2xl font-bold tracking-tight text-primary-500"
              >
                Spotee
                <span className="text-primary-600">.</span>
              </Link>
              <h1 className="mt-6 text-[22px] font-bold leading-snug text-gray-900">
                リンクの有効期限が切れています
              </h1>
              <p className="mt-2 text-sm text-gray-500">
                このパスワード再設定用リンクは無効か、有効期限が切れています。もう一度リセットメールを送信してください。
              </p>
            </div>

            <Link
              href="/forgot-password"
              className="mt-8 flex w-full items-center justify-center rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-primary-700 active:scale-95"
            >
              もう一度メールを送る
            </Link>
          </div>
        </main>
      </div>
    );
  }

  if (!isRecoveryReady) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <Spinner className="h-6 w-6 text-primary-600" />
        <span className="sr-only">確認中...</span>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12">
      <main className="w-full max-w-md">
        <div className="rounded-2xl border border-gray-200 bg-white px-6 py-10 shadow-sm sm:px-10">
          <div className="text-center">
            <Link
              href="/"
              className="inline-block text-2xl font-bold tracking-tight text-primary-500"
            >
              Spotee
              <span className="text-primary-600">.</span>
            </Link>
            <h1 className="mt-6 text-[22px] font-bold leading-snug text-gray-900">
              新しいパスワードを設定
            </h1>
            <p className="mt-2 text-sm text-gray-500">
              ログインに使用する新しいパスワードを入力してください
            </p>
          </div>

          {error && (
            <div
              role="alert"
              className="mt-6 flex items-start gap-2.5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600"
            >
              <svg
                className="mt-0.5 h-4 w-4 shrink-0"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z"
                  clipRule="evenodd"
                />
              </svg>
              {error}
            </div>
          )}

          <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
            <div>
              <label
                htmlFor="password"
                className="mb-1.5 block text-sm font-medium text-gray-700"
              >
                新しいパスワード
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={inputClassName}
              />
              <p className="mt-1.5 text-xs text-gray-500">
                6文字以上で入力してください
              </p>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-primary-700 active:scale-95 disabled:pointer-events-none disabled:opacity-50"
            >
              {isSubmitting && <Spinner className="h-4 w-4 text-white" />}
              {isSubmitting ? "更新中..." : "パスワードを更新"}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
