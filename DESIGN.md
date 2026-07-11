---
version: alpha
name: Spotee-design-system
description: |
  お気に入りの場所を写真とタグで共有するSNSライクなWebアプリ、Spoteeのデザインシステム。
  Airbnbの写真主体カード＋フィルターUIを骨格としつつ、単色アクセントは独自の
  コバルトブルー（Spotee Blue）に置き換え、Spoteeの最大の差別化機能である
  「3層タグ構造（カテゴリ／属性タグ／ムードタグ）× AND/OR検索」を
  3系統の色相（ブルー／ティール／パープル）で視覚的に表現する。
  マーケティングLPではなく実務アプリのデザインシステムのため、
  巨大なヒーローセクションではなく、カード・フィルター・フォーム・バッジといった
  プロダクトUIコンポーネントを中心に定義する。
  書体はNoto Sans JP（既存実装を踏襲）。全年代のターゲット（学生〜子育て世代〜アクティブシニア）に
  馴染みつつ、SNS世代にも「おしゃれ」と感じてもらえるよう、色数を絞ったシンプルな構成にする。

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
  attribute-bg: "#ECFDF5"
  attribute-text: "#047857"
  attribute-border: "#A7F3D0"
  mood-bg: "#FAF5FF"
  mood-text: "#7E22CE"
  mood-border: "#E9D5FF"
  like: "#F43F5E"
  like-soft: "#FFE4E6"
  success: "#16A34A"
  warning: "#D97706"
  error: "#DC2626"
  canvas: "#FFFFFF"
  surface: "#F7F7F7"
  surface-strong: "#F0F0F0"
  hairline: "#E5E5E5"
  hairline-soft: "#EFEFEF"
  ink: "#171717"
  body: "#404040"
  muted: "#6B6B6B"
  placeholder: "#9C9C9C"
  on-primary: "#FFFFFF"

typography:
  display:
    fontFamily: "var(--font-noto-sans-jp)"
    fontSize: 28px
    fontWeight: 700
    lineHeight: 1.4
  heading-lg:
    fontFamily: "var(--font-noto-sans-jp)"
    fontSize: 22px
    fontWeight: 700
    lineHeight: 1.4
  heading-md:
    fontFamily: "var(--font-noto-sans-jp)"
    fontSize: 18px
    fontWeight: 700
    lineHeight: 1.5
  heading-sm:
    fontFamily: "var(--font-noto-sans-jp)"
    fontSize: 16px
    fontWeight: 700
    lineHeight: 1.5
  body-md:
    fontFamily: "var(--font-noto-sans-jp)"
    fontSize: 15px
    fontWeight: 400
    lineHeight: 1.7
  body-sm:
    fontFamily: "var(--font-noto-sans-jp)"
    fontSize: 13px
    fontWeight: 400
    lineHeight: 1.6
  caption:
    fontFamily: "var(--font-noto-sans-jp)"
    fontSize: 12px
    fontWeight: 500
    lineHeight: 1.4
  button-md:
    fontFamily: "var(--font-noto-sans-jp)"
    fontSize: 14px
    fontWeight: 700
    lineHeight: 1
  button-sm:
    fontFamily: "var(--font-noto-sans-jp)"
    fontSize: 13px
    fontWeight: 700
    lineHeight: 1

