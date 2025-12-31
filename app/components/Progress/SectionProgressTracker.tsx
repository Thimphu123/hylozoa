"use client";

import { useEffect, useState } from "react";
import { saveSectionProgress, getSectionProgress, ProgressStatus } from "@/lib/progress";
import { saveChapterProgress, getChapterProgress } from "@/lib/progress";

interface SectionProgressTrackerProps {
  chapterSlug: string;
  sectionIndex: number;
  totalSections: number;
}

export default function SectionProgressTracker({
  chapterSlug,
  sectionIndex,
  totalSections,
}: SectionProgressTrackerProps) {
  const [status, setStatus] = useState<ProgressStatus>("not_started");

  useEffect(() => {
    const sectionProgress = getSectionProgress(chapterSlug, sectionIndex);
    setStatus(sectionProgress?.status || "not_started");
  }, [chapterSlug, sectionIndex]);

  const handleStatusChange = (newStatus: ProgressStatus) => {
    setStatus(newStatus);
    saveSectionProgress(chapterSlug, sectionIndex, newStatus);
    
    // Update chapter progress
    const chapterProgress = getChapterProgress(chapterSlug);
    const allSections = Array.from({ length: totalSections }, (_, i) => 
      getSectionProgress(chapterSlug, i)
    );
    
    const completedCount = allSections.filter(s => s?.status === "completed").length;
    const inProgressCount = allSections.filter(s => s?.status === "in_progress").length;
    const skippedCount = allSections.filter(s => s?.status === "skipped").length;
    
    let chapterStatus: ProgressStatus = "not_started";
    if (completedCount === totalSections) {
      chapterStatus = "completed";
    } else if (completedCount + skippedCount === totalSections) {
      chapterStatus = "skipped";
    } else if (inProgressCount > 0 || completedCount > 0) {
      chapterStatus = "in_progress";
    }
    
    if (chapterProgress) {
      saveChapterProgress({
        ...chapterProgress,
        status: chapterStatus,
        sectionsCompleted: completedCount,
        totalSections,
      });
    } else {
      saveChapterProgress({
        chapterSlug,
        status: chapterStatus,
        sectionsCompleted: completedCount,
        totalSections,
      });
    }

    // Dispatch custom event to notify ProgressTracker
    const event = new CustomEvent("sectionProgressChanged", {
      detail: { chapterSlug, sectionIndex, newStatus }
    });
    window.dispatchEvent(event);
  };

  return (
    <div className="flex items-center gap-2 mt-4 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
        ความคืบหน้า :
      </span>
      <div className="flex gap-2">
        {(["not_started", "in_progress", "completed", "skipped"] as ProgressStatus[]).map(
          (s) => (
            <button
              key={s}
              onClick={() => handleStatusChange(s)}
              className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                status === s
                  ? s === "completed"
                    ? "bg-green-500 dark:bg-green-700 text-white"
                    : s === "in_progress"
                    ? "bg-blue-500 dark:bg-blue-700 text-white"
                    : s === "skipped"
                    ? "bg-red-500 dark:bg-red-700 text-white"
                    : "bg-gray-300 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  : "bg-gray-200 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-300 dark:hover:bg-gray-700"
              }`}
            >
              {s === "completed" && "✓ จบแล้ว"}
              {s === "in_progress" && "→ กำลังอ่าน"}
              {s === "skipped" && "⊘ ข้าม"}
              {s === "not_started" && "○ ยังไม่ได้เริ่ม"}
            </button>
          )
        )}
      </div>
    </div>
  );
}

