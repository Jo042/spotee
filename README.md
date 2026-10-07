# Spotee（スポッティー）

> すべての人が、次の"行きたい場所"に出会えるサービス

**https://getspotee.com**

お気に入りのスポットを写真・タグ付きで投稿・共有できるSNSライクなWebアプリです。  
Instagram等のSNSでは難しい「複合条件での絞り込み」を、AND/OR切り替え可能なフィルター検索で実現しています。

---

## 主な機能

- スポット投稿（写真複数枚・カテゴリ・タグ・価格帯・営業時間）
- キーワード検索 + 複合フィルター（カテゴリ・属性タグ・ムードタグ）
- いいね機能（楽観的UI更新）
- プロフィール編集（アバター画像アップロード）
- スポット編集・削除（投稿者本人のみ）
- ユーザー認証（メールアドレス＋パスワード）

---

## 技術スタック

| レイヤー | 技術 |
|----------|------|
| フロントエンド | Next.js 16 (App Router), Apollo Client, Tailwind CSS |
| バックエンド | NestJS, Apollo Server (GraphQL Code First), Prisma |
| データベース | PostgreSQL (Supabase) |
| 認証 | Supabase Auth (JWT) |
| ストレージ | Supabase Storage |
| ホスティング | Vercel (Frontend), Railway (Backend) |
| 言語 | TypeScript (strict mode) |

---

## アーキテクチャ

```
[ブラウザ]
    │
    │  GraphQL (Apollo Client)
    ▼
[Next.js / Vercel]          ←── Supabase Auth (JWT発行)
    │                              Supabase Storage (画像直接アップロード)
    │  GraphQL Query / Mutation
    ▼
[NestJS / Railway]
    │  JWT検証 (Guard)
    │
    │  Prisma
    ▼
[PostgreSQL / Supabase]
```

- 認証はSupabase Authに完全委譲。バックエンドはJWT検証のみ。
- 画像アップロードはフロントエンドからSupabase Storageへ直接送信。バックエンドを経由しない。
- GraphQLはCode Firstアプローチ（`schema.gql`自動生成）。
- N+1問題はDataLoaderでバッチ処理。
- ページネーションはCursor-basedのみ使用。

---

## ディレクトリ構成

```
spotee/
├── frontend/          # Next.js 16 (App Router)
│   └── src/
│       ├── app/       # ページ (App Router)
│       ├── components/
│       ├── graphql/   # クエリ・ミューテーション定義（generated/ は codegen の出力）
│       ├── hooks/     # useAuth 等
│       └── lib/       # Apollo Client, Supabase クライアント
├── backend/           # NestJS + GraphQL + Prisma
│   ├── src/
│   │   ├── spot/
│   │   ├── user/
│   │   ├── like/
│   │   ├── follow/
│   │   ├── bookmark/  # 保存フォルダ
│   │   ├── category/  # カテゴリ・タグ
│   │   ├── auth/      # JWT Guard
│   │   └── common/    # Connection・入力検証・GraphQL の保護
│   ├── prisma/
│   │   ├── schema.prisma
│   │   ├── migrations/
│   │   └── seed.ts
│   └── scripts/       # 開発用コマンドの補助
├── infra/
│   ├── dev/           # 開発用 DB（docker compose）
│   └── bench/         # 性能計測用 DB
└── package.json       # npm workspaces・開発用コマンド
```

---

## 開発環境のセットアップ

### 前提条件

- Node.js 22 以上（CI・本番の Docker と同じ）
- Docker（開発用の PostgreSQL を立てる）
- Supabase プロジェクト（認証・画像の保存に使う。開発中の DB には使わない）

### 初回だけ

```bash
git clone https://github.com/Jo042/spotee.git
cd spotee
npm install

# 環境変数を用意する（下の「環境変数」）

npm run db:up             # 開発用 DB（Docker の PostgreSQL 17、localhost:5434）を起動
npm run db:migrate        # スキーマを適用
npm run db:seed           # マスタ（カテゴリ・属性タグ・ムードタグ）
npm run db:seed:sample    # 画面確認用のサンプル（ユーザー5人・スポット60件）。任意
```

### 環境変数