rounded:
  sm: 8px
  md: 12px
  lg: 16px
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
  button-primary:
    backgroundColor: "{colors.primary-600}"
    textColor: "{colors.on-primary}"
    typography: "{typography.button-md}"
    rounded: "{rounded.sm}"
    padding: "10px 20px"
  button-primary-hover:
    backgroundColor: "{colors.primary-700}"
    textColor: "{colors.on-primary}"
  button-secondary:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    typography: "{typography.button-md}"
    rounded: "{rounded.sm}"
    padding: "10px 20px"
    border: "1px solid {colors.hairline}"
  button-ghost:
    backgroundColor: transparent
    textColor: "{colors.muted}"
    typography: "{typography.button-md}"
  spot-card:
    backgroundColor: "{colors.canvas}"
    rounded: "{rounded.md}"
    border: "1px solid {colors.hairline-soft}"
  spot-card-image:
    rounded: "{rounded.md} {rounded.md} 0 0"
  category-badge:
    backgroundColor: "{colors.primary-600}"
    textColor: "{colors.on-primary}"
    typography: "{typography.caption}"
    rounded: "{rounded.full}"
    padding: "4px 10px"
  attribute-chip:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.muted}"
    typography: "{typography.caption}"
    rounded: "{rounded.full}"
    padding: "6px 12px"
    border: "1px solid {colors.hairline}"
  attribute-chip-active:
    backgroundColor: "{colors.attribute-bg}"
    textColor: "{colors.attribute-text}"
    border: "1px solid {colors.attribute-border}"
  mood-chip:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.muted}"
    typography: "{typography.caption}"
    rounded: "{rounded.full}"
    padding: "6px 12px"
    border: "1px solid {colors.hairline}"
  mood-chip-active:
    backgroundColor: "{colors.mood-bg}"
    textColor: "{colors.mood-text}"
    border: "1px solid {colors.mood-border}"
  category-pill:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.muted}"
    typography: "{typography.caption}"
    rounded: "{rounded.full}"
    padding: "6px 12px"
    border: "1px solid {colors.hairline}"
  category-pill-active:
    backgroundColor: "{colors.primary-600}"
    textColor: "{colors.on-primary}"
    border: "1px solid {colors.primary-600}"
  segmented-toggle:
    backgroundColor: "{colors.canvas}"
    rounded: "{rounded.sm}"
    border: "1px solid {colors.hairline}"
  segmented-toggle-active:
    backgroundColor: "{colors.primary-600}"
    textColor: "{colors.on-primary}"
  text-input:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    typography: "{typography.body-md}"
    rounded: "{rounded.sm}"
    padding: "10px 14px"
    border: "1px solid {colors.hairline}"
  text-input-focused:
    border: "2px solid {colors.primary-700}"
  like-button:
    textColor: "{colors.muted}"
    typography: "{typography.body-sm}"
  like-button-active:
    textColor: "{colors.like}"
  top-nav:
    backgroundColor: "rgba(255, 255, 255, 0.9)"
    backdropFilter: "blur(12px)"
    textColor: "{colors.ink}"
    border: "0 0 1px {colors.hairline} solid"
    height: 64px
  top-nav-link:
    textColor: "{colors.muted}"
    fontSize: 14px
    fontWeight: 500
  top-nav-link-active:
    textColor: "{colors.ink}"
    underline: "2px solid {colors.primary-600}"
  avatar:
    backgroundColor: "{colors.surface-strong}"
    rounded: "{rounded.full}"
---

## Overview

Spoteeは、お気に入りの場所を写真とタグで共有するSNS的なWebアプリで、booking.com/ozmallのような詳細フィルター（3層タグ構造 × AND/OR検索）が最大の差別化ポイントになっている。このドキュメントはSpotee専用のプロダクトUIデザインシステムで、参考にした4サービス（Airbnb / Pinterest / Notion / Clay）のうち、写真主体のカードレイアウトとフィルターUIの骨格はAirbnbに最も近い。ただしAirbnbのRausch（コーラル）、Pinterestの赤、Notionの紫、Clayのピンクはいずれも避け、**独自のコバルトブルー（Spotee Blue）** を単色アクセントとして採用する。青は年齢・性別に偏りが少なく、地図／検索文脈との親和性が高いため「全年代に馴染みつつシンプル」という要件に合う。

通常表示は`{colors.primary-600}`（#2748E0）、ホバー・押下時に`{colors.primary-700}`（#1B34B8）へ濃くする2段階構成にしている。当初は通常表示から`primary-700`を使っていたが、白背景に対するコントラスト比を計算したところ9.42:1（AA基準4.5:1の倍以上）と余裕がありすぎ、参考にしたAirbnbのRausch（#FF385C、コントラスト比3.52:1）と比べて相対輝度が4倍以上低い＝体感的に重く沈んで見えることが分かったため、`primary-600`（コントラスト比6.80:1、AA基準を満たしつつ視覚的に軽い）を基準色に格上げした。

Spotee固有の設計判断として、**3層タグ構造をそのまま3つの色相に対応させている**。カテゴリ（1つ必須選択）はブランドブルーの実線バッジ、属性タグ（Wi-Fiあり・駐車場ありなど実用条件、複数選択可）はティール系のソフトチップ、ムードタグ（デート向け・写真映えなど感情・雰囲気、複数選択可）はパープル系のソフトチップで表現する。これにより検索結果画面やスポットカードを見ただけで「これは条件系のタグ」「これは雰囲気系のタグ」がひと目で区別でき、Spoteeの検索体験そのものがビジュアルの個性になる。

書体は英語圏の参考書体（Airbnb Cereal / Pin Sans / Notion Sans / Plain Black）がいずれも日本語非対応のため採用せず、**既存実装のNoto Sans JPを継続**する。個性は書体そのものではなく、ウェイトのコントラスト（見出し700 / 本文400）と色数を絞った構成で出す。

