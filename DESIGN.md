---
version: beta
name: Spotee-design-system
description: |
  お気に入りの場所を写真とタグで共有する SNS ライクな Web アプリ、Spotee のデザインシステム。
  Spotee の差別化は「3層のタグ（カテゴリ・特徴・雰囲気）を組み合わせて探す」こと。
  その組み合わせを、トップの一番上で一文として読ませる「文章で探す」を、唯一の大胆な要素にする。
  それ以外の画面は静かに保つ。白と墨を基本に、アクセントは Spotee の青1色。
  強弱は文字の太さ・大きさ・色と下線で付け、枠・丸・ピルで囲んで目立たせない。
  写真が色を担い、書いた人の顔・名前・ひとことが親しみやすさを担う。

colors:
  primary-50: "#EFF3FF"
  primary-100: "#DEE8FF"
  primary-200: "#BDD1FF"
  primary-300: "#93B0FF"
  primary-400: "#6488FF"
  primary-500: "#3D65FA"
  primary-600: "#2748E0"
  primary-700: "#1B34B8"
  primary-800: "#142883"
  primary-900: "#0E1C5C"
  ink: "#101828"
  ink-muted: "#6A7282"
  line: "#E5E7EB"
  canvas: "#FFFFFF"
  surface: "#F9FAFB"
  accent: "{colors.primary-700}"
  accent-fill: "{colors.primary-600}"
  accent-fill-hover: "{colors.primary-700}"
  accent-soft: "{colors.primary-50}"
  accent-line: "{colors.primary-200}"
  focus-ring: "{colors.primary-300}"
  like: "#F43F5E"
  success: "#16A34A"
  error: "#DC2626"
  error-soft: "#FEF2F2"

typography:
  display:
    fontFamily: "var(--font-display)"
    fontSize: 28px
    fontWeight: 900
    lineHeight: 1.35
  ask-sentence:
    fontFamily: "var(--font-display)"
    fontSize: 26px
    fontWeight: 900
    lineHeight: 1.75
  heading-lg:
    fontFamily: "var(--font-display)"
    fontSize: 22px
    fontWeight: 700
    lineHeight: 1.45
  heading-md:
    fontFamily: "var(--font-display)"
    fontSize: 18px
    fontWeight: 700
    lineHeight: 1.5
  heading-sm:
    fontFamily: "var(--font-display)"
    fontSize: 15px
    fontWeight: 700
    lineHeight: 1.55
  body-md:
    fontFamily: "var(--font-noto-sans-jp)"
    fontSize: 15px
    fontWeight: 400
    lineHeight: 1.8
  body-sm:
    fontFamily: "var(--font-noto-sans-jp)"
    fontSize: 13px
    fontWeight: 400
    lineHeight: 1.65
  caption:
    fontFamily: "var(--font-noto-sans-jp)"
    fontSize: 12px
    fontWeight: 400
    lineHeight: 1.5
  button:
    fontFamily: "var(--font-noto-sans-jp)"
    fontSize: 14px
    fontWeight: 700
    lineHeight: 1

rounded:
  sm: 8px
  md: 12px
  lg: 20px
  full: 9999px

spacing:
  xxs: 4px
  xs: 8px
  sm: 12px
  md: 16px
  lg: 24px
  xl: 32px
  section: 48px

