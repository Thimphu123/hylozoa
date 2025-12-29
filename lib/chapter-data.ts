export interface Annotation {
  position: [number, number, number];
  label: string;
  description?: string;
}

export interface Model {
  path: string;
  title?: string;
  description?: string;
  annotations?: Annotation[];
}

export interface Section {
  title: string;
  content?: string;
  models?: Model[];
}

export interface Chapter {
  slug: string;
  title: string;
  description?: string;
  order: number;
  sections?: Section[];
}

import fs from "fs";
import path from "path";

// Placeholder data - will be replaced after PDF analysis
let chapters: Chapter[] = [];

const chaptersFilePath = path.join(process.cwd(), "data", "chapters", "chapters.json");

/**
 * Load chapters from JSON file or return cached data
 */
async function loadChapters(): Promise<Chapter[]> {
  try {
    if (fs.existsSync(chaptersFilePath)) {
      const fileContent = fs.readFileSync(chaptersFilePath, "utf-8");
      chapters = JSON.parse(fileContent);
    }
  } catch (error) {
    console.warn("Could not load chapters from file:", error);
  }
  return chapters;
}

export async function getChapters(): Promise<Chapter[]> {
  // Load from file if available
  const loadedChapters = await loadChapters();
  return loadedChapters.sort((a, b) => a.order - b.order);
}

export async function getChapterBySlug(slug: string): Promise<Chapter | null> {
  const chapters = await getChapters();
  return chapters.find((chapter) => chapter.slug === slug) || null;
}

/**
 * Save chapters to JSON file
 */
export async function saveChapters(chaptersToSave: Chapter[]): Promise<void> {
  chapters = chaptersToSave;
  
  // Ensure directory exists
  const dir = path.dirname(chaptersFilePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  
  // Save to file
  fs.writeFileSync(chaptersFilePath, JSON.stringify(chapters, null, 2), "utf-8");
}

