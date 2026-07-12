"use client";

import { useMutation } from "@apollo/client/react";
import { Heart } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { TOGGLE_LIKE } from "@/graphql/mutations/like";

interface LikeButtonProps {
  spotId: string;
  likeCount: number;
  isLiked: boolean | null;
  variant?: "inline" | "pill";
}

export function LikeButton({
  spotId,
  likeCount,
  isLiked,
  variant = "inline",
}: LikeButtonProps) {
  const { user } = useAuth();
  const router = useRouter();

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
    toggleLike();
  };

  if (variant === "pill") {
    return (
      <button
        onClick={handleClick}
        disabled={loading}
        aria-pressed={isLiked ?? false}
        className={`flex items-center gap-1.5 rounded-full border px-4 py-2 text-sm font-medium transition-colors disabled:opacity-50 active:scale-95 ${
          isLiked
            ? "border-rose-200 bg-rose-50 text-rose-500"
            : "border-gray-200 text-gray-500 hover:border-rose-200 hover:text-rose-400"
        }`}
      >
        <Heart size={16} className={isLiked ? "fill-rose-500" : ""} />
        <span>{likeCount}</span>
      </button>
    );
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      aria-pressed={isLiked ?? false}
      className={`flex items-center gap-1 p-2 -m-2 text-sm transition-colors disabled:opacity-50 ${
        isLiked
          ? "text-rose-500"
          : "text-gray-400 hover:text-rose-400"
      }`}
    >
      <Heart
        size={14}
        className={isLiked ? "fill-rose-500" : ""}
      />
      <span>{likeCount}</span>
    </button>
  );
}
