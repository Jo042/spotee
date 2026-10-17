/**
 * スポットの投稿・編集の文字数の上限。サーバーの検証
 * （backend/src/spot/dto/spot-input.constants.ts）の写しで、
 * 値が一致することを単体テストで確かめている
 */
export const SPOT_INPUT_LIMITS = {
  title: 100,
  description: 3000,
  address: 200,
  businessHours: 200,
} as const;
