import Image from "next/image";
import Link from "next/link";
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
      className="group block rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-300 focus-visible:ring-offset-4"
    >
      <article>
        <div className="relative aspect-video overflow-hidden rounded-xl bg-gray-100">
          {collection.thumbnailUrl && (
            <Image
              src={collection.thumbnailUrl}
              alt={collection.title}
              fill
              sizes="(min-width: 1024px) 400px, (min-width: 640px) 50vw, 100vw"
              className="object-cover"
            />
          )}
        </div>

        <h3 className="mt-2.5 line-clamp-3 text-[15px] font-bold leading-snug text-gray-900 decoration-gray-300 underline-offset-4 group-hover:underline">
          {collection.title}
        </h3>

        <p className="mt-2 flex items-center gap-1.5 text-xs text-gray-500">
          <Avatar
            name={collection.user.name}
            src={collection.user.avatarUrl}
            size={20}
          />
          <span className="line-clamp-2 break-all text-gray-700">
            {collection.user.name}
          </span>
          <span className="shrink-0">
            ・ {formatCount(collection.spotCount)}か所
          </span>
        </p>
      </article>
    </Link>
  );
}

export function CollectionCardSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="aspect-video rounded-xl bg-gray-100" />
      <div className="mt-2.5 h-5 w-3/4 rounded bg-gray-100" />
      <div className="mt-2.5 flex items-center gap-1.5">
        <div className="size-5 rounded-full bg-gray-100" />
        <div className="h-3.5 w-24 rounded bg-gray-100" />
      </div>
    </div>
  );
}
