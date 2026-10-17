"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import {
  AuthFormError,
  AuthLayout,
  AuthLoading,
} from "@/components/auth/AuthLayout";
import { GoogleButton } from "@/components/auth/GoogleButton";
import { Spinner } from "@/components/common/Spinner";
import { toAuthErrorMessage } from "@/lib/auth-error";

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
      setError(
        toAuthErrorMessage(
          error,
          "登録できませんでした。すでに登録している場合は、ログインかパスワードの再設定をお試しください",
        ),
      );
      setIsSubmitting(false);
    } else {
      setSubmittedEmail(email);
    }
  };

  const handleGoogleRegister = async () => {
    const { error } = await signInWithGoogle();
    if (error) {
      setError(toAuthErrorMessage(error, "Google で登録できませんでした"));
    }
  };

  if (loading) return <AuthLoading label="読み込み中" />;

  if (submittedEmail) {
    return (
      <AuthLayout
        title="確認のメールを送りました"
        description={
          <>
            <span className="font-medium text-gray-900">{submittedEmail}</span>{" "}
            に確認のメールを送りました。メールのリンクを開くと、登録が完了します。
          </>
        }
      >
        <Link href="/login" className="btn-secondary w-full py-3">
          ログインの画面へ
        </Link>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="新規登録"
      description="お気に入りの場所を見つけて、共有しよう"
      footer={
        <>
          すでにアカウントをお持ちの方は{" "}
          <Link href="/login" className="btn-text">
            ログイン
          </Link>
        </>
      }
    >
      <AuthFormError message={error} />

      <form className="space-y-5" onSubmit={handleRegister}>
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
            className="text-input"
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
            className="text-input"
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
            aria-describedby="password-hint"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="text-input"
          />
          <p id="password-hint" className="mt-1.5 text-xs text-gray-500">
            6文字以上で入力してください
          </p>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="btn-primary w-full py-3"
        >
          {isSubmitting && <Spinner className="h-4 w-4" />}
          {isSubmitting ? "登録中..." : "登録する"}
        </button>
      </form>

      <GoogleButton label="Google で登録" onClick={handleGoogleRegister} />
    </AuthLayout>
  );
}
