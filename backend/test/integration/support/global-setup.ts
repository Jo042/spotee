import { execFileSync } from 'node:child_process';
import { testDatabaseUrl } from './test-database';

/** テスト用の DB が無ければ作り、マイグレーションを適用する */
export default function globalSetup(): void {
  const url = testDatabaseUrl();
  execFileSync('npx', ['prisma', 'migrate', 'deploy'], {
    stdio: 'pipe',
    env: { ...process.env, DATABASE_URL: url, DIRECT_URL: url },
  });
}
