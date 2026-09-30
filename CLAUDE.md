# CLAUDE.md

Spotee で Claude Code と開発するときの共通の前提。手順はスキル（`.claude/skills/`）に、個人用の設定は `CLAUDE.local.md`（git 管理外）に分けている。

## プロダクト

**Spotee（スポッティー）**: お気に入りの場所を共有する SNS ライクな Web アプリ。3層のタグ（カテゴリ・属性・ムード）を AND / OR で組み合わせる検索と、SNS との相互導線が差別化のポイント。

| 層 | 技術 | 置き場所 |
|---|---|---|
| フロントエンド | Next.js 16（App Router）・Apollo Client・Tailwind CSS v4 | `frontend/`（Vercel） |
| バックエンド | NestJS・GraphQL（Code First）・Prisma | `backend/`（Railway） |
| DB・認証・画像 | PostgreSQL・Supabase Auth・Supabase Storage | Supabase |

## コマンド

すべてリポジトリのルートで実行する。一覧は README の「普段使うコマンド」。

```bash
npm run dev                        # 開発用 DB + backend(:4000) + frontend(:3000)
npm run db:migrate -- --name <n>   # マイグレーションの作成と適用（localhost 以外の DB では止まる）
npm run codegen                    # フロントの GraphQL の型。先にバックエンドを起動して schema.gql を更新しておく
npm run lint && npm run test && npm run build
```

- 開発用の DB はローカルの Docker（localhost:5434）。**本番の DB に `prisma migrate dev` を実行しない**（差分があるとリセットを提案する）。本番へは Railway の pre-deploy で `migrate deploy` が自動で走る
- `backend/src/schema.gql` はバックエンドの起動時に自動生成される。手で編集しない

## 設計上の決定事項

- **認証**: Supabase Auth に委譲し、NestJS は JWT の検証だけを行う。パスワードに関わる処理をバックエンドに書かない
- **認可**: 持ち主の確認は取得条件に含める（`findFirst({ where: { id, userId } })`）。他人のリソースは「見つかりません」で返し、存在を明かさない
- **GraphQL**: Code First。リレーションの取得は必ず DataLoader でまとめる（N+1 を作らない）
- **ページネーション**: カーソル方式のみ。並び順とカーソル条件には必ず `id` のタイブレークを含める。Connection は `common/connection.util.ts` の `buildConnection` で組み立てる
- **入力検証**: InputType と class-validator。GraphQL の引数をスカラーで直接受けると検証を素通りするので、InputType にまとめる
- **エラー**: 利用者に見せる文言は `BAD_REQUEST`（入力検証）だけ。フロントは `getUserFacingErrorMessage` を通す
- **画像**: フロントから Supabase Storage へ直接アップロードする。URL は自分の Storage のバケットだけを許可する
- **デザイン**: UI は `DESIGN.md` に従う

## 実装の規約

- TypeScript は strict。`any` を使わない
- コメントは必要最小限。コードから読み取れることは書かない
- React: `useEffect` の中で同期的に `setState` しない（ESLint の `react-hooks/set-state-in-effect`）。描画中に前回の値と比べて調整するか、イベントの処理の中で更新する
- Tailwind v4: 色の追加は `frontend/src/app/globals.css` の `@theme`。グレーは `gray-*` で揃える
- フォームの送信は `React.SubmitEvent<HTMLFormElement>`（`FormEvent` は非推奨）
- 変更したら、型・lint・テストに加えて、画面の変更は実際のブラウザで、API の変更は実際のサーバーで確かめる

## 開発の流れ

実装の前に「何を・なぜ作るか」を人が説明できる状態にし、作業中に見つかった問題を埋もれさせない。

```
/start-issue <番号>   着手: Issue と方針を読み、用語から解説し、実装方針を人が説明して合意する
      ↓ 実装
/finish-issue          仕上げ: 検証 → コミット → 簡潔な PR → 見つかった問題の起票 → 学習記録
      ↓ マージ
/end-session           終わり: 起票漏れの点検と計画の更新
```

- Issue・PR は `.github/` のテンプレートに沿って書く。Issue は PR の `Closes #番号` で閉じる
- **作業中に見つけた問題は、PR 本文に書いて終わりにせず Issue に起票する**（ラベル `found-during`）。PR 本文は埋もれる
- PR 本文は「何を・なぜ・どう確かめたか」に絞る

## ハーネスの保守

この CLAUDE.md・スキル・テンプレートは、実態から遅れないよう保守し続ける。

- セッション開始時にフック（`.claude/scripts/harness-check.mjs`）が点検し、問題があれば最初の応答で報告して直し方を提案する
- 実装で古くなった記述（CLAUDE.md・README・スキル・DESIGN.md）は、その変更と同じ PR で直す
- 同じ訂正を2回受けた・手順が合わなかった・指示が曖昧だった、と気づいたら改善を提案する
- 30日ごとに `/review-harness` で全体を見直す
- **CLAUDE.md とスキルは黙って書き換えない。** 差分つきで提案し、承認を得てから反映する

## Git

- コミットは Conventional Commits の1行: `<type>(<scope>): <日本語の説明>`
  - type: `feat` / `fix` / `refactor` / `test` / `docs` / `chore` / `style`
  - scope: `frontend` / `backend` / `prisma` / `docs`（複数にまたがるときは省略）
- 1つのコミットに1つの論理的な変更
- main から作業ブランチを切る。PR を積み重ねたときは、下の PR をマージするたびにそのブランチを削除する（残すと次の PR のマージ先が main に切り替わらない）
