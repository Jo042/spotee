const MAN = 10000;

/**
 * 件数の表示用フォーマット。1万以上は「1.2万」「12万」に丸める。
 * 桁数が増えてもレイアウトが崩れないようにするためのもので、
 * 正確な数が要る場面では使わない。
 */
export function formatCount(count: number): string {
  if (!Number.isFinite(count) || count < 0) return "0";

  const value = Math.floor(count);
  if (value < MAN) return String(value);

  const inMan = value / MAN;
  if (inMan < 10) {
    return `${Math.floor(inMan * 10) / 10}万`;
  }

  return `${Math.floor(inMan)}万`;
}

/** 特集の中の順番を「01」「02」のように2桁で表す。10以上はそのまま */
export function formatRank(rank: number): string {
  return String(rank).padStart(2, "0");
}
