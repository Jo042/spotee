interface FieldLabelProps {
  htmlFor?: string;
  /** label 要素を使わないとき（チップの並びなど）の見出しの id */
  id?: string;
  optional?: boolean;
  /** 文字数の表示（「12/100」）。ラベルの右端に出す */
  count?: string;
  children: React.ReactNode;
}

/** 入力欄のラベル。任意の欄には「任意」、文字数に上限がある欄には残りを添える */
export function FieldLabel({
  htmlFor,
  id,
  optional = false,
  count,
  children,
}: FieldLabelProps) {
  const Tag = htmlFor ? "label" : "p";
  return (
    <div className="mb-1.5 flex items-baseline justify-between gap-3">
      <Tag
        {...(htmlFor ? { htmlFor } : {})}
        id={id}
        className="text-sm font-medium text-gray-700"
      >
        {children}
        {optional && (
          <span className="ml-2 text-xs font-normal text-gray-500">任意</span>
        )}
      </Tag>
      {count && (
        <span className="text-xs tabular-nums text-gray-500" aria-hidden="true">
          {count}
        </span>
      )}
    </div>
  );
}

export function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <p id={id} className="mt-1.5 text-sm text-red-600">
      {message}
    </p>
  );
}
