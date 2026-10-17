import { Spinner } from "@/components/common/Spinner";

interface AuthLayoutProps {
  title: string;
  description?: React.ReactNode;
  /** 本文の下に添える案内（「アカウントをお持ちでない方は…」など） */
  footer?: React.ReactNode;
  children?: React.ReactNode;
}

/** 認証の画面の共通の枠。カードで囲まず、白い画面に1列で並べる */
export function AuthLayout({
  title,
  description,
  footer,
  children,
}: AuthLayoutProps) {
  return (
    <main className="mx-auto w-full max-w-[400px] px-4 pb-20 pt-10 sm:pt-16">
      <h1 className="text-2xl font-bold leading-snug text-gray-900">{title}</h1>
      {description && (
        <p className="mt-2 text-sm leading-relaxed text-gray-600">
          {description}
        </p>
      )}
      {children && <div className="mt-8">{children}</div>}
      {footer && <p className="mt-8 text-sm text-gray-600">{footer}</p>}
    </main>
  );
}

export function AuthLoading({ label }: { label: string }) {
  return (
    <main className="flex justify-center py-24">
      <Spinner className="h-6 w-6 text-primary-700" />
      <span className="sr-only">{label}</span>
    </main>
  );
}

/** フォーム全体のエラー。読み上げにもすぐ伝える */
export function AuthFormError({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <p role="alert" className="mb-5 text-sm leading-relaxed text-red-600">
      {message}
    </p>
  );
}
