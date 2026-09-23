"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { CircleAlert, CircleCheck, X } from "lucide-react";
import {
  enqueueToast,
  removeToast,
  type Toast,
  type ToastAction,
  type ToastType,
} from "@/lib/toast-queue";

const AUTO_DISMISS_MS = 4000;
/** 取り消しなどの操作が付く通知は、押す猶予を長めに取る */
const AUTO_DISMISS_WITH_ACTION_MS = 6000;

interface ShowOptions {
  action?: ToastAction;
}

interface ToastContextValue {
  success: (message: string, options?: ShowOptions) => void;
  error: (message: string, options?: ShowOptions) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast(): ToastContextValue {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast は ToastProvider の内側で使ってください");
  }
  return context;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const nextId = useRef(0);
  const timers = useRef(new Map<number, ReturnType<typeof setTimeout>>());

  const dismiss = useCallback((id: number) => {
    const timer = timers.current.get(id);
    if (timer) clearTimeout(timer);
    timers.current.delete(id);
    setToasts((current) => removeToast(current, id));
  }, []);

  // 消去のタイマーは表示と同時に（呼び出し時点で）仕掛ける。effect で state を
  // 監視して仕掛けると set-state-in-effect になるため
  const show = useCallback(
    (type: ToastType, message: string, options?: ShowOptions) => {
      nextId.current += 1;
      const id = nextId.current;

      setToasts((current) =>
        enqueueToast(current, { id, type, message, action: options?.action }),
      );

      const duration = options?.action
        ? AUTO_DISMISS_WITH_ACTION_MS
        : AUTO_DISMISS_MS;
      timers.current.set(
        id,
        setTimeout(() => dismiss(id), duration),
      );
    },
    [dismiss],
  );

  useEffect(() => {
    const pending = timers.current;
    return () => {
      pending.forEach((timer) => clearTimeout(timer));
      pending.clear();
    };
  }, []);

  const value = useMemo<ToastContextValue>(
    () => ({
      success: (message, options) => show("success", message, options),
      error: (message, options) => show("error", message, options),
    }),
    [show],
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        role="region"
        aria-label="通知"
        className="pointer-events-none fixed inset-x-0 bottom-0 z-[60] flex flex-col items-center gap-2 px-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:items-end sm:px-6 sm:pb-6"
      >
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onDismiss={dismiss} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

function ToastItem({
  toast,
  onDismiss,
}: {
  toast: Toast;
  onDismiss: (id: number) => void;
}) {
  const isError = toast.type === "error";
  const Icon = isError ? CircleAlert : CircleCheck;

  const handleAction = () => {
    toast.action?.onClick();
    onDismiss(toast.id);
  };

  return (
    <div
      role={isError ? "alert" : "status"}
      className="pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-xl bg-gray-900 px-4 py-3 text-sm text-white shadow-lg motion-safe:animate-toast-in"
    >
      <Icon
        size={18}
        aria-hidden="true"
        className={`mt-0.5 shrink-0 ${isError ? "text-red-400" : "text-green-400"}`}
      />
      <p className="min-w-0 flex-1 whitespace-pre-line leading-relaxed">
        {toast.message}
      </p>
      {toast.action && (
        <button
          type="button"
          onClick={handleAction}
          className="-my-1 min-h-8 shrink-0 rounded-md px-2 font-bold text-primary-300 transition-colors hover:bg-white/10 hover:text-primary-200"
        >
          {toast.action.label}
        </button>
      )}
      <button
        type="button"
        onClick={() => onDismiss(toast.id)}
        aria-label="通知を閉じる"
        className="-m-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-gray-400 transition-colors hover:bg-white/10 hover:text-white"
      >
        <X size={16} aria-hidden="true" />
      </button>
    </div>
  );
}
