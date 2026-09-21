"use client";

import { useState } from "react";
import { useMutation } from "@apollo/client/react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { FOLLOW_USER, UNFOLLOW_USER } from "@/graphql/mutations/follow";

interface FollowButtonProps {
  userId: string;
  isFollowing: boolean | null;
  followersCount: number;
  size?: "md" | "sm";
}

export function FollowButton({
  userId,
  isFollowing,
  followersCount,
  size = "md",
}: FollowButtonProps) {
  const { user } = useAuth();
  const router = useRouter();
  const [hovered, setHovered] = useState(false);

  const following = isFollowing ?? false;

  // サーバー側が冪等なので、連打しても最終状態に収束する。
  // 件数は楽観的に ±1 し、応答の User でキャッシュが正規化される
  const optimisticUser = (nextFollowing: boolean) => ({
    __typename: "User" as const,
    id: userId,
    isFollowing: nextFollowing,
    followersCount: nextFollowing
      ? followersCount + 1
      : Math.max(0, followersCount - 1),
  });

  const [followUser, { loading: submittingFollow }] = useMutation(FOLLOW_USER, {
    variables: { userId },
    optimisticResponse: { followUser: optimisticUser(true) },
  });
  const [unfollowUser, { loading: submittingUnfollow }] = useMutation(
    UNFOLLOW_USER,
    {
      variables: { userId },
      optimisticResponse: { unfollowUser: optimisticUser(false) },
    },
  );

  const loading = submittingFollow || submittingUnfollow;

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      router.push("/login");
      return;
    }

    void (following ? unfollowUser() : followUser());
  };

  // フォロー中のホバー時だけ「フォロー解除」に変わる。
  // 3つの状態で幅が変わらないよう min-w を固定してレイアウトのずれを防ぐ
  const label = following
    ? hovered
      ? "フォロー解除"
      : "フォロー中"
    : "フォロー";

  const sizeClass =
    size === "sm"
      ? "min-h-9 min-w-24 px-3 text-xs"
      : "min-h-11 min-w-32 px-5 text-sm";

  const styleClass = following
    ? hovered
      ? "border border-rose-200 bg-rose-50 text-rose-600"
      : "border border-gray-200 bg-white text-gray-700"
    : "border border-primary-600 bg-primary-600 text-white hover:bg-primary-700 hover:border-primary-700";

  return (
    <button
      type="button"
      onClick={handleClick}
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => setHovered(false)}
      aria-pressed={following}
      aria-label={following ? "フォローを解除する" : "フォローする"}
      className={`relative inline-flex items-center justify-center rounded-lg font-bold transition-colors active:scale-[0.98] ${sizeClass} ${styleClass}`}
    >
      <span className={loading ? "invisible" : ""}>{label}</span>
      {loading && (
        <Loader2
          size={16}
          className="absolute animate-spin"
          aria-hidden="true"
        />
      )}
    </button>
  );
}
