"use client";

import { useEffect, useState } from "react";
import { Chapter } from "@/lib/chapter-data";
import { getAllChapterProgress, getOverallProgress } from "@/lib/progress";
import ProgressStatusBadge from "./ProgressStatusBadge";
import Link from "next/link";

interface ProgressDashboardProps {
  chapters: Chapter[];
}

export default function ProgressDashboard({ chapters }: ProgressDashboardProps) {
  const [progress, setProgress] = useState<Record<string, any>>({});
  const [overall, setOverall] = useState({
    completed: 0,
    inProgress: 0,
    skipped: 0,
    notStarted: 0,
    percentage: 0,
  });

  useEffect(() => {
    const allProgress = getAllChapterProgress();
    setProgress(allProgress);
    setOverall(getOverallProgress(chapters.length, allProgress));
  }, [chapters.length]);

  const inProgressChapters = chapters.filter(
    (ch) => progress[ch.slug]?.status === "in_progress"
  );

  const completedChapters = chapters.filter(
    (ch) => progress[ch.slug]?.status === "completed"
  );

  return (
    <div className="space-y-6">
      {/* Overall Statistics */}
      <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100">ภาพรวมความคืบหน้า</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600 dark:text-green-400">
              {overall.completed}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">จบแล้ว</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
              {overall.inProgress}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">กำลังอ่าน</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-red-600 dark:text-red-400">{overall.skipped}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">ข้าม</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-gray-500">{overall.notStarted}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">ยังไม่ได้เริ่ม</div>
          </div>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
          <div
            className="bg-blue-600 h-3 rounded-full transition-all duration-300"
            style={{ width: `${overall.percentage}%` }}
          />
        </div>
        <div className="text-center mt-2 text-sm text-gray-600 dark:text-gray-400">
          {overall.percentage}% Complete
        </div>
      </div>

      {/* Continue Learning */}
      {inProgressChapters.length > 0 && (
        <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">เรียนต่อ</h2>
          <div className="space-y-2">
            {inProgressChapters.slice(0, 3).map((chapter) => (
              <Link
                key={chapter.slug}
                href={`/chapters/${chapter.slug}`}
                className="block p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium">{chapter.title}</span>
                  <ProgressStatusBadge status="in_progress" size="sm" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Recently Completed */}
      {completedChapters.length > 0 && (
        <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">เพิ่งจบไป</h2>
          <div className="space-y-2">
            {completedChapters
              .slice(-3)
              .reverse()
              .map((chapter) => (
                <Link
                  key={chapter.slug}
                  href={`/chapters/${chapter.slug}`}
                  className="block p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{chapter.title}</span>
                    <ProgressStatusBadge status="completed" size="sm" />
                  </div>
                </Link>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}

