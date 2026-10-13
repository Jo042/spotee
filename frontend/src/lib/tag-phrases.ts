/**
 * 「文章で探す」の一文に入れるときの言い回し（タグの slug → 言い回し）。
 * 一文は「[雰囲気]、[特徴] [カテゴリ]を探す」なので、名詞の前に置ける形にする。
 * ここに無いタグは名前をそのまま使う。
 */
export const MOOD_PHRASES: Readonly<Record<string, string>> = {
  date: "デートにおすすめの",
  friends: "友達と行きたい",
  solo: "一人でゆっくりできる",
  family: "家族で楽しめる",
  "rainy-day": "雨の日でも過ごせる",
  "sunny-day": "晴れた日に行きたい",
  photogenic: "写真映えする",
  "hidden-gem": "穴場の",
  popular: "定番の",
  quiet: "静かな",
  lively: "にぎやかな",
  anniversary: "記念日に行きたい",
};

export const ATTRIBUTE_PHRASES: Readonly<Record<string, string>> = {
  wifi: "Wi-Fiのある",
  "power-outlet": "電源のある",
  parking: "駐車場のある",
  "child-friendly": "子連れで行ける",
  "pet-friendly": "ペットと行ける",
  "reservation-required": "予約が必要な",
  takeout: "テイクアウトできる",
  "private-room": "個室のある",
  "barrier-free": "バリアフリーの",
  "non-smoking": "禁煙の",
};
