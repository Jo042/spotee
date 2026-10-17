import { describe, it, expect } from "vitest";
import {
  ADDRESS_MAX_LENGTH,
  BUSINESS_HOURS_MAX_LENGTH,
  DESCRIPTION_MAX_LENGTH,
  TITLE_MAX_LENGTH,
} from "../../../backend/src/spot/dto/spot-input.constants";
import { SPOT_INPUT_LIMITS } from "./spot-form";

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
