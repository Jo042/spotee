import Link from "next/link";

export interface UnderlineTab<K extends string> {
  key: K;
  label: string;
  count?: number;
  /** 渡すとリンクにする（履歴に積まない）。無ければ onSelect を呼ぶボタン */
  href?: string;
}

interface UnderlineTabsProps<K extends string> {
  label: string;
  tabs: UnderlineTab<K>[];
  active: K;
  onSelect?: (key: K) => void;
}

/**
 * 下線のタブ。件数はピルで囲まず、文字で添える。
 * リンクのときは replace にする（積むと「戻る」がタブ間を往復して前の画面へ戻れない）
 */
export function UnderlineTabs<K extends string>({
  label,
  tabs,
  active,
  onSelect,
}: UnderlineTabsProps<K>) {
  return (
    <nav aria-label={label} className="border-b border-gray-200">
      <ul className="-mb-px flex gap-6 overflow-x-auto">
        {tabs.map((tab) => {
          const isActive = tab.key === active;
          const className = `relative flex min-h-11 shrink-0 items-center gap-1.5 border-b-2 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary-300 ${
            isActive
              ? "border-primary-700 font-bold text-gray-900"
              : "border-transparent font-medium text-gray-500 hover:text-gray-800"
          }`;
          const content = (
            <>
              {tab.label}
              {typeof tab.count === "number" && (
                <span className="text-xs font-normal tabular-nums text-gray-500">
                  {tab.count}
                </span>
              )}
            </>
          );
          return (
            <li key={tab.key}>
              {tab.href ? (
                <Link
                  href={tab.href}
                  replace
                  aria-current={isActive ? "page" : undefined}
                  className={className}
                >
                  {content}
                </Link>
              ) : (
                <button
                  type="button"
                  onClick={() => onSelect?.(tab.key)}
                  aria-current={isActive ? "page" : undefined}
                  className={className}
                >
                  {content}
                </button>
              )}
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