components:
  header:
    backgroundColor: "{colors.canvas}"
    border: "1px solid {colors.line}（下辺のみ）"
    height: 60px
  footer:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink-muted}"
    typography: "{typography.caption}"
  button-primary:
    backgroundColor: "{colors.accent-fill}"
    textColor: "{colors.canvas}"
    typography: "{typography.button}"
    rounded: "{rounded.full}"
    padding: 10px 18px
  button-primary-hover:
    backgroundColor: "{colors.accent-fill-hover}"
  button-secondary:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    border: "1px solid {colors.ink}"
    typography: "{typography.button}"
    rounded: "{rounded.full}"
  button-text:
    textColor: "{colors.accent}"
    textDecoration: underline
  text-input:
    backgroundColor: "{colors.canvas}"
    border: "1px solid {colors.line}"
    rounded: "{rounded.sm}"
    padding: 10px 14px
  text-input-focused:
    border: "1px solid {colors.accent}"
    ring: "1px {colors.accent}"
  search-field:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink-muted}"
    rounded: "{rounded.sm}"
    padding: 11px 14px
  ask-block:
    backgroundColor: "{colors.accent-soft}"
    rounded: "{rounded.lg}"
    padding: 22px 20px
  ask-word-selected:
    textColor: "{colors.accent}"
    underline: "2px solid {colors.accent}"
  ask-word-empty:
    textColor: "{colors.ink-muted}"
    underline: "2px dashed {colors.accent-line}"
  ask-connector:
    textColor: "{colors.accent}"
    fontSize: 0.72em
  mode-switch:
    backgroundColor: "{colors.canvas}"
    rounded: "{rounded.full}"
  mode-switch-active:
    backgroundColor: "{colors.accent-fill}"
    textColor: "{colors.canvas}"
  conditions-sheet:
    backgroundColor: "{colors.canvas}"
    rounded: "{rounded.lg}（上の2角のみ）"
    shadow: "0 -6px 24px rgb(16 24 40 / 0.12)"
  spot-row:
    border: "1px solid {colors.line}（下辺のみ）"
    padding: 14px 0
  spot-card:
    imageRounded: "{rounded.md}"
    imageAspectRatio: 16 / 9
  collection-card:
    imageRounded: "{rounded.md}"
    imageAspectRatio: 16 / 9
  tag-link:
    textColor: "{colors.accent}"
    underline: "1px solid {colors.accent-line}"
  avatar:
    rounded: "{rounded.full}"
    sizes: 20px / 28px / 36px / 80px
  like-active:
    iconFill: "{colors.like}"
    textColor: "{colors.like}"
  save-active:
    iconFill: "{colors.ink}"
---

## Overview

Spotee は、お気に入りの場所を写真とタグで共有する SNS ライクな Web アプリです。差別化は、**3層のタグ（カテゴリ・特徴・雰囲気）を組み合わせて探せること**です。このデザインシステムは、その差別化を画面の顔にし、それ以外を静かに保つことを目的にしています。

考え方は次の5つです。

1. **大胆さは1か所だけ**: トップの一番上の「文章で探す」（3層のタグを一文にした検索）だけを大きく見せる。ほかの画面と部品は静かにし、写真と文字で情報を並べる。
2. **強弱は文字で付ける**: 文字の太さ・大きさ・色と下線で強弱を付ける。目立たせたいものを、枠・丸・ピルで囲まない。囲むと、どの画面も同じ「よくあるアプリ」に見える。
3. **見た目の印は、意味ごとに1つ**: 下線＝押せる言葉、点線＝まだ選んでいない言葉。同じ印を別の意味に使わない。
4. **情報を切らない**: タイトルや名前は2〜3行まで全部見せる。格子をそろえるために1行で切らない。
5. **親しみやすさは「人」から出す**: 書いた人の顔・名前・ひとことを必ず添える。記号の飾り（シール、色の濃いバッジ、絵文字）で親しみやすさを足さない。

## Colors

白と墨を基本にし、アクセントは Spotee の青1色です。色は写真に任せ、画面の部品は色を使いすぎません。コードでは、墨と灰に Tailwind の `gray-*` を、青に `primary-*` を使います。

| 役割 | トークン | Tailwind | 使う場所 |
|---|---|---|---|
| 文字 | `ink` | `gray-900` | 見出し・本文 |
| 補足の文字 | `ink-muted` | `gray-500` | 住所・日付・件数の説明・層の名前 |
| 線 | `line` | `gray-200` | 区切り線・入力欄の枠 |
| 地 | `canvas` | `white` | 画面の地 |
| 面 | `surface` | `gray-50` | 検索欄・フッター・少しだけ面を分けたいところ |
| 押せる文字・下線・選択中 | `accent` | `primary-700` | 選んだ言葉・タグのリンク・文字のボタン・選択中の印 |
| 主要なボタンの塗り | `accent-fill` | `primary-600`（押したとき `primary-700`） | 「◯件を見る」「投稿する」など、画面に1つの主要な操作 |
| 文章で探すの面 | `accent-soft` | `primary-50` | 「文章で探す」の背景だけ |
| 控えめな下線 | `accent-line` | `primary-200` | タグのリンクの下線、まだ選んでいない言葉の点線 |
| フォーカスの輪 | `focus-ring` | `primary-300` | キーボードで選んでいる要素 |
| いいね | `like` | `rose-500` | いいねを押した後だけ |
| 成功・エラー | `success` / `error` | `green-600` / `red-600` | お知らせ・入力の誤りなど、意味を伝えるときだけ |

