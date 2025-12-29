"use client";

import Link from "next/link";
import { Chapter } from "@/lib/chapter-data";
import { getChapterProgress, ProgressStatus } from "@/lib/progress";
import { useEffect, useState } from "react";
import ProgressStatusBadge from "./ProgressStatusBadge";

interface ChapterCardProps {
  chapter: Chapter;
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

export default function ChapterCard({ chapter }: ChapterCardProps) {
  const [status, setStatus] = useState<ProgressStatus | null>(null);

  useEffect(() => {
    const progress = getChapterProgress(chapter.slug);
    setStatus(progress?.status || "not_started");
  }, [chapter.slug]);

  return (
    <Link
      href={`/chapters/${chapter.slug}`}
      className="block bg-white dark:bg-gray-900 p-6 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-shadow duration-200 h-full flex flex-col"
    >
      <div className="flex items-start justify-between mb-3">
        <h2 className="text-xl font-semibold flex-1">{chapter.title}</h2>
        <span className="flex-shrink-0 ml-2 text-lg">
          {getStatusIcon(status)}
        </span>
      </div>
      {chapter.description && (
        <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-3 flex-1">
          {chapter.description}
        </p>
      )}
      <div className="flex items-center justify-between mt-auto">
        <div className="text-blue-600 dark:text-blue-400 text-sm font-medium">
          อ่านบทเรียน →
        </div>
        {status && status !== "not_started" && (
          <ProgressStatusBadge status={status} size="sm" />
        )}
      </div>
    </Link>
  );
}

