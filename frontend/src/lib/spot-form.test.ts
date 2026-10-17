import { describe, it, expect } from "vitest";
import {
  ADDRESS_MAX_LENGTH,
  BUSINESS_HOURS_MAX_LENGTH,
  DESCRIPTION_MAX_LENGTH,
  TITLE_MAX_LENGTH,
} from "../../../backend/src/spot/dto/spot-input.constants";
import { charCountLabel, SPOT_INPUT_LIMITS } from "./spot-form";

describe("SPOT_INPUT_LIMITS", () => {
  it("フロントの文字数の上限が、バックエンドの検証の上限と一致する", () => {
    expect(SPOT_INPUT_LIMITS).toEqual({
      title: TITLE_MAX_LENGTH,
      description: DESCRIPTION_MAX_LENGTH,
      address: ADDRESS_MAX_LENGTH,
      businessHours: BUSINESS_HOURS_MAX_LENGTH,
    });
  });
});

describe("charCountLabel", () => {
  it("入力した数/上限 を返す", () => {
    expect(charCountLabel("", 100)).toBe("0/100");
    expect(charCountLabel("渋谷のカフェ", 100)).toBe("6/100");
  });

  it("絵文字は入力欄の maxLength と同じく2文字と数える", () => {
    expect(charCountLabel("🍰", 100)).toBe("2/100");
  });
});