- 青の生の値を画面に直接書かない。必ず上の役割の名前（またはその Tailwind のクラス）で使う。
- `primary-500` 以下は、本文の大きさの文字に使わない（白地とのコントラストが足りない）。
- 3層のタグを色で分けない（カテゴリ・特徴・雰囲気の違いは、層の名前の文字で示す）。

## Typography

見出しは **Zen Kaku Gothic New**、本文・ボタン・入力欄は **Noto Sans JP** です。どちらも Google Fonts で、会社の書体（特定のサービスを連想させる書体）は使いません。

| トークン | 書体 | 大きさ | 使う場所 |
|---|---|---|---|
| `display` | Zen Kaku | 28px（PC 34px）・900 | 画面のタイトル（特集のタイトルなど） |
| `ask-sentence` | Zen Kaku | 26px（PC 44px）・900 | 文章で探すの一文だけ |
| `heading-lg` | Zen Kaku | 22px・700 | 画面の見出し（「探す」など） |
| `heading-md` | Zen Kaku | 18px・700 | セクションの見出し（「いま読まれている特集」など） |
| `heading-sm` | Zen Kaku | 15px・700 | カードと行のタイトル |
| `body-md` | Noto Sans JP | 15px・400 | 本文・説明・書いた人のひとこと |
| `body-sm` | Noto Sans JP | 13px・400 | 説明の書き出し・補足 |
| `caption` | Noto Sans JP | 12px・400 | 住所・日付・件数・層の名前 |
| `button` | Noto Sans JP | 14px・700 | ボタン |

- 強弱は太さと大きさで付ける。Zen Kaku Gothic New は 700 と 900 だけを読み込む（800 は無い）。本文は 400 と 700。色を変えて強調するのは、押せる言葉（`accent`）だけ。
- 見出しには `text-wrap: balance` を付け、行の終わりが1〜2文字だけにならないようにする。
- 文字を純粋な黒（#000）にしない。`ink` を使う。

## Layout & Spacing

- 余白は 4px を基準にした段階（`spacing`）だけを使う。セクションの間は `section`（48px）。
- 画面の幅:
  - トップ（PC）: 最大 1160px。左に主な列、右に 300px の脇の列（ランキングなど）
  - スポット一覧（PC）: 最大 1240px。写真のカードを4列
  - 読み物（特集の詳細、PC）: 本文の列は最大 720px
  - スマホ: 左右 16px の余白
- 一覧の格子: スマホ2列 → PC 4列（スポット一覧）。トップのスポットは格子ではなく行で並べる。

## Shape & Elevation

- 角丸は4段階だけ: 入力欄・小さな面は `sm`（8px）、写真は `md`（12px）、文章で探すとシートは `lg`（20px）、ボタン・切り替え・アバターは `full`。
- `full`（ピル）はボタンと切り替えの形にだけ使う。ラベルやタグをピルで囲まない。
- 影は浮いているものにだけ付ける（下から出るシート、メニュー）。カード・行・ボタンには影を付けない。区切りは線と余白で作る。

## Components

### ヘッダー（`header`）

- 左にロゴ（「spotee」、Zen Kaku 900）、PC はその右に「探す・特集」のナビ。
- PC の右端は、ログインしていれば主要なボタン「投稿する」とアバター、していなければ「ログイン」。
- **ログアウトはナビに並べず、アバターを押して出るメニュー（マイページ・プロフィールを編集・ログアウト）にしまう**（普段使わない操作のため）。メニューは、もう一度押す・外側を押す・Esc キー・ページの移動で閉じる。
- スマホは右端にメニューのボタンを置き、開くとナビとアカウントの操作が並ぶ。
- 選択中のナビは、太さ（700）と下辺の 2px の `accent` の線で示す。

### フッター（`footer`）

すべての画面の一番下に置く。`surface` の面に、ロゴとひとこと、「探す」「特集」のリンクを並べる。利用規約・プライバシーポリシーなどのリンクは、そのページができたときに足す（無いページへのリンクを置かない）。

