"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Chapter } from "@/lib/chapter-data";
import { getChapterProgress, ProgressStatus } from "@/lib/progress";

interface SidebarProps {
  chapters: Chapter[];
}

function getStatusIcon(status: ProgressStatus | null) {
  switch (status) {
    case "completed":
      return <span className="text-green-600 dark:text-green-400">✓</span>;
    case "in_progress":
      return <span className="text-blue-600 dark:text-blue-400">→</span>;
    case "skipped":
      return <span className="text-red-600 dark:text-red-400">⊘</span>;
    default:
      return <span className="text-gray-400">○</span>;
  }
}

export default function Sidebar({ chapters }: SidebarProps) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(true);

  // Only show sidebar on chapter pages
  const isChapterPage = pathname.startsWith("/chapters");
  
  if (!isChapterPage) return null;

  return (
    <aside
      className={`${
        isOpen ? "w-64" : "w-16"
      } hidden lg:block bg-white dark:bg-gray-950 border-r border-gray-200 dark:border-gray-800 fixed left-0 top-16 h-[calc(100vh-4rem)] overflow-y-auto transition-all duration-300 z-40`}
    >
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className={`font-semibold text-gray-900 dark:text-gray-100 ${!isOpen && "hidden"}`}>
            บทเรียน
          </h2>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
            aria-label={isOpen ? "Collapse sidebar" : "Expand sidebar"}
          >
            <svg
              className="w-5 h-5 text-gray-600 dark:text-gray-400"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              {isOpen ? (
                <path d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
              ) : (
                <path d="M13 5l7 7-7 7M5 5l7 7-7 7" />
              )}
            </svg>
          </button>
        </div>

        <nav className="space-y-1">
          {chapters.map((chapter) => {
            const isActive = pathname === `/chapters/${chapter.slug}`;
            const progress = getChapterProgress(chapter.slug);
            const status = progress?.status || "not_started";

            return (
              <Link
                key={chapter.slug}
                href={`/chapters/${chapter.slug}`}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                  isActive
                    ? "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 font-medium"
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                }`}
              >
                <span className="flex-shrink-0 w-5 text-center">
                  {getStatusIcon(status)}
                </span>
                {isOpen && (
                  <span className="flex-1 truncate text-sm">{chapter.title}</span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}

