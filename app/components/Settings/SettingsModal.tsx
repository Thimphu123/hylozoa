"use client";

import { useState, useEffect, useRef } from "react";
import { useHighlightSettings, HighlightDensity, UnderlineStyle, HighlightColor } from "@/app/contexts/HighlightSettingsContext";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const { settings, updateSettings } = useHighlightSettings();
  const modalRef = useRef<HTMLDivElement>(null);

  // Close modal when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  // Close on Escape key
  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div
        ref={modalRef}
        className="bg-white dark:bg-gray-900 rounded-lg shadow-xl w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">การตั้งค่า</h2>
          <button
            onClick={onClose}
            className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
            aria-label="Close settings"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Highlight Density */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
              ความหนาแน่นของการเน้นคำ
            </label>
            <div className="space-y-2">
              {(["none", "low", "medium"] as HighlightDensity[]).map((density) => (
                <label
                  key={density}
                  className="flex items-center p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors"
                >
                  <input
                    type="radio"
                    name="density"
                    value={density}
                    checked={settings.density === density}
                    onChange={() => updateSettings({ density })}
                    className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-3 text-gray-700 dark:text-gray-300">
                    {density === "none" && "ปิดการเน้นคำ"}
                    {density === "low" && "ต่ำ (50%)"}
                    {density === "medium" && "สูง (100%) (ค่าเริ่มต้น)"}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Underline Style */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
              รูปแบบเส้นขีด
            </label>
            <div className="space-y-2">
              {(["solid", "dotted", "dashed", "none"] as UnderlineStyle[]).map((style) => (
                <label
                  key={style}
                  className="flex items-center p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors"
                >
                  <input
                    type="radio"
                    name="underlineStyle"
                    value={style}
                    checked={settings.underlineStyle === style}
                    onChange={() => updateSettings({ underlineStyle: style })}
                    className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-3 text-gray-700 dark:text-gray-300 flex items-center">
                    {style === "solid" && "เส้นทึบ (ค่าเริ่มต้น)"}
                    {style === "dotted" && "เส้นจุด"}
                    {style === "dashed" && "เส้นประ"}
                    {style === "none" && "ไม่มีเส้น"}
                    <span className={`ml-2 border-b-2 ${style === "solid" ? "border-solid" : style === "dotted" ? "border-dotted" : style === "none" ? "border-none" : "border-dashed"} border-blue-500 w-16`}></span>
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Highlight Color */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
              สีการเน้นคำ
            </label>
            <div className="space-y-2">
              {(["red", "orange", "yellow", "green", "blue", "purple", "random"] as HighlightColor[]).map((color) => (
                <label
                  key={color}
                  className="flex items-center p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors"
                >
                  <input
                    type="radio"
                    name="color"
                    value={color}
                    checked={settings.color === color}
                    onChange={() => updateSettings({ color })}
                    className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-3 text-gray-700 dark:text-gray-300 flex items-center">
                    {color === "red" && "สีแดง"}
                    {color === "orange" && "สีส้ม"}
                    {color === "yellow" && "สีเหลือง"}
                    {color === "green" && "สีเขียว"}
                    {color === "blue" && "สีน้ำเงิน"}
                    {color === "purple" && "สีม่วง"}
                    {color === "random" && "สีสุ่ม (ค่าเริ่มต้น)"}
                    {color !== "random" && (
                      <span className={`ml-2 w-6 h-6 rounded border border-gray-300 dark:border-gray-600 ${color === "red" ? "bg-red-500" : color == "orange" ? "bg-orange-500" : color === "yellow" ? "bg-yellow-500" : color === "green" ? "bg-green-500" : color === "blue" ? "bg-blue-500" : "bg-purple-500"}`}></span>
                    )}
                  </span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            ปิด
          </button>
        </div>
      </div>
    </div>
  );
}

