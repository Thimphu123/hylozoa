export type ProgressStatus = "completed" | "in_progress" | "skipped" | "not_started";

export interface ChapterProgress {
  chapterSlug: string;
  status: ProgressStatus;
  sectionsCompleted: number;
  totalSections: number;
  lastAccessed?: string;
}

export interface SectionProgress {
  sectionIndex: number;
  status: ProgressStatus;
  completedAt?: string;
}

/**
 * Get progress status for a chapter
 */
export function getChapterProgress(chapterSlug: string): ChapterProgress | null {
  if (typeof window === "undefined") return null;
  
  const stored = localStorage.getItem(`chapter-progress-${chapterSlug}`);
  if (!stored) return null;
  
  try {
    return JSON.parse(stored);
  } catch {
    return null;
  }
}

/**
 * Save progress for a chapter
 */
export function saveChapterProgress(progress: ChapterProgress): void {
  if (typeof window === "undefined") return;
  
  progress.lastAccessed = new Date().toISOString();
  localStorage.setItem(`chapter-progress-${progress.chapterSlug}`, JSON.stringify(progress));
}

/**
 * Get progress status for a section
 */
export function getSectionProgress(
  chapterSlug: string,
  sectionIndex: number
): SectionProgress | null {
  if (typeof window === "undefined") return null;
  
  const stored = localStorage.getItem(`section-progress-${chapterSlug}-${sectionIndex}`);
  if (!stored) return null;
  
  try {
    return JSON.parse(stored);
  } catch {
    return null;
  }
}

/**
 * Save progress for a section
 */
export function saveSectionProgress(
  chapterSlug: string,
  sectionIndex: number,
  status: ProgressStatus
): void {
  if (typeof window === "undefined") return;
  
  const progress: SectionProgress = {
    sectionIndex,
    status,
    completedAt: status === "completed" ? new Date().toISOString() : undefined,
  };
  
  localStorage.setItem(
    `section-progress-${chapterSlug}-${sectionIndex}`,
    JSON.stringify(progress)
  );
  
  // Update chapter progress
  updateChapterProgressFromSections(chapterSlug);
}

/**
 * Update chapter progress based on section progress
 */
function updateChapterProgressFromSections(chapterSlug: string): void {
  // This would need to know total sections - would be called from chapter page
  // For now, we'll calculate it when needed
}

/**
 * Get all chapter progress
 */
export function getAllChapterProgress(): Record<string, ChapterProgress> {
  if (typeof window === "undefined") return {};
  
  const progress: Record<string, ChapterProgress> = {};
  
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key?.startsWith("chapter-progress-")) {
      const slug = key.replace("chapter-progress-", "");
      try {
        const data = JSON.parse(localStorage.getItem(key) || "{}");
        progress[slug] = data;
      } catch {
        // Skip invalid entries
      }
    }
  }
  
  return progress;
}

/**
 * Calculate overall progress statistics
 */
export function getOverallProgress(
  totalChapters: number,
  progress: Record<string, ChapterProgress>
): {
  completed: number;
  inProgress: number;
  skipped: number;
  notStarted: number;
  percentage: number;
} {
  const stats = {
    completed: 0,
    inProgress: 0,
    skipped: 0,
    notStarted: 0,
  };
  
  Object.values(progress).forEach((p) => {
    if (p.status === "completed") stats.completed++;
    else if (p.status === "in_progress") stats.inProgress++;
    else if (p.status === "skipped") stats.skipped++;
    else stats.notStarted++;
  });
  
  // Calculate not started from total
  stats.notStarted = totalChapters - Object.keys(progress).length;
  
  const percentage = totalChapters > 0 
    ? Math.round((stats.completed / totalChapters) * 100)
    : 0;
  
  return { ...stats, percentage };
}

