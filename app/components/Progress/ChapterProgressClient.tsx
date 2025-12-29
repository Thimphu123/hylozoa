"use client";

import { ReactNode, useEffect, useState } from "react";
import { Chapter } from "@/lib/chapter-data";
import { getChapterProgress, ProgressStatus } from "@/lib/progress";
import ProgressStatusBadge from "./ProgressStatusBadge";

interface ChapterProgressClientProps {
  chapter: Chapter;
  children: ReactNode;
}

export default function ChapterProgressClient({
  chapter,
  children,
}: ChapterProgressClientProps) {
  return <>{children}</>;
}

function Indicator({ chapterSlug }: { chapterSlug: string }) {
  const [status, setStatus] = useState<ProgressStatus | null>(null);

  useEffect(() => {
    const progress = getChapterProgress(chapterSlug);
    setStatus(progress?.status || "not_started");
  }, [chapterSlug]);

  if (!status) return null;

  const icons = {
    completed: "✓",
    in_progress: "→",
    skipped: "⊘",
    not_started: "○",
  };

  const colors = {
    completed: "text-green-600 dark:text-green-400",
    in_progress: "text-blue-600 dark:text-blue-400",
    skipped: "text-gray-400",
    not_started: "text-gray-400",
  };

  return (
    <span className={`text-lg ${colors[status]}`}>{icons[status]}</span>
  );
}

function Badge({ chapterSlug }: { chapterSlug: string }) {
  const [status, setStatus] = useState<ProgressStatus>("not_started");

  useEffect(() => {
    const progress = getChapterProgress(chapterSlug);
    setStatus(progress?.status || "not_started");
  }, [chapterSlug]);

  if (status === "not_started") return null;

  return <ProgressStatusBadge status={status} size="sm" />;
}

ChapterProgressClient.Indicator = Indicator;
ChapterProgressClient.Badge = Badge;