### ボタン

- **主要なボタン**（`button-primary`）: 画面に1つ。`accent-fill` の塗りに白の文字、`full` の角丸。
- **二番目のボタン**（`button-secondary`）: 白地に墨の 1px の枠（「フォロー」「キャンセル」など）。
- **文字のボタン**（`button-text`）: `accent` の文字に下線（「キーワードで探す」「選んだ条件をすべて見る」など）。
- アイコンだけのボタンには、何をするか分かる `aria-label` を付ける。
- 押したときは `active:scale-[0.98]` 程度の小さな動きだけ。

### 入力欄

- `text-input`: 白地に `line` の枠、`sm` の角丸。フォーカスは枠を `accent` にし、太さで示す（ぼかした光の輪は使わない）。
- 文字数に上限がある欄は、ラベルの右端に `12/60` のように残りを `caption` で出す。
- エラーは入力欄の下に、`error` の文字で理由と直し方を書く。

### 文章で探す（`ask-block`）

トップの一番上に置く、Spotee の顔になる部品です。3層のタグを、そのまま一文として読ませます。

```
[雰囲気] 、 [特徴] [カテゴリ] を探す
雨の日でも過ごせる、Wi-Fiのある カフェを探す
```

- 面は `accent-soft`、角丸は `lg`。一文は `ask-sentence`。
- **選んだ言葉**（`ask-word-selected`）: `accent` の文字と 2px の下線。押すと、その層の選択肢が出て選び直せる。外すのもそこから。
- **まだ選んでいない言葉**（`ask-word-empty`）: 「どんな雰囲気の」「どんな特徴の」「場所」を、`ink-muted` の文字と点線の下線で出す。選ばなくても探せる（何も選ばなければ「すべてのスポット」）。
- 言葉の上に、層の名前（「雰囲気」「特徴」「カテゴリ」）を `caption` で小さく添える。
- 一文の下に、今の条件に合う写真を4枚（PC は6枚）と、主要なボタン「◯件を見る →」、文字のボタン「キーワードで探す」。

**複数選んだとき**

- 同じ層で2つ選んだら、言葉の間をつなぎの言葉（`ask-connector`）でつなぐ。「か」＝どれか（OR）、「かつ」＝すべて（AND）。つなぎの言葉はただの文字で、押せない。
- 3つ以上選んだ層は「雨の日でも過ごせる など4つ」のように、最初の言葉と「など◯つ」を同じ下線の中に入れて1語にまとめる。
- カテゴリのつなぎはいつも「か」（1つのスポットのカテゴリは1つだけなので）。
- 一文の下に「すべて当てはまる／どれか当てはまる」の切り替え（`mode-switch`）と、結果を言葉と件数で出す（「選んだ条件がすべて当てはまる場所だけ 4件」）。切り替えは、この1か所だけ。
- 何か選んでいるときは、文字のボタン「選んだ条件をすべて見る（10）」を出す。

**検索の仕組みとの対応**（`backend/src/spot/spot-filter.util.ts`）

- 層と層の間（カテゴリ・特徴・雰囲気・キーワード）はいつも AND。一文の「、」と言葉の並びがこれにあたる。
- カテゴリの中はいつも OR。
- 特徴の中と雰囲気の中は `tagSearchMode`（AND / OR）。スイッチは1つで、両方にまとめて効く。

**0件のとき**: 「すべて」で0件になったら、「条件が多くて、すべてが当てはまる場所はまだありません。『どれか当てはまる』にすると 27件 あります。」と、切り替えたときの件数と、ワンタップで切り替えるボタンを出す。

### 条件の一覧のシート（`conditions-sheet`）

「選んだ条件をすべて見る」で、下から出る（PC は中央のダイアログ）。

- 見出し「選んだ条件 10」と、文字のボタン「すべて外す」。
- 雰囲気・特徴・カテゴリの層ごとに、選んだ言葉を並べ、それぞれ × で外せる。この × は、外す操作のボタンとして `accent-soft` の面に置いてよい（一文の中には × を出さない）。
- 「すべて当てはまる／どれか当てはまる」の切り替えと、主要なボタン「◯件を見る」。

### スポットの行（`spot-row`、トップ）

