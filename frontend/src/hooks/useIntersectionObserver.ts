import { useEffect, useRef, useState } from "react";

interface UseIntersectionObserverOptions {
  // どのくらい手前で発火するか（0.0〜1.0）
  threshold?: number;
  // ルート要素からのマージン
  rootMargin?: string;
  // 監視を有効にするかどうか
  enabled?: boolean;
}

/**
 * Intersection Observer を使って要素が画面内に入ったかを検知するフック
 */
export function useIntersectionObserver<T extends HTMLElement>({
  threshold = 0,
  rootMargin = "100px",
  enabled = true,
}: UseIntersectionObserverOptions = {}) {
  const targetRef = useRef<T>(null);
  const [isIntersecting, setIsIntersecting] = useState(false);

  useEffect(() => {
    const target = targetRef.current;

    if (!target || !enabled) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        setIsIntersecting(entries[0].isIntersecting);
      },
      {
        threshold,
        rootMargin,
      },
    );

    observer.observe(target);

    return () => {
      observer.disconnect();
    };
  }, [threshold, rootMargin, enabled]);

  return { targetRef, isIntersecting };
}
