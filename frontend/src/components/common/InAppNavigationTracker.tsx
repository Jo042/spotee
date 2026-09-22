"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { markInAppNavigation } from "@/lib/in-app-navigation";

/**
 * パスの変化を監視してアプリ内遷移を記録する。
 * 描画するものは無く、state も持たない（外部への同期のみ）。
 */
export function InAppNavigationTracker() {
  const pathname = usePathname();
  const previousPathname = useRef<string | null>(null);

  useEffect(() => {
    if (
      previousPathname.current !== null &&
      previousPathname.current !== pathname
    ) {
      markInAppNavigation();
    }
    previousPathname.current = pathname;
  }, [pathname]);

  return null;
}
