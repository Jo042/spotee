"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import {
  AuthFormError,
  AuthLayout,
  AuthLoading,
} from "@/components/auth/AuthLayout";
import { GoogleButton } from "@/components/auth/GoogleButton";
import { Spinner } from "@/components/common/Spinner";
import { toAuthErrorMessage } from "@/lib/auth-error";

export default function LoginPage() {
  const router = useRouter();
  const { signInWithEmail, signInWithGoogle, loading } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleEmailLogin = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const { error } = await signInWithEmail(email, password);

    if (error) {
      setError(toAuthErrorMessage(error, "ログインできませんでした"));
      setIsSubmitting(false);
    } else {
      router.push("/");
    }
  };

  const handleGoogleLogin = async () => {
    const { error } = await signInWithGoogle();
    if (error) {
      setError(toAuthErrorMessage(error, "Google でログインできませんでした"));
    }
  };

  if (loading) return <AuthLoading label="読み込み中" />;

  return (
    <AuthLayout
      title="ログイン"
      footer={
        <>
          アカウントをお持ちでない方は{" "}
          <Link href="/register" className="btn-text">
            新規登録
          </Link>
        </>
      }
    >
      <AuthFormError message={error} />

      <form className="space-y-5" onSubmit={handleEmailLogin}>
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
          <div className="mb-1.5 flex items-baseline justify-between gap-3">
            <label
              htmlFor="password"
              className="text-sm font-medium text-gray-700"
            >
              パスワード
            </label>
            <Link href="/forgot-password" className="btn-text text-xs">
              パスワードを忘れたとき
            </Link>
          </div>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="text-input"
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="btn-primary w-full py-3"
        >
          {isSubmitting && <Spinner className="h-4 w-4" />}
          {isSubmitting ? "ログイン中..." : "ログイン"}
        </button>
      </form>

      <GoogleButton label="Google でログイン" onClick={handleGoogleLogin} />
    </AuthLayout>
  );
}
