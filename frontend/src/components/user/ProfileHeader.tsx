"use client";

import { useState } from "react";
import Link from "next/link";
import { Avatar } from "@/components/common/Avatar";
import { formatCount } from "@/lib/format";

export interface ProfileStat {
  label: string;
  count?: number;
  href?: string;
}

interface ProfileHeaderProps {
  name: string;
  avatarUrl?: string | null;
  bio?: string | null;
  stats: ProfileStat[];
  /** 右上のボタン（「プロフィールを編集」や「フォロー」） */
  action?: React.ReactNode;
}

/** これを超える自己紹介は3行で畳む。実測ではなく目安（行数はフォントと幅で変わる） */
const BIO_CLAMP_THRESHOLD = 90;

const GRID_COLS: Record<number, string> = {
  3: "grid-cols-3",
  4: "grid-cols-4",
};

/** マイページと他人のプロフィールで共通の頭の部分。統計はスマホでも1行に並べる */
export function ProfileHeader({
  name,
  avatarUrl,
  bio,
  stats,
  action,
}: ProfileHeaderProps) {
  const [bioExpanded, setBioExpanded] = useState(false);
  const isBioLong = (bio?.length ?? 0) > BIO_CLAMP_THRESHOLD;

  return (
    <header>
      <div className="flex items-start gap-4 sm:gap-6">
        <Avatar name={name} src={avatarUrl} size={72} className="sm:size-24" />
        <div className="min-w-0 flex-1 pt-1">
          <div className="flex items-start justify-between gap-3">
            <h1 className="min-w-0 break-words text-xl font-bold leading-snug text-gray-900 sm:text-2xl">
              {name}
            </h1>
            {action && <div className="shrink-0">{action}</div>}
          </div>
          {bio && (
            <div className="mt-2">
              <p
                className={`whitespace-pre-wrap text-sm leading-relaxed text-gray-700 ${
                  isBioLong && !bioExpanded ? "line-clamp-3" : ""
                }`}
              >
                {bio}
              </p>
              {isBioLong && (
                <button
                  type="button"
                  onClick={() => setBioExpanded((prev) => !prev)}
                  className="btn-text mt-1"
                >
                  {bioExpanded ? "折りたたむ" : "続きを読む"}
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      <ul
        className={`mt-5 grid max-w-md ${GRID_COLS[stats.length] ?? "grid-cols-4"}`}
      >
        {stats.map((stat) => {
          const content = (
            <>
              <span className="block text-base font-bold tabular-nums text-gray-900">
                {stat.count === undefined ? "-" : formatCount(stat.count)}
              </span>
              <span className="block text-xs text-gray-500">{stat.label}</span>
            </>
          );
          return (
            <li key={stat.label}>
              {stat.href ? (
                <Link
                  href={stat.href}
                  className="block rounded-md hover:opacity-75 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-300"
                >
                  {content}
                </Link>
              ) : (
                content
              )}
            </li>
          );
        })}
      </ul>
    </header>
  );
}
