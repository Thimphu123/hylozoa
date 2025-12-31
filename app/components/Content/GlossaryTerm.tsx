"use client";
import React, { useMemo } from "react";
import { useHighlightSettings } from "@/app/contexts/HighlightSettingsContext";

interface GlossaryTermProps {
  word: string;
  definition: string;
  index?: number; // For density control
}

export default function GlossaryTerm({ word, definition, index = 0 }: GlossaryTermProps) {
  const { settings, shouldHighlight } = useHighlightSettings();

  // Check if this term should be highlighted based on density
  if (!shouldHighlight(index)) {
    return <span className="text-gray-700 dark:text-gray-300">{word}</span>;
  }

  // Color selection based on settings
  const colorClasses = useMemo(() => {
    // Random color (default)
    const colors = [
        { border: "border-red-500/70", bg: "group-hover:bg-red-100 dark:group-hover:bg-red-900/100" },
        { border: "border-orange-500/70", bg: "group-hover:bg-orange-100 dark:group-hover:bg-orange-900/100" },
        { border: "border-yellow-500/70", bg: "group-hover:bg-yellow-100 dark:group-hover:bg-yellow-900/100" },
        { border: "border-green-500/70", bg: "group-hover:bg-green-100 dark:group-hover:bg-green-900/100" },
        { border: "border-blue-500/70", bg: "group-hover:bg-blue-100 dark:group-hover:bg-blue-900/100" },
        { border: "border-purple-500/70", bg: "group-hover:bg-purple-100 dark:group-hover:bg-purple-900/100" },
      ];
    if (settings.color === "red") {
      return colors[0];
    }
    if (settings.color === "orange") {
      return colors[1];
    }
    if (settings.color === "yellow") {
        return colors[2];
    }
    if (settings.color === "green") {
        return colors[3];
    }
    if (settings.color === "blue") {
        return colors[4];
    }
    if (settings.color === "purple") {
        return colors[5];
    }
    return colors[Math.floor(Math.random() * colors.length)];
  }, [settings.color]);

  // Underline style class
  const underlineStyleClass = useMemo(() => {
    if (settings.underlineStyle === "dotted") return "border-dotted";
    if (settings.underlineStyle === "dashed") return "border-dashed";
    if (settings.underlineStyle === "none") return "border-none";
    return "border-solid";
  }, [settings.underlineStyle]);

  return (
    <span className="group relative inline cursor-help">
      <span className={`inline transition-all duration-200 border-b-[3px] ${underlineStyleClass} ${colorClasses.border} ${colorClasses.bg} px-0.5 rounded-t-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-gray-100`}>
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