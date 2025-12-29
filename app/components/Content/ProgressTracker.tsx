"use client";

import { useEffect, useState } from "react";

interface ProgressTrackerProps {
  sections: Array<{ title: string }>;
  chapterSlug: string;
}

export default function ProgressTracker({
  sections,
  chapterSlug,
}: ProgressTrackerProps) {
  const [progress, setProgress] = useState(0);

  // useEffect(() => {
  //   const storageKey = `chapter-progress-${chapterSlug}`;
  //   const saved = localStorage.getItem(storageKey);
  //   if (saved) {
  //     setProgress(parseInt(saved, 10));
  //   }
  // }, [chapterSlug]);

  // useEffect(() => {
  //   const handleScroll = () => {
  //     const windowHeight = window.innerHeight;
  //     const documentHeight = document.documentElement.scrollHeight;
  //     const scrollTop = window.scrollY;
  //     const scrollPercent =
  //       (scrollTop / (documentHeight - windowHeight)) * 100;

  //     const newProgress = Math.min(100, Math.max(0, Math.round(scrollPercent)));
  //     setProgress(newProgress);

  //     // Save to localStorage
  //     const storageKey = `chapter-progress-${chapterSlug}`;
  //     localStorage.setItem(storageKey, newProgress.toString());
  //   };

  //   window.addEventListener("scroll", handleScroll);
  //   handleScroll(); // Initial calculation

  //   return () => window.removeEventListener("scroll", handleScroll);
  // }, [chapterSlug]);

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

