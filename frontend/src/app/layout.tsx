import type { Metadata } from "next";
import { Noto_Sans_JP, Zen_Kaku_Gothic_New } from "next/font/google";
import "./globals.css";
import { Providers } from "./provider";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { InAppNavigationTracker } from "@/components/common/InAppNavigationTracker";

const notoSansJP = Noto_Sans_JP({
  variable: "--font-noto-sans-jp",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  display: "swap",
});

const zenKaku = Zen_Kaku_Gothic_New({
  variable: "--font-zen-kaku",
  subsets: ["latin"],
  weight: ["700", "900"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Spotee | スポット共有サービス",
    template: "%s | Spotee",
  },
  description: "すべての人が、次の行きたい場所に出会えるサービス",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body
        className={`${notoSansJP.variable} ${zenKaku.variable} flex min-h-screen flex-col font-sans antialiased`}
      >
        <Providers>
          <InAppNavigationTracker />
          <Header />
          <div className="flex-1">{children}</div>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
