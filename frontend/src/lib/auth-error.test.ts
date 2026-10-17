import { describe, it, expect } from "vitest";
import { AuthApiError, AuthRetryableFetchError } from "@supabase/supabase-js";
import { toAuthErrorMessage } from "./auth-error";

const FALLBACK = "ログインできませんでした";
const apiError = (code: string, status = 400) =>
  new AuthApiError("English message from Supabase", status, code);

describe("toAuthErrorMessage", () => {
  it("ログインの失敗は、どちらが違うかを言わない", () => {
    const message = toAuthErrorMessage(
      apiError("invalid_credentials"),
      FALLBACK,
    );
    expect(message).toBe("メールアドレスかパスワードが違います");
    expect(message).not.toMatch(/登録されていません|存在しません/);
  });

  it("メールアドレスの確認が済んでいなければ、確認のメールを開くよう案内する", () => {
    expect(toAuthErrorMessage(apiError("email_not_confirmed"), FALLBACK)).toBe(
      "メールアドレスの確認が済んでいません。届いたメールのリンクを開いてください",
    );
  });

  it("回数の制限は、しばらく待つよう案内する", () => {
    for (const code of [
      "over_email_send_rate_limit",
      "over_request_rate_limit",
    ]) {
      expect(toAuthErrorMessage(apiError(code, 429), FALLBACK)).toBe(
        "短い時間に何度も試したため、しばらく待ってからお試しください",
      );
    }
  });

  it("弱いパスワード・同じパスワード・期限切れのリンクは、それぞれの文言", () => {
    expect(
      toAuthErrorMessage(apiError("weak_password", 422), FALLBACK),
    ).toMatch(/このパスワードは使えません/);
    expect(toAuthErrorMessage(apiError("same_password", 422), FALLBACK)).toBe(
      "今と同じパスワードは使えません",
    );
    expect(toAuthErrorMessage(apiError("otp_expired", 403), FALLBACK)).toMatch(
      /リンクの有効期限が切れています/,
    );
  });

  it("通信の失敗は、通信できなかったと伝える", () => {
    expect(
      toAuthErrorMessage(
        new AuthRetryableFetchError("Failed to fetch", 0),
        FALLBACK,
      ),
    ).toBe("通信できませんでした。電波の届くところで、もう一度お試しください");
  });

  it("知らないコード・コードの無いエラー・認証以外のエラーは、画面ごとの文言にし、英語を出さない", () => {
    expect(toAuthErrorMessage(apiError("user_already_exists"), FALLBACK)).toBe(
      FALLBACK,
    );
    expect(
      toAuthErrorMessage(new AuthApiError("Oops", 500, undefined), FALLBACK),
    ).toBe(FALLBACK);
    expect(toAuthErrorMessage(new Error("Something"), FALLBACK)).toBe(FALLBACK);
  });
});
