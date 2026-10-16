import type {
  AskLayer,
  AskLayerContent,
  AskSentenceLayer,
} from "@/lib/ask-sentence";

interface AskSentenceProps {
  /** buildAskSentence の結果（雰囲気・特徴・カテゴリの順） */
  layers: AskSentenceLayer[];
  onPick: (layer: AskLayer) => void;
  /** lg: トップの大きな一文（言葉の上に層の名前）。sm: 一覧の上のバー */
  size?: "lg" | "sm";
}

const SELECTED_WORD =
  "text-primary-700 underline decoration-2 underline-offset-[0.18em]";

function describeContent(content: AskLayerContent): string {
  switch (content.kind) {
    case "empty":
      return "まだ選んでいません";
    case "summary":
      return `${content.first} など${content.total}つ`;
    case "words":
      return content.words.join(` ${content.connector} `);
  }
}

function Words({ content }: { content: AskLayerContent }) {
  switch (content.kind) {
    case "empty":
      return (
        <span className="font-bold text-gray-500 underline decoration-primary-200 decoration-dashed decoration-2 underline-offset-[0.18em]">
          {content.placeholder}
        </span>
      );
    case "summary":
      return (
        <span className={SELECTED_WORD}>
          {content.first}
          <span className="ml-[0.3em] whitespace-nowrap text-[0.72em]">
            など{content.total}つ
          </span>
        </span>
      );
    case "words":
      return content.words.map((word, i) => (
        <span key={word}>
          {i > 0 && (
            <span className="mx-[0.3em] text-[0.72em] text-primary-700">
              {content.connector}
            </span>
          )}
          <span className={SELECTED_WORD}>{word}</span>
        </span>
      ));
  }
}

function Slot({
  item,
  onPick,
  suffix,
  showLabel,
}: {
  item: AskSentenceLayer;
  onPick: (layer: AskLayer) => void;
  showLabel: boolean;
  /** 言葉のすぐ後ろの文字。行の頭に「、」だけが送られないよう、言葉と同じ塊に入れる */
  suffix?: string;
}) {
  return (
    <button
      type="button"
      onClick={() => onPick(item.layer)}
      aria-haspopup="dialog"
      aria-label={`${item.label}を選ぶ（今: ${describeContent(item.content)}）`}
      className="inline-flex flex-col items-start rounded-md text-left align-bottom focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-300"
    >
      {showLabel && (
        <span className="font-sans text-[11px] font-medium leading-none tracking-wide text-primary-700 sm:text-xs">
          {item.label}
        </span>
      )}
      <span className="leading-[1.35]">
        <Words content={item.content} />
        {suffix && <span className="text-gray-900">{suffix}</span>}
      </span>
    </button>
  );
}

/** 「[雰囲気]、[特徴] [カテゴリ]を探す」の一文。言葉を押すとその層を選び直す */
export function AskSentence({ layers, onPick, size = "lg" }: AskSentenceProps) {
  const [mood, attribute, category] = layers;
  const showLabel = size === "lg";
  return (
    <p
      className={`font-display font-black text-gray-900 ${
        size === "lg"
          ? "text-[26px] leading-[2.1] sm:text-[44px] sm:leading-[1.75]"
          : "text-lg leading-loose sm:text-[22px]"
      }`}
    >
      <Slot item={mood} onPick={onPick} suffix="、" showLabel={showLabel} />{" "}
      <Slot item={attribute} onPick={onPick} showLabel={showLabel} />{" "}
      <Slot
        item={category}
        onPick={onPick}
        suffix="を探す"
        showLabel={showLabel}
      />
    </p>
  );
}