**Key Characteristics:**
- 単色アクセント: `{colors.primary-600}`（通常表示）と`{colors.primary-700}`（ホバー・押下）の2段階がCTA・カテゴリバッジ・選択状態のすべてを担う。コード上は`bg-primary-600` / `hover:bg-primary-700` / `text-primary-500`という使い分けになる。
- タグ3層 = 3色相: カテゴリ=ブルー実線バッジ、属性タグ=ティール、ムードタグ=パープル。いずれもソフトチップ（薄色背景＋濃色文字＋同系色ボーダー）で統一。
- 「いいね」はブランドカラーと独立させ、既存実装どおり`{colors.like}`（rose）を維持する。SNSの慣習（ブランド色と「いいね」色を分ける）に沿う。
- 形状は控えめな丸み: カード12px、ボタン・入力欄8px、タグ・バッジ・アバターは完全ピル。角の丸さで層を作らず、色と塗り（実線かソフトかアウトラインか）で階層を作る。
- キャンバスは純白。写真の発色を最優先し、暖色トーンのクリームは採用しない（Clayとの差別化にもなる）。
- 影は1段階のみ（カードホバー時の淡いシャドウ）。既存の`shadow-sm` / `hover:shadow-md`をそのまま踏襲。

## Colors

### ブランド・アクセント
- **Primary 600**（`{colors.primary-600}` — #2748E0）: 主要CTA、カテゴリバッジ、選択中のフィルター状態の**通常表示**。白背景とのコントラスト比6.80:1。
- **Primary 700**（`{colors.primary-700}` — #1B34B8）: ホバー・押下状態。コントラスト比9.42:1と余裕がありすぎるため通常表示には使わず、濃くする方向の変化にのみ使う（フォーカスボーダーなど、塗り面積が小さく強い視認性が欲しい箇所にも使用）。
- **Primary 500**（`{colors.primary-500}` — #3D65FA）: ロゴ・ワードマークや24px以上の大きい装飾要素専用。本文中のリンクや小さいテキストには使わない（白背景での文字コントラストが本文サイズには不十分なため）。
- **Primary 50〜300**: 選択済みチップの背景の薄色バリエーションや、フォーカスリングなど低強度の用途。
- **Primary 800〜900**: 現状未使用。将来、非常に高いコントラストが必要な場面のために予約。

### タグ・条件系
- **Attribute（属性タグ）**: 背景`{colors.attribute-bg}`（#ECFDF5）、文字`{colors.attribute-text}`（#047857）、枠線`{colors.attribute-border}`。Wi-Fi・駐車場・子連れOKなど「事実・条件」を表すタグ。
- **Mood（ムードタグ）**: 背景`{colors.mood-bg}`（#FAF5FF）、文字`{colors.mood-text}`（#7E22CE）、枠線`{colors.mood-border}`。デートにおすすめ・写真映えなど「雰囲気・感情」を表すタグ。

### セマンティック
- **Like**（`{colors.like}` — #F43F5E）: いいねボタンのアクティブ状態。ハートアイコンの塗りつぶしにも使用。
- **Success / Warning / Error**: フォームバリデーションや通知に使用する標準的な意味色。

### サーフェス・テキスト
- **Canvas**（`{colors.canvas}` — #FFFFFF）: 基本の背景。
- **Surface**（`{colors.surface}` — #F7F7F7）: セクション区切りや無効状態の背景。
- **Ink**（`{colors.ink}` — #171717）: 見出し・主要テキスト。
- **Body**（`{colors.body}` — #404040）: 本文。
- **Muted**（`{colors.muted}` — #6B6B6B）: メタ情報（住所・投稿日・非選択タブ）。

## Typography

Noto Sans JP（`var(--font-noto-sans-jp)`、既存の`next/font/google`設定を継続）を全ロールで使用する。CJKの可読性を優先し、本文行間は1.6〜1.7とラテン書体よりやや広めに取る。

| トークン | サイズ | ウェイト | 行間 | 用途 |
|---|---|---|---|---|
| `{typography.display}` | 28px | 700 | 1.4 | スポット詳細ページのタイトル |
| `{typography.heading-lg}` | 22px | 700 | 1.4 | セクション見出し（「あなたへのおすすめ」等） |
| `{typography.heading-md}` | 18px | 700 | 1.5 | モーダルタイトル、フィルターパネルの見出し |
| `{typography.heading-sm}` | 16px | 700 | 1.5 | SpotCardのタイトル |
| `{typography.body-md}` | 15px | 400 | 1.7 | 本文、フォーム入力値 |
| `{typography.body-sm}` | 13px | 400 | 1.6 | 住所・投稿者名などのメタ情報 |
| `{typography.caption}` | 12px | 500 | 1.4 | バッジ・タグチップのラベル |
| `{typography.button-md}` | 14px | 700 | 1 | ボタンラベル |

