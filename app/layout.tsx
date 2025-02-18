import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "专注清单 - 提升工作效率的番茄工作法工具",
  description: "一个简单高效的番茄工作法工具，帮助你提高工作效率，保持专注。支持任务管理、番茄计时、数据统计等功能。",
  keywords: "番茄工作法,时间管理,效率工具,任务管理,专注力,番茄钟",
  authors: [{ name: "fufu" }],
  openGraph: {
    title: "专注清单 - 提升工作效率的番茄工作法工具",
    description: "一个简单高效的番茄工作法工具，帮助你提高工作效率，保持专注。",
    url: "https://todolist.com",
    siteName: "专注清单",
    locale: "zh_CN",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className={inter.className}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
