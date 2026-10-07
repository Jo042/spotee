import { assertTestDatabaseUrl } from './support/test-database';

describe('テスト用の DB の確認', () => {
  it('ローカルの _test で終わる DB なら通す', () => {
    expect(() =>
      assertTestDatabaseUrl(
        'postgresql://postgres:dev@localhost:5434/spotee_test',
      ),
    ).not.toThrow();
  });

  it('DB 名が _test で終わらなければ止める', () => {
    expect(() =>
      assertTestDatabaseUrl(
        'postgresql://postgres:dev@localhost:5434/postgres',
      ),
    ).toThrow('_test で終わる');
  });

  it('ローカル以外の DB なら止める', () => {
    expect(() =>
      assertTestDatabaseUrl(
        'postgresql://postgres:secret@db.example.supabase.co:5432/spotee_test',
      ),
    ).toThrow('ローカルに限ります');
  });
});
