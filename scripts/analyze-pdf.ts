import { parsePDF, extractChapters, saveChaptersToJSON } from "../lib/pdf-parser";
import path from "path";
import fs from "fs";

/**
 * Script to analyze the PDF and extract chapter structure
 * Run with: npx tsx scripts/analyze-pdf.ts
 */

async function main() {
  const pdfPath = path.join(process.cwd(), "prototype.pdf");
  const outputPath = path.join(process.cwd(), "data", "chapters", "extracted.json");

  console.log("Starting PDF analysis...");
  console.log(`Reading PDF from: ${pdfPath}`);

  try {
    // Check if PDF exists
    if (!fs.existsSync(pdfPath)) {
      console.error(`PDF file not found at: ${pdfPath}`);
      process.exit(1);
    }

    // Parse PDF
    console.log("Parsing PDF...");
    const pages = await parsePDF(pdfPath);
    console.log(`Extracted ${pages.length} pages`);

    // Extract chapters
    console.log("Extracting chapters...");
    const chapters = extractChapters(pages);
    console.log(`Found ${chapters.length} chapters`);

    // Display chapter summary
    chapters.forEach((chapter, index) => {
      console.log(
        `Chapter ${index + 1}: ${chapter.title} (pages ${chapter.startPage}-${chapter.endPage})`
      );
    });

    // Save to JSON
    console.log(`Saving to: ${outputPath}`);
    await saveChaptersToJSON(chapters, outputPath);
    console.log("Analysis complete!");
  } catch (error) {
    console.error("Error during PDF analysis:", error);
    process.exit(1);
  }
}

main();