**frontend/.env.local**

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_API_URL=http://localhost:4000/graphql
```

**backend/.env**

```env
DATABASE_URL=postgresql://postgres:dev@localhost:5434/postgres
DIRECT_URL=postgresql://postgres:dev@localhost:5434/postgres
SUPABASE_URL=your_supabase_url
```

開発中の DB はローカルの Docker に向ける。**本番（Supabase）の DB に向けて `prisma migrate dev` を実行しない**（差分があると DB のリセット＝全データ削除を提案する）。`npm run db:migrate` と `db:seed` / `db:seed:sample` は、接続先が `localhost` 以外だと実行せずに止まる。

---

## 普段使うコマンド

すべてリポジトリのルートで実行する。

### 起動

| コマンド | 内容 |
|---|---|
| `npm run dev` | 開発用 DB を起動し、バックエンド（localhost:4000）とフロントエンド（localhost:3000）を同時に起動する。Ctrl+C で両方止まる |
| `npm run dev:backend` | バックエンドだけ起動 |
| `npm run dev:frontend` | フロントエンドだけ起動 |

### データベース

| コマンド | 内容 |
|---|---|
| `npm run db:up` / `npm run db:stop` | 開発用 DB の起動・停止（停止してもデータは残る） |
| `npm run db:migrate -- --name <名前>` | `schema.prisma` の変更からマイグレーションを作り、開発用 DB に適用する |
| `npm run db:status` | マイグレーションの適用状況を見る（読み取りのみ） |
| `npm run db:seed` | マスタデータを入れる |
| `npm run db:seed:sample` | 画面確認用のサンプルデータを入れる |
| `npm run db:studio` | DB の中身をブラウザで見る（Prisma Studio） |

### GraphQL の型

| コマンド | 内容 |
|---|---|
| `npm run codegen` | フロントエンドの GraphQL の型を生成する |

`codegen` は `backend/src/schema.gql` を読む。このファイルは**バックエンドの起動時に自動で作り直される**（Code First）。バックエンドのリゾルバーや型を変えたら、バックエンドを起動してから `codegen` を実行する（`npm run dev` 中なら保存するたびに作り直される）。

### 品質チェック

| コマンド | 内容 |
|---|---|
| `npm run lint` | フロントエンド・バックエンドの lint |
| `npm run test` | フロントエンド（Vitest）・バックエンド（Jest）の単体テスト。DB は使わない |
| `npm run test:integration` | バックエンドの統合テスト。開発用 DB と同じコンテナの `spotee_test` に対して、本物の GraphQL API を呼ぶ（先に `npm run db:up`） |
| `npm run build` | 両方のビルド（`build:frontend` / `build:backend` で片方だけ） |

統合テストは `backend/test/integration/` にある。テストのたびに `spotee_test` の全テーブルを空にするため、接続先がローカルで DB 名が `_test` で終わるとき以外は始まる前に止まる（接続先は `TEST_DATABASE_URL` で変えられる）。ログインは、テスト用の鍵で署名した JWT で行う。

---

## デプロイ

| 対象 | サービス | 備考 |
|---|---|---|
| フロントエンド | Vercel | main へのマージで自動デプロイ |
| バックエンド | Railway | main へのマージで自動デプロイ（`backend/Dockerfile`） |
| DB・認証・画像 | Supabase | |

### 本番へのマイグレーションの適用

Railway のデプロイ時に `npx prisma migrate deploy` が自動で実行される（`backend/railway.json` の `preDeployCommand`）。未適用のマイグレーションだけを順に適用し、失敗した場合は新しい版に切り替わらない。

Railway には次の2つの接続先が必要。

| 変数 | 接続先 | 用途 |
|---|---|---|
| `DATABASE_URL` | トランザクションプーラー（`…pooler.supabase.com:6543`、末尾に `?pgbouncer=true`） | アプリの通常のクエリ |
| `DIRECT_URL` | セッションプーラー（`…pooler.supabase.com:5432`） | マイグレーション |

`DIRECT_URL` に Supabase の直接接続（`db.<プロジェクト>.supabase.co:5432`）は使えない。直接接続は IPv6 専用で、Railway からは届かない（`P1001: Can't reach database server`）。セッションプーラーの URL は、`DATABASE_URL` のポートを 5432 にし、`?pgbouncer=true` を外したものになる。

CI では `schema.prisma` とマイグレーションのファイルが一致しているかを検査している。`schema.prisma` を変えたら `npm run db:migrate -- --name <名前>` でマイグレーションを作ってからコミットする。

---

## 画面構成

| パス | 説明 |
|------|------|
| `/` | トップページ（人気スポット一覧・検索） |
| `/spots` | スポット一覧（フィルター・ソート・無限スクロール） |
| `/spots/new` | スポット投稿 |
| `/spots/[id]` | スポット詳細 |
| `/spots/[id]/edit` | スポット編集（投稿者のみ） |
| `/mypage` | マイページ |
| `/mypage/edit` | プロフィール編集 |
| `/auth/login` | ログイン・新規登録 |
