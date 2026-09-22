/**
 * このタブでアプリ内のクライアント遷移が起きたかを記録する。
 *
 * `window.history.length` では判定できない。新しいタブは about:blank から
 * 始まるため、URLを直接開いた場合でも履歴は2件になる。
 *
 * モジュールスコープの値なので、クライアント遷移をまたいで保持され、
 * リロードやタブを開き直すとリセットされる。これが「このタブでアプリ内を
 * 移動したか」と一致する。
 */
let hasNavigated = false;

const listeners = new Set<() => void>();

export function markInAppNavigation(): void {
  if (hasNavigated) return;

  hasNavigated = true;
  listeners.forEach((listener) => listener());
}

export function subscribeInAppNavigation(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function getInAppNavigationSnapshot(): boolean {
  return hasNavigated;
}

/** サーバー描画時は「まだ移動していない」として扱う */
export function getInAppNavigationServerSnapshot(): boolean {
  return false;
}
