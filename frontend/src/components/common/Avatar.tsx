import Image from "next/image";
import { getInitial } from "@/lib/avatar";

interface AvatarProps {
  name: string;
  src?: string | null;
  /** 表示の大きさ（px）。画面幅で変える場合は className に `sm:size-24` などを足す */
  size: number;
  className?: string;
}

/** ユーザーのアバター。画像が無ければ名前の最初の1文字を出す */
export function Avatar({ name, src, size, className = "" }: AvatarProps) {
  return (
    <span
      style={{ "--avatar-size": `${size}px` } as React.CSSProperties}
      className={`relative inline-flex size-(--avatar-size) shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary-50 text-[calc(var(--avatar-size)*0.42)] font-bold leading-none text-primary-700 ${className}`}
    >
      {src ? (
        <Image
          src={src}
          alt=""
          fill
          sizes={`${Math.max(size, 96)}px`}
          className="object-cover"
        />
      ) : (
        <span aria-hidden="true">{getInitial(name)}</span>
      )}
    </span>
  );
}
