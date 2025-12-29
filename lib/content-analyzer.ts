import { PDFPage, PDFChapter } from "./pdf-parser";
import { Chapter, Section, Model } from "./chapter-data";

/**
 * Identify concepts that would benefit from 3D visualization
 */
export function identify3DConcepts(text: string): string[] {
  const concepts: string[] = [];
  
  // Keywords that suggest 3D structures
  const structureKeywords = [
    "structure",
    "anatomy",
    "morphology",
    "shape",
    "form",
    "arrangement",
    "organization",
    "layout",
    "configuration",
    "architecture",
  ];

  const biologicalKeywords = [
    "cell",
    "molecule",
    "protein",
    "DNA",
    "RNA",
    "organ",
    "tissue",
    "organism",
    "bone",
    "muscle",
    "nerve",
    "membrane",
    "organelle",
  ];

  const actionKeywords = [
    "interaction",
    "binding",
    "folding",
    "assembly",
    "process",
    "mechanism",
    "function",
  ];

  // Simple pattern matching - can be enhanced with NLP
  const lowerText = text.toLowerCase();
  
  structureKeywords.forEach((keyword) => {
    if (lowerText.includes(keyword)) {
      biologicalKeywords.forEach((bioKeyword) => {
        if (lowerText.includes(bioKeyword)) {
          // Extract potential concept (simplified)
          const concept = `${bioKeyword} ${keyword}`;
          if (!concepts.includes(concept)) {
            concepts.push(concept);
          }
        }
      });
    }
  });

  return concepts;
}

/**
 * Convert PDF chapters to website chapter format
 */
export function convertPDFChaptersToChapters(
  pdfChapters: PDFChapter[]
): Chapter[] {
  return pdfChapters.map((pdfChapter, index) => {
    // Create slug from title
    const slug = pdfChapter.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

    // Identify sections within chapter (simplified - looks for numbered sections)
    const sections: Section[] = [];
    const sectionPattern = /^\d+\.\d*\s+[A-Z]/;
    
    pdfChapter.pages.forEach((page) => {
      const lines = page.text.split("\n");
      let currentSection: Section | null = null;

      lines.forEach((line) => {
        const trimmedLine = line.trim();
        
        if (sectionPattern.test(trimmedLine) && trimmedLine.length < 150) {
          // Save previous section
          if (currentSection) {
            sections.push(currentSection);
          }

          // Start new section
          currentSection = {
            title: trimmedLine,
            content: "",
            models: [],
          };
        } else if (currentSection) {
          // Add to current section
          currentSection.content += line + "\n";
        }
      });

      // Save final section
      if (currentSection) {
        sections.push(currentSection);
      }
    });

    // If no sections found, create one section for the whole chapter
    if (sections.length === 0) {
      const fullContent = pdfChapter.pages
        .map((p) => p.text)
        .join("\n\n");
      
      // Identify 3D concepts
      const concepts = identify3DConcepts(fullContent);
      const models: Model[] = concepts.map((concept, idx) => ({
        path: `/models/${slug}-${idx + 1}.glb`, // Placeholder path
        title: concept,
        description: `3D model of ${concept}`,
      }));

      sections.push({
        title: "Introduction",
        content: fullContent.substring(0, 1000) + "...", // Limit content length
        models: models.length > 0 ? models : undefined,
      });
    } else {
      // Add 3D concepts to each section
      sections.forEach((section) => {
        if (section.content) {
          const concepts = identify3DConcepts(section.content);
          if (concepts.length > 0) {
            section.models = concepts.map((concept, idx) => ({
              path: `/models/${slug}-section-${sections.indexOf(section)}-${idx + 1}.glb`,
              title: concept,
              description: `3D model of ${concept}`,
            }));
          }
        }
      });
    }

    return {
      slug,
      title: pdfChapter.title,
      description: `Chapter ${index + 1}: ${pdfChapter.title}`,
      order: index + 1,
      sections: sections.length > 0 ? sections : undefined,
    };
  });
}

/**
 * Analyze content and suggest 3D models needed
 */
export function analyzeContentForModels(chapters: Chapter[]): {
  suggestedModels: Array<{
    concept: string;
    chapters: string[];
    priority: "high" | "medium" | "low";
  }>;
} {
  const modelMap = new Map<string, string[]>();

  chapters.forEach((chapter) => {
    chapter.sections?.forEach((section) => {
      section.models?.forEach((model) => {
        if (model.title) {
          const existing = modelMap.get(model.title) || [];
          if (!existing.includes(chapter.slug)) {
            existing.push(chapter.slug);
            modelMap.set(model.title, existing);
          }
        }
      });
    });
  });

  const suggestedModels = Array.from(modelMap.entries()).map(([concept, chapters]) => ({
    concept,
    chapters,
    priority: (chapters.length > 2 ? "high" : chapters.length > 1 ? "medium" : "low") as "high" | "medium" | "low",
  }));

  return { suggestedModels };
}

