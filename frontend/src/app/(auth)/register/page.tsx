"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

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

export default function RegisterPage() {
  const { signUp, signInWithGoogle, loading } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState<string | null>(null);

  const handleRegister = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    const trimmedName = name.trim();
    if (!trimmedName) {
      setError("名前を入力してください");
      return;
    }

    setIsSubmitting(true);
    const { error } = await signUp(email, password, trimmedName);

    if (error) {
      setError(error.message);
      setIsSubmitting(false);
    } else {
      setSubmittedEmail(email);
    }
  };

  const handleGoogleRegister = async () => {
    const { error } = await signInWithGoogle();
    if (error) {
      setError(error.message);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <Spinner className="h-6 w-6 text-primary-600" />
        <span className="sr-only">読み込み中</span>
      </div>
    );
  }

  const inputClassName =
    "block w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-[15px] text-gray-900 placeholder:text-gray-400 transition focus:border-primary-700 focus:outline-none focus:ring-1 focus:ring-primary-700";

  if (submittedEmail) {
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

              <div
                role="status"
                className="mx-auto mt-8 flex h-12 w-12 items-center justify-center rounded-full bg-primary-50 text-primary-600"
              >
                <Mail className="h-6 w-6" aria-hidden="true" />
              </div>

              <h1 className="mt-6 text-[22px] font-bold leading-snug text-gray-900">
                確認メールを送信しました
              </h1>
              <p className="mt-2 text-sm text-gray-500">
                <span className="font-medium text-gray-700">
                  {submittedEmail}
                </span>{" "}
                宛に確認メールを送信しました。メール内のリンクから登録を完了してください。
              </p>
            </div>

            <Link
              href="/login"
              className="mt-8 flex w-full items-center justify-center rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-bold text-gray-900 transition hover:bg-gray-50 active:scale-95"
            >
              ログイン画面へ
            </Link>
          </div>
        </main>
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
              Spotee に新規登録
            </h1>
            <p className="mt-2 text-sm text-gray-500">
              お気に入りの場所を見つけて、共有しよう
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

          <form className="mt-8 space-y-5" onSubmit={handleRegister}>
            <div>
              <label
                htmlFor="name"
                className="mb-1.5 block text-sm font-medium text-gray-700"
              >
                名前
              </label>
              <input
                id="name"
                name="name"
                type="text"
                autoComplete="name"
                required
                maxLength={50}
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={inputClassName}
              />
            </div>

            <div>
              <label
                htmlFor="email"
                className="mb-1.5 block text-sm font-medium text-gray-700"
              >
                メールアドレス
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="mail@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={inputClassName}
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-1.5 block text-sm font-medium text-gray-700"
              >
                パスワード
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
              {isSubmitting ? "登録中..." : "登録する"}
            </button>
          </form>

          <div className="mt-6 flex items-center gap-3">
            <span className="h-px flex-1 bg-gray-200" />
            <span className="text-xs text-gray-500">または</span>
            <span className="h-px flex-1 bg-gray-200" />
          </div>

          <button
            onClick={handleGoogleRegister}
            className="mt-6 flex w-full items-center justify-center gap-2.5 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-bold text-gray-900 transition hover:bg-gray-50 active:scale-95"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
              <path
                fill="#4285F4"
                d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47a5.57 5.57 0 01-2.4 3.58v3h3.86c2.26-2.09 3.56-5.17 3.56-8.82z"
              />
              <path
                fill="#34A853"
                d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96H1.29v3.09A11.99 11.99 0 0012 24z"
              />
              <path
                fill="#FBBC05"
                d="M5.27 14.29a7.19 7.19 0 010-4.58V6.62H1.29a11.99 11.99 0 000 10.76l3.98-3.09z"
              />
              <path
                fill="#EA4335"
                d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0A11.99 11.99 0 001.29 6.62l3.98 3.09C6.22 6.86 8.87 4.75 12 4.75z"
              />
            </svg>
            Google で登録
          </button>
        </div>

        <p className="mt-6 text-center text-sm text-gray-600">
          すでにアカウントをお持ちの方は{" "}
          <Link
            href="/login"
            className="font-medium text-primary-600 transition-colors hover:text-primary-700 hover:underline"
          >
            ログイン
          </Link>
        </p>
      </main>
    </div>
  );
}
