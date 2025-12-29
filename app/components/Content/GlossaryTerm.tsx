"use client";
import React, { useMemo } from "react";

interface GlossaryTermProps {
  word: string;
  definition: string;
}

export default function GlossaryTerm({ word, definition }: GlossaryTermProps) {
  const colors = useMemo(() => [
    { border: "border-red-500/70", bg: "group-hover:bg-red-100 dark:group-hover:bg-red-900/100" },
    { border: "border-orange-500/70", bg: "group-hover:bg-orange-100 dark:group-hover:bg-orange-900/100" },
    { border: "border-yellow-500/70", bg: "group-hover:bg-yellow-100 dark:group-hover:bg-yellow-900/100" },
    { border: "border-green-500/70", bg: "group-hover:bg-green-100 dark:group-hover:bg-green-900/100" },
    { border: "border-blue-500/70", bg: "group-hover:bg-blue-100 dark:group-hover:bg-blue-900/100" },
    { border: "border-purple-500/70", bg: "group-hover:bg-purple-100 dark:group-hover:bg-purple-900/100" },
  ], []);

  // Pick a random color once when the component mounts
  const color = useMemo(() => colors[Math.floor(Math.random() * colors.length)], [colors]);

  return (
    <span className="group relative inline cursor-help">
      <span className={`inline transition-all duration-200 border-b-[3px] border-solid ${color.border} ${color.bg} px-0.5 rounded-t-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-gray-100`}>
        {word}
      </span>
      
      {/* Speech Bubble */}
      <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-64 p-3 
                       bg-gray-100 dark:bg-gray-900 text-dark dark:text-white text-sm rounded-xl shadow-2xl 
                       opacity-0 group-hover:opacity-100 transition-opacity duration-300
                       pointer-events-none z-50 text-center leading-tight font-normal">
        {definition}
        <span className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-gray-100 dark:border-t-gray-900"></span>
      </span>
    </span>
  );
}