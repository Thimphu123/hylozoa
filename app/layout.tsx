import type { Metadata } from "next";
import { Kanit } from "next/font/google"; // 1. Import Kanit
import "./globals.css";
import Navigation from "@/app/components/Navigation/Navigation";
import Sidebar from "@/app/components/Navigation/Sidebar";
import { getChapters } from "@/lib/chapter-data";

// 2. Configure Kanit
const kanit = Kanit({
  weight: ["300", "400", "500", "600"], // Regular, Medium, and Bold weights
  subsets: ["latin", "thai"],           // Essential for Thai language support
  variable: "--font-kanit",             // CSS variable name
});

export const metadata: Metadata = {
  title: {
    default: "Hylozoa - เรียนรู้ชีววิทยาแบบอินเทอร์แอคทีฟ",
    template: "%s | Hylozoa",
  },
  description: "เรียนชีววิทยาด้วยเนื้อหาที่สรุปออกมาให้ง่ายต่อการเข้าใจ พร้อมโมเดล 3 มิติและสื่อประกอบ",
  keywords: ["ชีววิทยา", "การเรียนรู้", "โมเดล 3 มิติ", "เรียนรู้แบบอินเทอร์แอคทีฟ", "หนังสือชีววิทยา", "เรียนแบบมีภาพประกอบ", "เข้าใจง่าย"],
  authors: [{ name: "Hylozoa" }],
  creator: "Hylozoa",
  openGraph: {
    type: "website",
    locale: "th_TH",
    url: "https://hylozoa.vercel.app",
    siteName: "Hylozoa",
    title: "Hylozoa - เรียนรู้ชีววิทยาแบบอินเทอร์แอคทีฟ",
    description: "เรียนชีววิทยาด้วยเนื้อหาที่สรุปออกมาให้ง่ายต่อการเข้าใจ พร้อมโมเดล 3 มิติและสื่อประกอบ",
  },
  twitter: {
    card: "summary_large_image",
    title: "Hylozoa - เรียนรู้ชีววิทยาแบบอินเทอร์แอคทีฟ",
    description: "เรียนชีววิทยาด้วยเนื้อหาที่สรุปออกมาให้ง่ายต่อการเข้าใจ พร้อมโมเดล 3 มิติและสื่อประกอบ",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const chapters = await getChapters();

  return (
    <html lang="th" className={kanit.variable}>
      <body className="antialiased font-sans">
        <div className="prose min-h-screen flex flex-col">
          <Navigation />
          <div className="flex flex-1 relative">
            <Sidebar chapters={chapters} />
            <main className="flex-1">{children}</main>
          </div>
          <footer className="border-t border-gray-200 dark:border-gray-800 py-4 px-6 text-center text-sm text-gray-600 dark:text-gray-400">
            <p>Hylozoa - ทำให้ชีววิทยาเป็นเรื่องง่าย</p>
          </footer>
        </div>
      </body>
    </html>
  );
}