文字が主役の一覧です。左に文字、右に写真（16:9、幅 116px／PC 200px）。

- タイトル（`heading-sm`、切らない）→ 説明の書き出し（`body-sm`、2行まで）→ 場所とカテゴリ（ピンのアイコン＋`caption`）→ 書いた人（アバター 20px＋名前）といいねの数。
- 行の間は `line` の下線だけ。枠や影は付けない。

### 写真のカード（`spot-card`、スポット一覧）

写真が主役のカードです。

- 写真は 16:9、角丸 `md`。右上に保存のアイコン（20px）を重ねる（白、うっすら影）。
- 写真の下に、タイトル（`heading-sm`、2行まで）→ 場所とカテゴリ（`caption`）→ 書いた人といいねの数。保存の数は今の API では取れないので、トップの「よく保存されている場所」で保存の数を数えるときに、どちらを出すか見直す。
- 枠と影は付けない。カテゴリを写真の上のバッジにしない。

### 特集のカード（`collection-card`）

- 写真（カバー画像、無ければ先頭のスポットの1枚目）は 16:9、角丸 `md`。
- 写真の下に、タイトル（`heading-sm`、3行まで）→ 書いた人と「◯か所」。
- 「特集」のラベルを写真の上に貼らない。必要なら写真の下に `caption` の文字で「特集 ・ 5か所」と書く。

### タグ（`tag-link`）

スポットの詳細などでタグを見せるときは、層の名前ごとに文字で並べる。

```
カテゴリ　カフェ
雰囲気　　雨の日でも過ごせる ・ 一人でゆっくりできる
特徴　　　Wi-Fiあり ・ 電源あり ・ 禁煙
```

- 層の名前は `caption` の `ink-muted`、言葉は `accent` の文字に `accent-line` の下線。
- 言葉を押すと、その言葉を選んだ「文章で探す」の検索に移る。
- チップやピルで囲まない。層を色で分けない。

### いいね・保存

- 詳細ページ: アイコン（20px）と文字。「保存」「いいね 128」。押した後は、いいねは `like` で塗りつぶして文字も `like`、保存は `ink` で塗りつぶして「保存済み」。
- カード・行の中: アイコン（16px）と数字だけ、`caption` の大きさ。
- どちらも枠・背景を付けない。押したときは、アイコンを少しだけ弾ませる（`prefers-reduced-motion` のときは動かさない）。

### 書いた人とアバター（`avatar`）

- アバターは円。大きさは 20px（行・カード）、28px（ヘッダー）、36px（特集の書いた人）、80px（プロフィール）。
- 画像が無い人は、名前の最初の1文字を `accent-soft` の円に `accent` の文字で出す（灰色の人型アイコンにしない）。
- 書いた人のひとこと（特集の添え書きなど）は、アバター 22px と本文（`body-md`）を並べて出す。吹き出しや引用の枠で囲まない。

### 空のとき・読み込み中・エラーのとき

- **空**: 何が無いのかと、次にできることを1つ出す（例:「まだ特集がありません」＋主要なボタン「特集を作る」）。アイコンを丸い面に入れて飾らない。
- **読み込み中**: 実際の形と同じ大きさの灰色の枠（`surface`）を出し、読み込み後に中身がずれないようにする。
- **エラー**: 何が起きたかと、どうすればよいかを日本語で書く。システムからの英語のメッセージをそのまま出さない。

## Screens

画面ごとの細かい形は、それぞれの画面を直すときに決め、この章に足していく。

- **トップ**: 文章で探す → いま読まれている特集（カードの横の列、PC は3列）→ よく保存されている場所（スポットの行）。PC は右の脇の列に「今週よく読まれた特集」（本当の順位なので番号を付ける）。
- **スポット一覧**: 上に今の条件の一文（「雨の日でも過ごせる、Wi-Fiのある カフェ」と「言葉を変える」）、その下に件数と並び順と「絞り込み」のボタン、写真のカードの格子。カテゴリのアイコンの列は置かない。
- **スポット詳細**: 写真 → タイトル・場所 → 保存・いいね → 説明 → タグ（文字で並べる）→ 基本情報 → 書いた人。スマホでは説明を基本情報より先に出す。
- **特集の詳細**: 読み物として、最大 720px の列。タイトル → 書いた人 → カバー画像 → 説明 → スポットを順番どおりに（「1か所目」と見出し、写真、書いた人のひとこと）。
- **投稿・特集の作成と編集**: 全項目を同じ重さで並べず、写真とタイトルを先頭に。タグの欄の名前は「特徴」「雰囲気」。
- **マイページ・プロフィール**: 統計（投稿・いいね・フォロワー・フォロー中）はスマホでも1行で読めるように並べる。

