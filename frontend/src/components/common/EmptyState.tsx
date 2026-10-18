interface EmptyStateProps {
  message: string;
  description?: string;
  /** 次にできることを1つだけ（ボタンやリンク） */
  action?: React.ReactNode;
}

/** 空のときの表示。アイコンを丸い面に入れて飾らず、文言と次の一手だけを出す */
export function EmptyState({ message, description, action }: EmptyStateProps) {
  return (
    <div className="py-16 text-center">
      <p className="text-sm text-gray-700">{message}</p>
      {description && (
        <p className="mt-1 text-xs text-gray-500">{description}</p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