**原則**: 見出しは700一択（600のような中間ウェイトは使わない）。太字と通常字のコントラストだけで階層を作り、サイズのバリエーションを増やしすぎない。マーケティングLPのような70px級の巨大な見出しはSpoteeには不要（本アプリはプロダクトUIが主戦場のため）。

## Layout & Spacing

- **基準単位**: 4px（既存のTailwindデフォルトスペーシングをそのまま利用）。
- **カード内パディング**: `{spacing.md}`（16px）。
- **セクション間の縦マージン**: `{spacing.section}`（48px）。マーケティングサイトほど広くとらず、一覧性を優先する。
- **カードグリッドのgap**: `{spacing.md}`（16px）。
- **コンテナ最大幅**: 1280px（`max-w-7xl`、既存Header.tsxの設定を踏襲）。

### スポット一覧グリッド
モバイル1列 → sm 2列 → md 3列 → lg 4列。Airbnbの4-up desktopパターンを踏襲。

## Shape & Elevation

| トークン | 値 | 用途 |
|---|---|---|
| `{rounded.sm}` | 8px | ボタン、入力欄 |
| `{rounded.md}` | 12px | カード（SpotCard、フィルターパネル、モーダル） |
| `{rounded.lg}` | 16px | 大きめのモーダル・画像ギャラリー |
| `{rounded.full}` | pill | タグチップ、カテゴリバッジ、アバター、絞り込みモード切替 |

影は1段階のみ: `shadow-sm`をカードの初期状態、`hover:shadow-md`をホバー時に使用（既存SpotCard.tsxの実装を継続）。モーダル・ドロップダウンにはより強い1段階の影を追加してよいが、それ以上の多段階シャドウは導入しない。

## Components

### ナビゲーション（`{component.top-nav}`）
半透明の白背景（`bg-white/90` + `backdrop-blur`）・高さ64px・下端1pxのhairline。影は使わない。スクロール時にコンテンツがヘッダー下をうっすら透けて通る演出のため、キャンバス純白原則の唯一の例外としてヘッダーのみ半透明を許可する。

- **ロゴ**: 左端に「Spotee」ワードマーク（24px・700・`text-primary-500`）＋末尾に`{colors.primary-600}`のドット。ナビリンク（14px・500）とのサイズ・ウェイト差で階層を作る。
- **リンク**（`{component.top-nav-link}` / `-active`）: 通常は`{colors.muted}`相当のグレー、ホバーで`{colors.ink}`相当へ。ホバー・アクティブ時はリンク下端に2pxの`{colors.primary-600}`バーを`scale-x`（origin-left、200ms ease-out）で伸ばす。アクティブ状態はURLのパス前方一致で判定し、下線を常時表示する。
- **CTA**: ログイン時は「スポットを投稿」、未ログイン時は「ログイン」を`button-primary`スタイルで右端に配置。押下時に`scale-95`の縮小を加える。
- **モバイル（md未満）**: ナビを畳み、右端のハンバーガーボタン（44pxタップ領域、`aria-expanded`付き）でヘッダー直下にスライドダウンパネルを開閉する。パネル内はリンクを縦積みし、アクティブリンクは`{colors.primary-50}`背景＋`{colors.primary-700}`文字、CTAは全幅ボタンにする。ルート遷移時に自動で閉じる。

### 検索・フィルター
- **カテゴリ選択**（`{component.category-pill}` / `{component.category-pill-active}`）: 1層目。アウトライン→選択時は`{colors.primary-600}`実線塗りのピル。
- **属性タグ**（`{component.attribute-chip}` / `-active`）: 2層目。未選択時はグレーのアウトライン、選択時のみティールのソフトチップ（薄色塗り）に変わる。
- **ムードタグ**（`{component.mood-chip}` / `-active`）: 3層目。未選択時はグレーのアウトライン、選択時のみパープルのソフトチップに変わる。

属性・ムードタグはカテゴリと違って複数同時選択が前提のため、選択時も`category-pill-active`のような濃い単色塗りにはしない。同時に複数選択されたときに濃い色のピルが並ぶと視覚的にうるさくなるため、選択状態は「薄色塗り＋同系色ボーダー」程度の弱いコントラストに留める。カテゴリは1つしか選択できないため、濃い単色塗りで強調しても画面がうるさくならない。
- **AND/OR切り替え**（`{component.segmented-toggle}`）: 「いずれか」「すべて」の2択セグメントコントロール。選択側は`{colors.primary-600}`実線、非選択側は白背景。

