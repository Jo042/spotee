/**
 * プロフィールの文字数の上限。サーバーの検証
 * （backend/src/user/dto/user-input.constants.ts）の写しで、
 * 値が一致することを単体テストで確かめている
 */
export const PROFILE_INPUT_LIMITS = {
  name: 50,
  bio: 200,
} as const;
