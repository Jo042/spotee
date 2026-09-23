export type ToastType = "success" | "error";

export interface ToastAction {
  label: string;
  onClick: () => void;
}

export interface Toast {
  id: number;
  type: ToastType;
  message: string;
  action?: ToastAction;
}

/** 同時に表示する上限。超えた分は古いものから消す */
export const MAX_VISIBLE_TOASTS = 3;

export function enqueueToast(
  toasts: readonly Toast[],
  toast: Toast,
  max: number = MAX_VISIBLE_TOASTS,
): Toast[] {
  const next = [...toasts, toast];
  return next.length > max ? next.slice(next.length - max) : next;
}

export function removeToast(toasts: readonly Toast[], id: number): Toast[] {
  return toasts.filter((toast) => toast.id !== id);
}
