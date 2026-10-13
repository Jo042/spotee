import type { TagSearchMode } from "@/lib/spot-filter";

interface ModeSwitchProps {
  mode: TagSearchMode;
  onChange: (mode: TagSearchMode) => void;
  /** 置く面の色。淡い青の面の上は白、白い面の上は灰色 */
  surface?: "white" | "gray";
}

const OPTIONS: [TagSearchMode, string][] = [
  ["AND", "すべて当てはまる"],
  ["OR", "どれか当てはまる"],
];

/** 特徴と雰囲気の中の「すべて／どれか」の切り替え */
export function ModeSwitch({
  mode,
  onChange,
  surface = "white",
}: ModeSwitchProps) {
  return (
    <div
      role="group"
      aria-label="特徴と雰囲気の当てはめ方"
      className={`inline-flex rounded-full p-1 text-xs ${
        surface === "white" ? "bg-white" : "bg-gray-100"
      }`}
    >
      {OPTIONS.map(([value, label]) => {
        const active = mode === value;
        return (
          <button
            key={value}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(value)}
            className={`rounded-full px-3 py-1.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-300 ${
              active
                ? "bg-primary-600 font-bold text-white"
                : "font-medium text-gray-600 hover:text-gray-900"
            }`}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
