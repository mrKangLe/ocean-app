import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Block5BottomNav from "@/components/home/Block5BottomNav";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ocean.app",
  description: "Ứng dụng nội khu cư dân",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="vi"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-slate-900">
        {/* Khung ứng dụng cố định max-width chuẩn giao diện mobile */}
        <main className="max-w-md mx-auto min-h-screen bg-white w-full relative pb-20 shadow-2xl overflow-x-hidden">
          
          {/* Nội dung trang (Children) */}
          <div className="w-full">
            {children}
          </div>

          {/* Footer Navigation chung cho toàn bộ app */}
          <Block5BottomNav />

        </main>
      </body>
    </html>
  );
}