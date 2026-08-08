# ローカル計測環境（bench）

スポット一覧・検索クエリの実行計画を分析するための PostgreSQL コンテナ。Issue [#205](https://github.com/Jo042/spotee/issues/205) 用。

アプリケーションは含まない。**DB 単体**を立てて、`psql` から直接クエリを叩いて `EXPLAIN ANALYZE` を読む。

---

## 1. 起動

```bash
docker compose -f infra/bench/docker-compose.yml up -d
```

## 2. 設定が効いているか確認（必ずやる）

```bash
docker exec spotee-bench psql -U postgres -d postgres \
  -c "SHOW shared_buffers;" \
  -c "SHOW effective_cache_size;" \
  -c "SHOW work_mem;" \
  -c "SHOW random_page_cost;"
```

期待値は `256MB` / `512MB` / `4MB` / `4`。

指定したつもりが効いていないことは普通に起こる。誤った設定のまま測ると結論ごと間違うので、計測前に毎回目視する。

## 3. スキーマとデータの投入

```bash
cd backend
export DATABASE_URL="postgresql://postgres:bench@localhost:5433/postgres"
export DIRECT_URL="$DATABASE_URL"

npx prisma migrate deploy    # スキーマ適用
npx prisma db seed           # マスタ（カテゴリ・属性タグ・ムードタグ）
SPOT_COUNT=3000 npm run seed:loadtest
```

**`.env` は書き換えない。** 環境変数で上書きする。`.env` を直接編集すると開発用 Supabase の接続先を壊し、戻し忘れで事故る。

## 4. 統計情報の更新（データを入れ直すたび）

```bash
docker exec spotee-bench psql -U postgres -d postgres -c "ANALYZE;"
```

プランナは「行数」「値の分布」の統計を見て実行計画を決める。大量投入の直後は autovacuum が追いついておらず、古い統計のままだと実データと乖離した計画が選ばれる。これを忘れると「インデックスを貼ったのに使われない」という誤った結論になる。

## 5. 接続

```bash
docker exec -it spotee-bench psql -U postgres -d postgres
```

---

## パラメータの根拠

RDS for PostgreSQL の既定パラメータグループは、インスタンスのメモリ量から式で決まる。AWS 検証環境は **db.t3.micro（1 GiB）** なので、そこから逆算した値を使う。

| パラメータ | RDS の式 | 実質 | db.t3.micro での値 |
|---|---|---|---|
| `shared_buffers` | `{DBInstanceClassMemory/32768}` | メモリの 25% | **256MB** |
| `effective_cache_size` | `{DBInstanceClassMemory/16384}` | メモリの 50% | **512MB** |
| `work_mem` | 既定のまま | — | 4MB |
| `random_page_cost` | 既定のまま | — | 4.0 |

`DBInstanceClassMemory` は物理メモリから OS などの予約分を引いた値なので、実際の RDS はこれより少し小さい。**この値は計算による推定であり、フェーズ2で実 RDS に接続した際に `SHOW shared_buffers;` で照合すること。**

### 各パラメータが計測に与える影響

| パラメータ | 役割 | 誤ると何が起きるか |
|---|---|---|
| `shared_buffers` | PostgreSQL 専用のページキャッシュ。**実際にメモリを確保する** | 低すぎると `EXPLAIN (ANALYZE, BUFFERS)` の `shared hit` が減り `read` が増える。I/O の見え方が変わる |
| `effective_cache_size` | プランナへのヒント。**メモリは確保しない**。「これだけキャッシュされている前提で計画せよ」 | 高すぎるとランダムアクセスが安いと判断され、**Index Scan が過度に選ばれる**。インデックスの要否判定を誤る |
| `work_mem` | ソート・ハッシュ1操作あたりのメモリ | 超えるとディスクに溢れ、実行計画に `Sort Method: external merge Disk` と出る。収まれば `quicksort Memory: xxkB` |
| `random_page_cost` | ランダムアクセスのコスト見積り | 4.0 は**HDD 前提の古い既定値**。SSD では割高な見積りになり、プランナがインデックスを避けがちになる |

`random_page_cost` を 1.1 にすると実行計画が変わるかは、それ自体が検証する価値のある実験。RDS が 4.0 のままなので既定では揃えている。

### `mem_limit: 1g` の理由

これが無いと、ホスト（Mac）の潤沢なメモリで OS がデータを全部キャッシュしてしまい、**30万件でも全部メモリに載って不自然に速く見える**。RDS と同じ 1 GiB に制限することで「データがキャッシュに収まりきらない」状況を再現する。

コンテナが不安定になるようなら外してよい。その場合は計測条件として記録に残すこと。

### `shm_size: 256mb` の理由

パラレルクエリが使う共有メモリ（`/dev/shm`）は Docker の既定が 64MB しかなく、大きめのスキャンで `could not resize shared memory segment` が出ることがある。

---

## 計測水準の切り替え

3水準で測る。単一のデータ量では「効いた／効かない」しか分からず、**劣化の仕方**からボトルネックの性質を切り分けられないため。

| 水準 | 件数 | 位置づけ |
|---|---|---|
| L1 | 3,000 | 近い将来の現実的な規模 |
| L2 | 30,000 | 成長後の想定 |
| L3 | 300,000 | 限界の把握。インデックスの有無が実行計画に現れる規模 |

```bash
cd backend
export DATABASE_URL="postgresql://postgres:bench@localhost:5433/postgres"
export DIRECT_URL="$DATABASE_URL"

SEED_RESET=true SPOT_COUNT=30000  npm run seed:loadtest   # L2
SEED_RESET=true SPOT_COUNT=300000 npm run seed:loadtest   # L3
```

**`SEED_RESET=true` を忘れると追記される**（3,000 + 30,000 = 33,000件になる）。投入後は毎回 `ANALYZE` を実行する。

3,000件程度ではテーブル全体がメモリに載るため、プランナが「Seq Scan して Sort した方が速い」と判断することがある。**インデックスの要否は L2 以降で判定する。**

---

## seed スクリプト

| ファイル | 実行 | 内容 |
|---|---|---|
| `backend/prisma/seed.ts` | `npx prisma db seed` | マスタ。カテゴリ12・属性タグ10・ムードタグ12 を `upsert`。何度実行しても重複しない |
| `backend/prisma/seed-loadtest.ts` | `npm run seed:loadtest` | 負荷計測用のダミー。マスタ投入済みが前提 |

### `seed-loadtest.ts` の設計上のポイント

- **Zipf 風の重み付け** — カテゴリ・タグ・投稿者の選択を `1/(順位)` で偏らせる。均等に散らすとタグ検索の選択率が非現実的になり、プランナの計画選択が実運用と乖離する
- **`likeCount` はべき乗分布** — 5% を 200〜3,000 の「バズ投稿」扱い。いいね順ソートの計測用。`Like` レコードは作らない（認証が計測対象外のため）
- **`randomPastDate` は日単位の粒度** — `randomInt(0, 180) * 86400000` なので `created_at` は 181 通りしか取らない。**カーソルのタイブレーク欠落（H4）が顕在化する条件**であり、意図的にこのままにしている
- **タイトルに連番が入る** — `${形容詞}${カテゴリ}スポット #${index}` なので一意。したがって `TITLE` ソートでの取りこぼしはこのデータでは再現しない（検証には重複タイトルのデータを別途用意する）
- **1,000件ごとに生成 → 投入 → 破棄** — 全件をメモリに積むと30万件で画像90万行・タグ紐付け135万行が同時に載って厳しいため
- **`INSERT_CHUNK_SIZE = 500`** — PostgreSQL のバインドパラメータ上限が1文あたり 65535。Spot は列が11個なので約5,900行が上限で、500 なら安全圏

### 環境変数

| 変数 | 既定 | 説明 |
|---|---|---|
| `SPOT_COUNT` | 3000 | 生成するスポット数 |
| `USER_COUNT` | 30 | 生成するユーザー数 |
| `SEED_RESET` | （未設定） | `true` でスポット系テーブルを TRUNCATE してから投入。マスタは残す |

---

## 後始末

```bash
docker compose -f infra/bench/docker-compose.yml down
```

ボリュームを定義していないので、コンテナを削除するとデータも消える。計測水準を切り替えながら使う都合上、常にきれいな状態から作り直せる方が事故が少ないため意図的にそうしている。
