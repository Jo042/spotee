import Image from "next/image";
import Link from "next/link";
import { EmptyState } from "@/components/common/EmptyState";
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
      <EmptyState
        message="まだ保存したスポットがありません"
        description="スポットの保存のボタンから、フォルダに分けて保存できます"
        action={
          <Link href="/spots" className="btn-secondary">
            スポットを探す
          </Link>
        }
      />
    );
  }

  return (
    <ul className="grid grid-cols-2 gap-x-3 gap-y-7 sm:gap-x-5 lg:grid-cols-3">
      {folders.map((folder) => (
        <li key={folder.id}>
          <Link
            href={`/mypage/folders/${folder.id}`}
            className="group block rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-300 focus-visible:ring-offset-4"
          >
            <div className="relative aspect-video overflow-hidden rounded-xl bg-gray-100">
              {folder.thumbnailUrl && (
                <Image
                  src={folder.thumbnailUrl}
                  alt=""
                  fill
                  sizes="(min-width: 1024px) 300px, 50vw"
                  className="object-cover"
                />
              )}
            </div>
            <h3 className="mt-2.5 line-clamp-2 break-words text-[15px] font-bold leading-snug text-gray-900 decoration-gray-300 underline-offset-4 group-hover:underline">
              {folder.name}
            </h3>
            <p className="mt-1 text-xs text-gray-500">
              {formatCount(folder.spotCount)}件
            </p>
          </Link>
        </li>
      ))}
    </ul>
  );
}
