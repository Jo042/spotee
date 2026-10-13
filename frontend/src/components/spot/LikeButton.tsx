"use client";

import { useState } from "react";
import { useMutation } from "@apollo/client/react";
import { Heart } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { TOGGLE_LIKE } from "@/graphql/mutations/like";
import { formatCount } from "@/lib/format";

interface LikeButtonProps {
  spotId: string;
  likeCount: number;
  isLiked: boolean | null;
  /** compact: カードの中（アイコンと数字）。labeled: 詳細ページ（アイコンと「いいね 128」） */
  variant?: "compact" | "labeled";
}

export function LikeButton({
  spotId,
  likeCount,
  isLiked,
  variant = "compact",
}: LikeButtonProps) {
  const { user } = useAuth();
  const router = useRouter();
  const [popCount, setPopCount] = useState(0);

  const [toggleLike, { loading }] = useMutation(TOGGLE_LIKE, {
    variables: { spotId },
    optimisticResponse: {
      toggleLike: {
        __typename: "LikeResult",
        liked: !isLiked,
        likeCount: isLiked ? likeCount - 1 : likeCount + 1,
      },
    },
    update(cache, { data }) {
      if (!data) return;
      cache.modify({
        id: cache.identify({ __typename: "Spot", id: spotId }),
        fields: {
          isLiked: () => data.toggleLike.liked,
          likeCount: () => data.toggleLike.likeCount,
        },
      });
    },
  });

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      router.push("/login");
      return;
    }
    setPopCount((n) => n + 1);
    toggleLike();
  };

  const labeled = variant === "labeled";

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading}
      aria-pressed={isLiked ?? false}
      aria-label={labeled ? undefined : `いいね ${likeCount}`}
      className={`flex items-center transition-colors disabled:opacity-50 ${
        labeled ? "gap-1.5 text-sm font-medium" : "-m-2 gap-1 p-2 text-xs"
      } ${
        isLiked
          ? "text-rose-500"
          : labeled
            ? "text-gray-900 hover:text-rose-500"
            : "text-gray-500 hover:text-rose-500"
      }`}
    >
      <Heart
        key={popCount}
        size={labeled ? 20 : 16}
        aria-hidden="true"
        className={`${isLiked ? "fill-rose-500" : ""} ${
          popCount > 0 ? "motion-safe:animate-pop" : ""
        }`}
      />
      <span className="tabular-nums">
        {labeled ? `いいね ${formatCount(likeCount)}` : formatCount(likeCount)}
      </span>
    </button>
  );
}
