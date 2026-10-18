import { describe, it, expect } from "vitest";
import {
  BIO_MAX_LENGTH,
  NAME_MAX_LENGTH,
} from "../../../backend/src/user/dto/user-input.constants";
import { PROFILE_INPUT_LIMITS } from "./profile-form";

describe("PROFILE_INPUT_LIMITS", () => {
  it("フロントの文字数の上限が、バックエンドの検証の上限と一致する", () => {
    expect(PROFILE_INPUT_LIMITS).toEqual({
      name: NAME_MAX_LENGTH,
      bio: BIO_MAX_LENGTH,
    });
  });
});
