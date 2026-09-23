import { CombinedGraphQLErrors } from "@apollo/client";

/**
 * 利用者に見せてよいエラー文言を取り出す。
 *
 * サーバーの入力検証（BAD_REQUEST）の文言は利用者向けに書いてあるので
 * そのまま出す。それ以外（内部エラーや認可など）は実装の詳細を含みうるため
 * 表示せず、呼び出し側の fallback に倒す。
 */
export function getUserFacingErrorMessage(
  error: unknown,
  fallback: string,
): string {
  if (!CombinedGraphQLErrors.is(error)) return fallback;

  const first = error.errors[0];
  if (first?.extensions?.code !== "BAD_REQUEST") return fallback;

  const original = first.extensions.originalError;
  if (typeof original !== "object" || original === null) return fallback;

  const message = (original as { message?: unknown }).message;
  if (typeof message === "string" && message !== "") return message;

  if (Array.isArray(message)) {
    const texts = message.filter(
      (m): m is string => typeof m === "string" && m !== "",
    );
    if (texts.length > 0) return texts.join("\n");
  }

  return fallback;
}
