import { describe, it, expect, vi, beforeEach } from "vitest";

/**
 * モジュールスコープの状態を持つため、テストごとに読み込み直す。
 * 「タブを開き直すとリセットされる」という性質の再現でもある。
 */
async function loadModule() {
  vi.resetModules();
  return import("./in-app-navigation");
}

describe("in-app-navigation", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it("初期状態では遷移していない", async () => {
    const m = await loadModule();

    expect(m.getInAppNavigationSnapshot()).toBe(false);
  });

  it("サーバー用のスナップショットは常に false", async () => {
    const m = await loadModule();
    m.markInAppNavigation();

    expect(m.getInAppNavigationServerSnapshot()).toBe(false);
  });

  it("記録すると true になる", async () => {
    const m = await loadModule();
    m.markInAppNavigation();

    expect(m.getInAppNavigationSnapshot()).toBe(true);
  });

  it("読み込み直すとリセットされる（タブを開き直した状態）", async () => {
    const first = await loadModule();
    first.markInAppNavigation();
    expect(first.getInAppNavigationSnapshot()).toBe(true);

    const second = await loadModule();
    expect(second.getInAppNavigationSnapshot()).toBe(false);
  });

  describe("購読", () => {
    it("記録すると購読者に通知する", async () => {
      const m = await loadModule();
      const listener = vi.fn();
      m.subscribeInAppNavigation(listener);

      m.markInAppNavigation();

      expect(listener).toHaveBeenCalledTimes(1);
    });

    it("2回目以降は通知しない（状態が変わらないため）", async () => {
      const m = await loadModule();
      const listener = vi.fn();
      m.subscribeInAppNavigation(listener);

      m.markInAppNavigation();
      m.markInAppNavigation();
      m.markInAppNavigation();

      expect(listener).toHaveBeenCalledTimes(1);
    });

    it("複数の購読者すべてに通知する", async () => {
      const m = await loadModule();
      const a = vi.fn();
      const b = vi.fn();
      m.subscribeInAppNavigation(a);
      m.subscribeInAppNavigation(b);

      m.markInAppNavigation();

      expect(a).toHaveBeenCalledTimes(1);
      expect(b).toHaveBeenCalledTimes(1);
    });

    it("解除した購読者には通知しない", async () => {
      const m = await loadModule();
      const listener = vi.fn();
      const unsubscribe = m.subscribeInAppNavigation(listener);

      unsubscribe();
      m.markInAppNavigation();

      expect(listener).not.toHaveBeenCalled();
    });

    it("解除しても他の購読者には通知が届く", async () => {
      const m = await loadModule();
      const removed = vi.fn();
      const kept = vi.fn();
      const unsubscribe = m.subscribeInAppNavigation(removed);
      m.subscribeInAppNavigation(kept);

      unsubscribe();
      m.markInAppNavigation();

      expect(removed).not.toHaveBeenCalled();
      expect(kept).toHaveBeenCalledTimes(1);
    });
  });
});
