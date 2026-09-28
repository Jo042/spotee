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
| フロントエンド | Next.js 14 (App Router), Apollo Client, Tailwind CSS |
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
├── frontend/          # Next.js 14 (App Router)
│   └── src/
│       ├── app/       # ページ (App Router)
│       ├── components/
│       ├── graphql/   # クエリ・ミューテーション定義
│       ├── hooks/     # useAuth 等
│       └── lib/       # Apollo Client, Supabase クライアント
├── backend/           # NestJS + GraphQL + Prisma
│   ├── src/
│   │   ├── spot/
│   │   ├── user/
│   │   ├── like/
│   │   ├── tag/
│   │   ├── auth/      # JWT Guard
│   │   └── prisma/    # PrismaService
│   └── prisma/
│       └── schema.prisma
└── package.json       # npm workspaces
```

---

## 開発環境のセットアップ

### 前提条件

- Node.js 20+
- Docker（開発用の PostgreSQL を立てる）
- Supabase プロジェクト（認証・画像の保存に使う。DB は使わない）

### インストール

```bash
git clone https://github.com/Jo042/spotee.git
cd spotee
npm install
```

### 環境変数

**frontend/.env.local**

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_GRAPHQL_URL=http://localhost:4000/graphql
```

**backend/.env**

```env
DATABASE_URL=postgresql://postgres:dev@localhost:5434/postgres
DIRECT_URL=postgresql://postgres:dev@localhost:5434/postgres
SUPABASE_URL=your_supabase_url
```

開発中の DB はローカルの Docker に向ける。**本番（Supabase）の DB に向けて `prisma migrate dev` を実行しない。** `migrate dev` は差分があると DB のリセット（全データ削除）を提案する。

### データベースのセットアップ

```bash
docker compose -f infra/dev/docker-compose.yml up -d   # localhost:5434 に PostgreSQL 17

cd backend
npx prisma migrate dev                              # スキーマ適用
npx prisma db seed                                  # マスタ（カテゴリ・属性タグ・ムードタグ）
USER_COUNT=5 SPOT_COUNT=60 npm run seed:loadtest    # 画面確認用のサンプルデータ（任意）
```

### 本番へのマイグレーションの適用

Railway のデプロイ時に `npx prisma migrate deploy` が自動で実行される（`backend/railway.json` の `preDeployCommand`）。未適用のマイグレーションだけを順に適用し、失敗した場合は新しい版に切り替わらない。Railway の環境変数に `DATABASE_URL` と `DIRECT_URL`（プーラーを経由しない直接接続）が必要。

CI では `schema.prisma` とマイグレーションのファイルが一致しているかを検査している。`schema.prisma` を変えたら `npx prisma migrate dev --name <name>` でマイグレーションを作ってからコミットする。

### 開発サーバーの起動

```bash
# フロントエンド (localhost:3000)
npm run dev:frontend

# バックエンド (localhost:4000)
npm run dev:backend
```

---

## 主要コマンド

```bash
# ビルド
npm run build:frontend
npm run build:backend

# Prisma
npx prisma migrate dev --name <name>   # マイグレーション作成・適用
npx prisma db seed                     # シードデータ投入
npx prisma studio                      # DB GUI
npx prisma generate                    # クライアント再生成

# GraphQL コード生成 (frontend/)
npm run codegen
```

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
