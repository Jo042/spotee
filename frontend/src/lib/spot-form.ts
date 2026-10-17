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

/**
 * 「入力した数/上限」。入力欄の maxLength と同じく JavaScript の length
 * （UTF-16 の単位）で数える。サーバーの @MaxLength は絵文字などを1文字と
 * 数えるので、フロントのほうが厳しめになり、送ってから弾かれることはない
 */
export function charCountLabel(value: string, max: number): string {
  return `${value.length}/${max}`;
}