## 言葉

- タグの3つの層は、画面ではいつも「**カテゴリ・特徴・雰囲気**」と呼ぶ。「属性」「ムード」のようなシステムの言葉を画面に出さない。
- ボタンは、押すと何が起きるかを書く（「18件を見る」「保存」「特集を作る」）。押した後は、何が起きたかを伝える（「保存しました」）。
- エラーは、何が起きたかと、どうすれば直るかを書く。謝罪の言葉で埋めない。
- 見出しの補足に、見出しの言い換えを書かない。書くなら、そのセクションの中身が分かる具体的な一文にする。
- 「クリック」「タップ」のような端末によって違う言葉を避け、「押す」「選ぶ」を使う。

## Do's and Don'ts

### Do

- 大胆さは「文章で探す」の1か所に集め、ほかの画面は静かにする。
- 強弱は文字の太さ・大きさ・色と下線で付ける。
- 下線＝押せる言葉、点線＝まだ選んでいない言葉、という印の意味を守る。
- タイトルと名前を切らずに見せる。
- 書いた人の顔・名前・ひとことを添える。
- 色は役割の名前（トークン）で使う。

### Don't

- 目立たせたいものを、枠・丸・ピルで囲まない（「特集」のラベル、カテゴリのバッジ、色の濃いバッジなど）。
- 小さな文字をラベルのように浮かせない。言葉として文の中に組み込む。
- 3層のタグを色で分けない。
- 意味の無い番号（01・02・03）を付けない。番号は本当に順番があるもの（特集の中の順番・ランキング）にだけ使う。
- 線のアイコンを薄い色の四角や丸に入れて並べない。
- 絵文字やシールのような記号で、親しみやすさを足さない。
- カードに影を付けない。影は浮いているもの（シート・メニュー）にだけ。

## コードとの差分（移行メモ）

このデザインシステムに合わせるため、土台の実装で次を直す。

- 書体: Zen Kaku Gothic New を `next/font/google` で読み込み、`--font-display` として `@theme` に足した。`h1`〜`h4` は自動でこの書体になる（済）。
- ボタン: `globals.css` に `btn-primary`・`btn-secondary`・`btn-text` を定義した（済）。今ある画面のボタンは、それぞれの画面を作り直すときに置き換える。
- ダークモード: OS がダークモードのとき文字の色だけが明るくなり、白地の上で読めなくなる設定を外した（済）。
- 色: `primary-*` は今の値のまま使う。役割ごとの使い分け（押せる文字は `primary-700`、主要なボタンは `primary-600`）にそろえる。
- カード: 写真のカードと特集のカードから枠・影・写真の上のバッジを外し、タイトルを2〜3行まで見せる（済）。
- いいね・保存: カードはアイコンと数字、詳細はアイコンと文字にし、ピルの枠を外した（済）。
- タグ: 特徴（ティール）・雰囲気（紫）の色分けをやめる（`FilterPanel.tsx`・`SpotForm.tsx`・`SpotDetail.tsx` など）。画面の呼び名を「特徴」「雰囲気」にそろえる。
- ヘッダー: ログアウトをアバターのメニューへ移した（済）。
- フッター: すべての画面に足した（済）。
- アバター: 共通の `Avatar` 部品にまとめ、画像が無い人は名前の最初の1文字を出す（済）。
- エラーの表示: 認証のエラーなど、英語のメッセージをそのまま出している箇所を日本語にする。

## Known Gaps

- 一文の言葉を押したときに出る選択肢の画面（タグが増えたときの並べ方・検索）は、トップを直すときに決める。
- 特徴と雰囲気で別々に「すべて／どれか」を選べるようにするには、バックエンドの変更が要る。今は1つのスイッチで両方にまとめて効く。
- 写真は投稿時に 16:9 で切り抜いている。縦長の写真に対応するかは、別に検討する。
- ダークモードは対象外。
