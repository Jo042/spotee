import { isAuthError, isAuthRetryableFetchError } from "@supabase/supabase-js";

const NETWORK_ERROR_MESSAGE =
  "通信できませんでした。電波の届くところで、もう一度お試しください";

const RATE_LIMIT_MESSAGE =
  "短い時間に何度も試したため、しばらく待ってからお試しください";

/**
 * Supabase Auth のエラーコード → 利用者に見せる文言。
 * どちらが違うか・登録済みかどうかは言わない（他人のメールアドレスが
 * 登録されているかを調べられないようにする）
 */
const AUTH_ERROR_MESSAGES: Readonly<Record<string, string>> = {
  invalid_credentials: "メールアドレスかパスワードが違います",
  email_not_confirmed:
    "メールアドレスの確認が済んでいません。届いたメールのリンクを開いてください",
  email_address_invalid: "このメールアドレスは使えません",
  weak_password:
    "このパスワードは使えません。もっと長く、推測されにくいものにしてください",
  same_password: "今と同じパスワードは使えません",
  otp_expired:
    "リンクの有効期限が切れています。もう一度、再設定のメールを送ってください",
  over_email_send_rate_limit: RATE_LIMIT_MESSAGE,
  over_request_rate_limit: RATE_LIMIT_MESSAGE,
};

/** Supabase Auth のエラーを日本語の文言にする。知らないエラーは fallback（英語は出さない） */
export function toAuthErrorMessage(error: unknown, fallback: string): string {
  if (isAuthRetryableFetchError(error)) return NETWORK_ERROR_MESSAGE;
  if (!isAuthError(error) || !error.code) return fallback;
  return AUTH_ERROR_MESSAGES[error.code] ?? fallback;
}
