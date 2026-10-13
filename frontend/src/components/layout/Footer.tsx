import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-gray-50">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-8 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link
            href="/"
            className="font-display text-xl font-black tracking-tight text-gray-900"
          >
            spotee
          </Link>
          <p className="mt-1 text-xs text-gray-500">
            すべての人が、次の行きたい場所に出会えるサービス
          </p>
        </div>
        <nav aria-label="フッター" className="flex gap-6 text-sm text-gray-600">
          <Link href="/spots" className="hover:text-gray-900">
            探す
          </Link>
          <Link href="/collections" className="hover:text-gray-900">
            特集
          </Link>
        </nav>
      </div>
    </footer>
  );
}
