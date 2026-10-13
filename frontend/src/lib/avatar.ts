const segmenter = new Intl.Segmenter("ja", { granularity: "grapheme" });

/**
 * 画像の無いユーザーのアバターに出す1文字。
 * 絵文字や結合文字を途中で切らないよう、見た目の1文字（書記素）単位で取る
 */
export function getInitial(name: string): string {
  const trimmed = name.trim();
  if (trimmed === "") return "?";

  const first = segmenter.segment(trimmed)[Symbol.iterator]().next().value;
  return (first?.segment ?? "?").toLocaleUpperCase("ja");
}
