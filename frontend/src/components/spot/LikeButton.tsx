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
}

export function LikeButton({ spotId, likeCount, isLiked }: LikeButtonProps) {
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

  return (
    <button
      onClick={handleClick}
      disabled={loading}
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
