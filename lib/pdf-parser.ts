import fs from "fs";
import path from "path";
import pdfParse from "pdf-parse";

export interface PDFPage {
  pageNumber: number;
  text: string;
}

export interface PDFChapter {
  title: string;
  pages: PDFPage[];
  startPage: number;
  endPage: number;
}

/**
 * Parse PDF file and extract text content
 * @param pdfPath Path to the PDF file
 * @param options Options for parsing (maxPages for limiting, startPage, endPage for range)
 * @returns Array of pages with text content
 */
export async function parsePDF(
  pdfPath: string,
  options?: { maxPages?: number; startPage?: number; endPage?: number }
): Promise<PDFPage[]> {
  try {
    console.log(`Reading PDF file: ${pdfPath}`);
    const stats = fs.statSync(pdfPath);
    console.log(`File size: ${(stats.size / 1024 / 1024).toFixed(2)} MB`);

    const dataBuffer = fs.readFileSync(pdfPath);
    console.log("Parsing PDF content...");
    const data = await pdfParse(dataBuffer, {
      max: options?.maxPages,
    });

    console.log(`Total pages in PDF: ${data.numpages}`);
    console.log(`Extracted text length: ${data.text.length} characters`);

    // Split by pages using page numbers from pdf-parse
    const pages: PDFPage[] = [];
    
    // pdf-parse provides numpages, but text might not be perfectly split
    // Try to split by form feed or estimate pages
    const textPerPage = data.text.split(/\f/);
    
    // If we have a good split, use it; otherwise estimate based on numpages
    if (textPerPage.length > 1 && Math.abs(textPerPage.length - data.numpages) < data.numpages * 0.2) {
      textPerPage.forEach((text, index) => {
        const pageNum = index + 1;
        if (
          (!options?.startPage || pageNum >= options.startPage) &&
          (!options?.endPage || pageNum <= options.endPage)
        ) {
          pages.push({
            pageNumber: pageNum,
            text: text.trim(),
          });
        }
      });
    } else {
      // Estimate page breaks by dividing text equally
      const avgCharsPerPage = Math.ceil(data.text.length / data.numpages);
      for (let i = 0; i < data.numpages; i++) {
        const start = i * avgCharsPerPage;
        const end = Math.min((i + 1) * avgCharsPerPage, data.text.length);
        const pageNum = i + 1;
        
        if (
          (!options?.startPage || pageNum >= options.startPage) &&
          (!options?.endPage || pageNum <= options.endPage)
        ) {
          pages.push({
            pageNumber: pageNum,
            text: data.text.substring(start, end).trim(),
          });
        }
      }
    }

    console.log(`Extracted ${pages.length} pages`);
    return pages;
  } catch (error) {
    console.error("Error parsing PDF:", error);
    if (error instanceof Error) {
      if (error.message.includes("memory") || error.message.includes("too large")) {
        throw new Error(
          "PDF is too large to parse in one go. Consider using options to parse in chunks."
        );
      }
    }
    throw error;
  }
}

/**
 * Extract chapters from PDF text
 * This is a basic implementation - may need refinement based on actual PDF structure
 */
export function extractChapters(pages: PDFPage[]): PDFChapter[] {
  const chapters: PDFChapter[] = [];
  let currentChapter: PDFChapter | null = null;

  // Common chapter patterns
  const chapterPatterns = [
    /^Chapter\s+\d+/i,
    /^Chapter\s+[IVX]+/i,
    /^\d+\.\s+[A-Z]/,
    /^[A-Z][a-z]+\s+\d+/,
  ];

  pages.forEach((page, index) => {
    const lines = page.text.split("\n");
    
    for (const line of lines) {
      const trimmedLine = line.trim();
      
      // Check if this line matches a chapter heading
      const isChapterHeading = chapterPatterns.some((pattern) =>
        pattern.test(trimmedLine)
      );

      if (isChapterHeading && trimmedLine.length < 100) {
        // Save previous chapter if exists
        if (currentChapter) {
          currentChapter.endPage = page.pageNumber - 1;
          chapters.push(currentChapter);
        }

        // Start new chapter
        currentChapter = {
          title: trimmedLine,
          pages: [],
          startPage: page.pageNumber,
          endPage: page.pageNumber,
        };
        break;
      }
    }

    // Add page to current chapter
    if (currentChapter) {
      currentChapter.pages.push(page);
      currentChapter.endPage = page.pageNumber;
    }
  });

  // Add final chapter
  if (currentChapter) {
    chapters.push(currentChapter);
  }

  return chapters;
}

/**
 * Save extracted chapters to JSON file
 */
export async function saveChaptersToJSON(
  chapters: PDFChapter[],
  outputPath: string
): Promise<void> {
  const jsonData = JSON.stringify(chapters, null, 2);
  fs.writeFileSync(outputPath, jsonData, "utf-8");
}

