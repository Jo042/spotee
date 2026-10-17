"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  AuthFormError,
  AuthLayout,
  AuthLoading,
} from "@/components/auth/AuthLayout";
import { Spinner } from "@/components/common/Spinner";
import { toAuthErrorMessage } from "@/lib/auth-error";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";

const RECOVERY_LINK_TIMEOUT_MS = 4000;

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
      setError(toAuthErrorMessage(error, "パスワードを更新できませんでした"));
      setIsSubmitting(false);
      return;
    }

    await signOut();
    router.push("/login");
  };

  if (isLinkInvalid) {
    return (
      <AuthLayout
        title="リンクの有効期限が切れています"
        description="このパスワード再設定のリンクは、使えないか有効期限が切れています。もう一度、再設定のメールを送ってください。"
      >
        <Link href="/forgot-password" className="btn-primary w-full py-3">
          もう一度メールを送る
        </Link>
      </AuthLayout>
    );
  }

  if (!isRecoveryReady) return <AuthLoading label="確認中" />;

  return (
    <AuthLayout
      title="新しいパスワードを決める"
      description="ログインに使う新しいパスワードを入力してください"
    >
      <AuthFormError message={error} />

      <form className="space-y-5" onSubmit={handleSubmit}>
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
          {isSubmitting ? "更新中..." : "パスワードを更新する"}
        </button>
      </form>
    </AuthLayout>
  );
}
