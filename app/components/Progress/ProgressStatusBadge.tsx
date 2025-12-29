"use client";

import { ProgressStatus } from "@/lib/progress";

interface ProgressStatusBadgeProps {
  status: ProgressStatus;
  size?: "sm" | "md" | "lg";
}

export default function ProgressStatusBadge({
  status,
  size = "md",
}: ProgressStatusBadgeProps) {
  const sizeClasses = {
    sm: "text-xs px-2 py-1",
    md: "text-sm px-3 py-1.5",
    lg: "text-base px-4 py-2",
  };

  const statusConfig = {
    completed: {
      label: "จบแล้ว",
      icon: "✓",
      className: "bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300",
    },
    in_progress: {
      label: "กำลังอ่าน",
      icon: "→",
      className: "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300",
    },
    skipped: {
      label: "ข้าม",
      icon: "⊘",
      className: "bg-gray-100 dark:bg-red-900 text-red-700 dark:text-red-300",
    },
    not_started: {
      label: "ยังไม่ได้เริ่ม",
      icon: "○",
      className: "bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-500",
    },
  };

  const config = statusConfig[status];

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-medium ${config.className} ${sizeClasses[size]}`}
    >
      <span>{config.icon}</span>
      <span>{config.label}</span>
    </span>
  );
}

