// 開発用のコマンド（migrate dev・サンプルデータ投入）を、ローカル以外の DB に
// 向けて実行しないための確認。migrate dev は差分があると DB のリセットを提案する
const LOCAL_HOSTS = new Set(['localhost', '127.0.0.1', '::1']);

const hostOf = (name) => {
  const value = process.env[name];
  if (!value) return null;
  try {
    return new URL(value).hostname;
  } catch {
    return '(URL として読めない値)';
  }
};

const targets = ['DATABASE_URL', 'DIRECT_URL']
  .map((name) => ({ name, host: hostOf(name) }))
  .filter(({ host }) => host !== null);

const remote = targets.filter(({ host }) => !LOCAL_HOSTS.has(host));

if (targets.length === 0 || remote.length > 0) {
  console.error('中止: 接続先がローカルの開発用 DB ではありません。');
  for (const { name, host } of remote) {
    console.error(`  ${name} → ${host}`);
  }
  console.error('backend/.env の接続先を localhost:5434 にしてください（README の「環境変数」）。');
  process.exit(1);
}
