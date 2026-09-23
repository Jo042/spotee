import Image from "next/image";
import Link from "next/link";
import { Bookmark } from "lucide-react";
import { formatCount } from "@/lib/format";

interface FolderGridProps {
  folders: {
    id: string;
    name: string;
    spotCount: number;
    thumbnailUrl?: string | null;
  }[];
}

export function FolderGrid({ folders }: FolderGridProps) {
  if (folders.length === 0) {
    return (
      <div className="flex flex-col items-center py-16 sm:py-20 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-gray-400">
          <Bookmark size={22} aria-hidden="true" />
        </div>
        <p className="mt-4 text-sm text-gray-500">
          まだ保存したスポットがありません
        </p>
        <p className="mt-1 text-xs text-gray-400">
          スポットのしおりのボタンから、フォルダに分けて保存できます
        </p>
        <Link
          href="/spots"
          className="mt-5 rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
        >
          スポットを探す
        </Link>
      </div>
    );
  }

  return (
    <ul className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-3">
      {folders.map((folder) => (
        <li key={folder.id}>
          <Link
            href={`/mypage/folders/${folder.id}`}
            className="group block rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-300 focus-visible:ring-offset-2"
          >
            <article className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm transition duration-300 group-hover:-translate-y-0.5 group-hover:shadow-md">
              <div className="relative aspect-video overflow-hidden bg-gray-100">
                {folder.thumbnailUrl ? (
                  <Image
                    src={folder.thumbnailUrl}
                    alt=""
                    fill
                    sizes="(min-width: 1024px) 280px, 50vw"
                    className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-gray-300">
                    <Bookmark size={28} aria-hidden="true" />
                  </div>
                )}
              </div>
              <div className="p-3 sm:px-4 sm:pb-4">
                <h3 className="truncate font-bold text-gray-900 transition-colors group-hover:text-primary-700">
                  {folder.name}
                </h3>
                <p className="mt-0.5 text-sm text-gray-500">
                  {formatCount(folder.spotCount)}件
                </p>
              </div>
            </article>
          </Link>
        </li>
      ))}
    </ul>
  );
}
