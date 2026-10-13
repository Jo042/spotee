import Image from "next/image";
import Link from "next/link";
import { Layers } from "lucide-react";
import { Avatar } from "@/components/common/Avatar";
import { formatCount } from "@/lib/format";

interface CollectionCardProps {
  collection: {
    id: string;
    title: string;
    thumbnailUrl?: string | null;
    spotCount: number;
    user: { name: string; avatarUrl?: string | null };
  };
}

export function CollectionCard({ collection }: CollectionCardProps) {
  return (
    <Link
      href={`/collections/${collection.id}`}
      className="group block rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-300 focus-visible:ring-offset-2"
    >
      <article className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm transition duration-300 group-hover:-translate-y-0.5 group-hover:shadow-md">
        <div className="relative aspect-video overflow-hidden bg-gray-100">
          {collection.thumbnailUrl ? (
            <Image
              src={collection.thumbnailUrl}
              alt={collection.title}
              fill
              sizes="(min-width: 1024px) 400px, (min-width: 640px) 50vw, 100vw"
              className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-gray-400">
              <Layers size={28} aria-hidden="true" />
            </div>
          )}
        </div>

        <div className="p-4">
          <h3 className="line-clamp-2 font-bold leading-snug text-gray-900 transition-colors group-hover:text-primary-700">
            {collection.title}
          </h3>

          <div className="mt-3 flex items-center justify-between gap-3 border-t border-gray-100 pt-3 text-sm text-gray-600">
            <span className="flex min-w-0 items-center gap-2">
              <Avatar
                name={collection.user.name}
                src={collection.user.avatarUrl}
                size={24}
              />
              <span className="truncate">{collection.user.name}</span>
            </span>
            <span className="shrink-0">
              <span className="font-bold text-gray-900">
                {formatCount(collection.spotCount)}
              </span>{" "}
              スポット
            </span>
          </div>
        </div>
      </article>
    </Link>
  );
}

export function CollectionCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
      <div className="aspect-video animate-pulse bg-gray-200" />
      <div className="space-y-3 p-4">
        <div className="h-5 w-3/4 animate-pulse rounded bg-gray-200" />
        <div className="h-4 w-1/2 animate-pulse rounded bg-gray-100" />
      </div>
    </div>
  );
}
