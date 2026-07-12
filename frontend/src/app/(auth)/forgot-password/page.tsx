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

export default function ForgotPasswordPage() {
  const { resetPasswordForEmail, loading } = useAuth();

  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState<string | null>(null);

  const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const { error } = await resetPasswordForEmail(email);

    if (error) {
      setError(error.message);
      setIsSubmitting(false);
    } else {
      setSubmittedEmail(email);
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
                リセット用メールを送信しました
              </h1>
              <p className="mt-2 text-sm text-gray-500">
                <span className="font-medium text-gray-700">
                  {submittedEmail}
                </span>{" "}
                宛にパスワード再設定用のメールを送信しました。メール内のリンクから新しいパスワードを設定してください。
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
              パスワードをお忘れですか？
            </h1>
            <p className="mt-2 text-sm text-gray-500">
              登録済みのメールアドレスにリセット用のリンクを送ります
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

            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-primary-700 active:scale-95 disabled:pointer-events-none disabled:opacity-50"
            >
              {isSubmitting && <Spinner className="h-4 w-4 text-white" />}
              {isSubmitting ? "送信中..." : "リセットメールを送る"}
            </button>
          </form>
        </div>

        <p className="mt-6 text-center text-sm text-gray-600">
          <Link
            href="/login"
            className="font-medium text-primary-600 transition-colors hover:text-primary-700 hover:underline"
          >
            ログイン画面に戻る
          </Link>
        </p>
      </main>
    </div>
  );
}
