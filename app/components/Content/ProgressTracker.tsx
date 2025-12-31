"use client";

import { useEffect, useState, useCallback } from "react";
import { getSectionProgress } from "@/lib/progress"

interface ProgressTrackerProps {
  sections: Array<{ title: string }>;
  chapterSlug: string;
}

export default function ProgressTracker({
  sections,
  chapterSlug,
}: ProgressTrackerProps) {
  const [progress, setProgress] = useState(0);

  const calculateProgress = useCallback(() => {
    const totalSections = sections.length;
    if (totalSections === 0) {
      setProgress(0);
      return;
    }

    // Count completed sections
    let completedCount = 0;
    for (let i = 0; i < totalSections; i++) {
      const sectionProgress = getSectionProgress(chapterSlug, i);
      if (sectionProgress?.status === "completed") {
        completedCount++;
      }
    }

    // Calculate percentage
    const progressPercent = Math.round((completedCount / totalSections) * 100);
    setProgress(progressPercent);
  }, [chapterSlug, sections.length]);

  useEffect(() => {
    // Calculate initial progress
    calculateProgress();

    // Listen for custom event when section status changes
    const handleSectionStatusChange = (event: CustomEvent) => {
      if (event.detail?.chapterSlug === chapterSlug) {
        calculateProgress();
      }
    };

    // Listen for storage changes (fallback)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key?.startsWith(`section-progress-${chapterSlug}-`)) {
        calculateProgress();
      }
    };

    window.addEventListener("sectionProgressChanged" as any, handleSectionStatusChange);
    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("sectionProgressChanged" as any, handleSectionStatusChange);
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [chapterSlug, calculateProgress]);

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
          ความคืบหน้า
        </span>
        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
          {progress}%
        </span>
      </div>
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
        <div
          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}