### スポットカード（`{component.spot-card}`）
- 画像: `aspect-video`、`{rounded.md}`の上2角のみ丸め。画像がない場合は`{colors.surface}`背景に「No Image」表示（既存実装を踏襲）。
- カテゴリバッジ（`{component.category-badge}`）: 画像下、カード左上に`{colors.primary-600}`の実線ピル。
- いいねボタン（`{component.like-button}` / `-active`）: カテゴリバッジと同じ行の右側。非アクティブは`{colors.muted}`、アクティブは`{colors.like}`塗りつぶしハート。
- タイトル: `{typography.heading-sm}`、1行省略。
- 住所: `{typography.body-sm}`、`{colors.muted}`、ピンアイコン付き1行省略。
- 投稿者: 24pxの円形アバター＋名前（`{typography.body-sm}`）。

### スポット詳細
- 画像ギャラリー: カルーセルまたはグリッド、`{rounded.lg}`。
- タグ表示: カテゴリバッジ→属性チップ→ムードチップの順に、色相の違いで階層を視覚化。
- 投稿者カード: アバター・名前・フォローボタン（Phase 2）。

### フォーム・入力（`{component.text-input}` / `-focused`）
白背景、1pxのhairlineボーダー、`{rounded.sm}`。フォーカス時はボーダーが`{colors.primary-700}`2pxに変化（グロー効果は使わない、Airbnb同様の「太さで示す」フォーカス表現）。塗り面積が小さい線要素なので、通常表示より濃い`primary-700`を使っても重く見えない。

### ボタン
- **Primary**（`{component.button-primary}`）: `{colors.primary-600}`実線、白文字。ホバーで`{colors.primary-700}`に変化。
- **Secondary**（`{component.button-secondary}`）: 白背景＋hairlineボーダー、通常のフォーム送信以外の操作（キャンセル等）。
- **Ghost**（`{component.button-ghost}`）: 背景なし、テキストのみ。ログアウトなど低強度の操作。

## Do's and Don'ts

### Do
- ブランドブルー（`{colors.primary-600}`／ホバー時`{colors.primary-700}`）はCTA・カテゴリバッジ・選択状態にのみ使う。装飾目的では使わない。
- タグ3層は必ず色相で区別する：カテゴリ=ブルー、属性=ティール、ムード=パープル。この対応関係を崩さない。
- 「いいね」は`{colors.like}`（rose）を維持し、ブランドブルーと混同しない。
- 見出しは700ウェイト一択、本文は400ウェイト一択でコントラストを作る。
- カード・ボタン・チップの角丸は定義した3段階（8 / 12 / pill）以外を増やさない。

### Don't
- 属性タグ・ムードタグにブランドブルーを使わない（カテゴリバッジと衝突するため）。
- 影を多段階にしない。カードのシャドウは1種類のみ。
- `{colors.primary-500}`を本文サイズのテキストやリンクに使わない（コントラスト不足）。
- クリーム系の背景色を導入しない（写真の発色を優先し、キャンバスは純白で統一する）。

## 現状コードとの差分（移行メモ）

- `frontend/tailwind.config.ts`の`colors.primary`を、Tailwindデフォルトの`sky`系配列から本ドキュメントの`primary-50`〜`900`の値に差し替える。クラス名（`bg-primary-700`等）は変更不要。
- `frontend/src/app/globals.css`の`body { font-family: Arial, Helvetica, sans-serif; }`は、`next/font`で読み込んでいる Noto Sans JP を実際には適用できていない状態になっている。`font-sans`（Tailwind側で`var(--font-noto-sans-jp)`を指す設定）を使うよう修正が必要。
- `FilterPanel.tsx`の属性タグ配色（現状`blue-100`/`blue-700`）を、本ドキュメントのティール（`attribute-bg` / `attribute-text` / `attribute-border`）に差し替える。ムードタグの`purple-100`/`purple-700`は本ドキュメントの`mood-*`トークンとほぼ一致するため変更は軽微。

## Known Gaps

- マイページ・投稿フォーム（画像アップロード含む）の詳細なコンポーネント仕様は、実装が進んだ段階で追記する。
- フォロー機能（Phase 2）のUIパターンは未着手のため未定義。
- ダークモードは要件定義書に記載がないため対象外とした。将来必要になった場合は別途検討する。
