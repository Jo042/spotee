"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import {
  AuthFormError,
  AuthLayout,
  AuthLoading,
} from "@/components/auth/AuthLayout";
import { Spinner } from "@/components/common/Spinner";
import { toAuthErrorMessage } from "@/lib/auth-error";

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
      setError(toAuthErrorMessage(error, "メールを送れませんでした"));
      setIsSubmitting(false);
    } else {
      setSubmittedEmail(email);
    }
  };

  if (loading) return <AuthLoading label="読み込み中" />;

  const backToLogin = (
    <Link href="/login" className="btn-text">
      ログインの画面に戻る
    </Link>
  );

  if (submittedEmail) {
    return (
      <AuthLayout
        title="再設定のメールを送りました"
        description={
          <>
            <span className="font-medium text-gray-900">{submittedEmail}</span>{" "}
            に、パスワードを再設定するメールを送りました。メールのリンクから、新しいパスワードを決めてください。
          </>
        }
        footer={backToLogin}
      />
    );
  }

  return (
    <AuthLayout
      title="パスワードを忘れたとき"
      description="登録したメールアドレスに、パスワードを再設定するリンクを送ります"
      footer={backToLogin}
    >
      <AuthFormError message={error} />

      <form className="space-y-5" onSubmit={handleSubmit}>
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

        <button
          type="submit"
          disabled={isSubmitting}
          className="btn-primary w-full py-3"
        >
          {isSubmitting && <Spinner className="h-4 w-4" />}
          {isSubmitting ? "送信中..." : "再設定のメールを送る"}
        </button>
      </form>
    </AuthLayout>
  );
}
