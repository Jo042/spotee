/** Supabase Storage の公開URLのうち、スポット画像として許可するパス */
const STORAGE_PUBLIC_PREFIX = '/storage/v1/object/public/spots/';

/**
 * 自分の Supabase Storage にアップロードされた画像URLかを判定する。
 *
 * 文字列の前方一致や includes では判定できない。
 * `https://自分のホスト.co.evil.com/` や `https://自分のホスト.co@evil.com/` は
 * 前方一致を通過するし、クエリやフラグメントに自分のホスト名を埋め込めば
 * includes も通過する。実際の接続先は URL をパースしないと分からない。
 */
export function isSpotImageUrl(
  value: unknown,
  supabaseUrl: string | undefined,
): boolean {
  if (typeof value !== 'string' || !supabaseUrl) return false;

  const expectedHost = parseHostname(supabaseUrl);
  if (!expectedHost) return false;

  let parsed: URL;
  try {
    parsed = new URL(value);
  } catch {
    return false;
  }

  // http や javascript: を弾く
  if (parsed.protocol !== 'https:') return false;

  // hostname は正規化済み（小文字化され、userinfo とポートを含まない）
  if (parsed.hostname !== expectedHost) return false;

  // 正規の Storage URL に認証情報は付かない
  if (parsed.username !== '' || parsed.password !== '') return false;

  // pathname は new URL の時点で `..` が解決されている
  return parsed.pathname.startsWith(STORAGE_PUBLIC_PREFIX);
}

function parseHostname(url: string): string | null {
  try {
    return new URL(url).hostname;
  } catch {
    return null;
  }
}
