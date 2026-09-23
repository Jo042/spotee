import { describe, it, expect } from "vitest";
import { CombinedGraphQLErrors } from "@apollo/client";
import { getUserFacingErrorMessage } from "./graphql-error";

const FALLBACK = "投稿に失敗しました";

const graphqlError = (extensions: Record<string, unknown>) =>
  new CombinedGraphQLErrors({
    errors: [{ message: "Bad Request Exception", extensions }],
  });

describe("getUserFacingErrorMessage", () => {
  it("入力検証の文言（配列）をそのまま返す", () => {
    const error = graphqlError({
      code: "BAD_REQUEST",
      originalError: { message: ["タイトルは100文字以内で入力してください"] },
    });

    expect(getUserFacingErrorMessage(error, FALLBACK)).toBe(
      "タイトルは100文字以内で入力してください",
    );
  });

  it("複数の文言は改行でつなぐ", () => {
    const error = graphqlError({
      code: "BAD_REQUEST",
      originalError: {
        message: ["タイトルが長すぎます", "住所を入力してください"],
      },
    });

    expect(getUserFacingErrorMessage(error, FALLBACK)).toBe(
      "タイトルが長すぎます\n住所を入力してください",
    );
  });

  it("文言が文字列でも返す", () => {
    const error = graphqlError({
      code: "BAD_REQUEST",
      originalError: { message: "自分自身はフォローできません" },
    });

    expect(getUserFacingErrorMessage(error, FALLBACK)).toBe(
      "自分自身はフォローできません",
    );
  });

  describe("利用者に見せないもの", () => {
    it("BAD_REQUEST 以外は fallback にする（内部エラーの詳細を出さない）", () => {
      const error = graphqlError({
        code: "INTERNAL_SERVER_ERROR",
        originalError: { message: "connect ECONNREFUSED 10.0.0.5:5432" },
      });

      expect(getUserFacingErrorMessage(error, FALLBACK)).toBe(FALLBACK);
    });

    it("認可エラーは fallback にする", () => {
      const error = graphqlError({ code: "UNAUTHENTICATED" });
      expect(getUserFacingErrorMessage(error, FALLBACK)).toBe(FALLBACK);
    });

    it("GraphQL のエラーでなければ fallback にする（通信断など）", () => {
      expect(
        getUserFacingErrorMessage(new Error("Failed to fetch"), FALLBACK),
      ).toBe(FALLBACK);
    });

    it("originalError が無ければ fallback にする", () => {
      const error = graphqlError({ code: "BAD_REQUEST" });
      expect(getUserFacingErrorMessage(error, FALLBACK)).toBe(FALLBACK);
    });

    it("文言が空なら fallback にする", () => {
      const error = graphqlError({
        code: "BAD_REQUEST",
        originalError: { message: [] },
      });
      expect(getUserFacingErrorMessage(error, FALLBACK)).toBe(FALLBACK);
    });
  });

  it.each([null, undefined, "文字列", 123])(
    "%p は fallback にする",
    (value) => {
      expect(getUserFacingErrorMessage(value, FALLBACK)).toBe(FALLBACK);
    },
  );
});
