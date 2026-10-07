const LOCAL_HOSTS = new Set(['localhost', '127.0.0.1', '[::1]']);

export const DEFAULT_TEST_DATABASE_URL =
  'postgresql://postgres:dev@localhost:5434/spotee_test';

/**
 * テストは毎回すべてのテーブルを空にするため、開発用や本番の DB に
 * 向いていたら始める前に止める
 */
export function assertTestDatabaseUrl(value: string): void {
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    throw new Error('テスト用の DB の接続先を URL として読めません');
  }

  if (!LOCAL_HOSTS.has(url.hostname)) {
    throw new Error(
      `テスト用の DB はローカルに限ります（接続先: ${url.hostname}）`,
    );
  }

  const database = url.pathname.slice(1);
  if (!database.endsWith('_test')) {
    throw new Error(
      `テスト用の DB の名前は _test で終わる必要があります（DB 名: ${database || '(なし)'}）`,
    );
  }
}

export function testDatabaseUrl(): string {
  const url = process.env.TEST_DATABASE_URL ?? DEFAULT_TEST_DATABASE_URL;
  assertTestDatabaseUrl(url);
  return url;
}
