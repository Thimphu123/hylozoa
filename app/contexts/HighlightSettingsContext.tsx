"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type HighlightDensity = "none" | "low" | "medium";
export type UnderlineStyle = "solid" | "dotted" | "dashed" | "none";
export type HighlightColor = "red" | "orange" | "yellow" | "green" | "blue" | "purple" | "random";

interface HighlightSettings {
  density: HighlightDensity;
  underlineStyle: UnderlineStyle;
  color: HighlightColor;
}

interface HighlightSettingsContextType {
  settings: HighlightSettings;
  updateSettings: (settings: Partial<HighlightSettings>) => void;
  shouldHighlight: (index: number) => boolean; // For density control
}

const defaultSettings: HighlightSettings = {
  density: "medium",
  underlineStyle: "solid",
  color: "random",
};

const HighlightSettingsContext = createContext<HighlightSettingsContextType | undefined>(undefined);

export function HighlightSettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<HighlightSettings>(defaultSettings);
  const [mounted, setMounted] = useState(false);

  // Load settings from localStorage on mount
  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem("highlightSettings");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setSettings({ ...defaultSettings, ...parsed });
      } catch (e) {
        console.error("Failed to parse highlight settings:", e);
      }
    }
  }, []);

  // Save settings to localStorage whenever they change (only after mount)
  useEffect(() => {
    if (mounted) {
      localStorage.setItem("highlightSettings", JSON.stringify(settings));
    }
  }, [settings, mounted]);

  const updateSettings = (newSettings: Partial<HighlightSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  };

  // Determine if a term should be highlighted based on density
  const shouldHighlight = (index: number): boolean => {
    if (settings.density === "none") return false;
    if (settings.density === "medium") return true;
    // For "low", highlight every other term (50%)
    return index % 2 === 0;
  };

  // Always provide the context, even before mount (uses defaultSettings)
  return (
    <HighlightSettingsContext.Provider value={{ settings, updateSettings, shouldHighlight }}>
      {children}
    </HighlightSettingsContext.Provider>
  );
}

export function useHighlightSettings() {
  const context = useContext(HighlightSettingsContext);
  if (context === undefined) {
    throw new Error("useHighlightSettings must be used within a HighlightSettingsProvider");
  }
  return context;
}

