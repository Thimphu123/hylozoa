import { parsePDF, extractChapters, saveChaptersToJSON } from "../lib/pdf-parser";
import { convertPDFChaptersToChapters, analyzeContentForModels } from "../lib/content-analyzer";
import { saveChapters } from "../lib/chapter-data";
import path from "path";
import fs from "fs";

/**
 * Chunked PDF analysis script for very large PDFs
 * Processes PDF in chunks to avoid memory issues
 * Run with: npx tsx scripts/analyze-pdf-chunked.ts
 */

const CHUNK_SIZE = 50; // Process 50 pages at a time

async function main() {
  const pdfPath = path.join(process.cwd(), "prototype.pdf");
  const outputPath = path.join(process.cwd(), "data", "chapters", "extracted.json");
  const chaptersOutputPath = path.join(process.cwd(), "data", "chapters", "chapters.json");

  console.log("=".repeat(60));
  console.log("Chunked PDF Analysis Tool");
  console.log("=".repeat(60));
  console.log(`Reading PDF from: ${pdfPath}\n`);

  try {
    // Check if PDF exists
    if (!fs.existsSync(pdfPath)) {
      console.error(`❌ PDF file not found at: ${pdfPath}`);
      process.exit(1);
    }

    // First, try to get total page count
    console.log("Step 1: Getting PDF metadata...");
    let totalPages = 1000; // Default estimate
    try {
      const samplePages = await parsePDF(pdfPath, { maxPages: 1 });
      // pdf-parse doesn't directly give page count, so we'll process in chunks
      console.log("✅ PDF file found\n");
    } catch (error) {
      console.error("Error reading PDF:", error);
      process.exit(1);
    }

    // Process in chunks
    console.log(`Step 2: Processing PDF in chunks of ${CHUNK_SIZE} pages...`);
    const allPages: any[] = [];
    let startPage = 1;
    let chunkNumber = 1;

    while (true) {
      try {
        console.log(`\nProcessing chunk ${chunkNumber} (pages ${startPage}-${startPage + CHUNK_SIZE - 1})...`);
        const chunkPages = await parsePDF(pdfPath, {
          startPage,
          endPage: startPage + CHUNK_SIZE - 1,
        });

        if (chunkPages.length === 0) {
          console.log("No more pages to process.");
          break;
        }

        allPages.push(...chunkPages);
        console.log(`✅ Processed ${chunkPages.length} pages in chunk ${chunkNumber}`);

        // Check if we got fewer pages than requested (end of PDF)
        if (chunkPages.length < CHUNK_SIZE) {
          console.log("Reached end of PDF.");
          break;
        }

        startPage += CHUNK_SIZE;
        chunkNumber++;

        // Safety limit to prevent infinite loops
        if (chunkNumber > 100) {
          console.log("⚠️  Reached safety limit of 100 chunks. Stopping.");
          break;
        }
      } catch (error) {
        if (error instanceof Error && error.message.includes("too large")) {
          console.log(`⚠️  Chunk ${chunkNumber} too large. Trying smaller chunk size...`);
          // Try smaller chunks
          const smallerChunk = await parsePDF(pdfPath, {
            startPage,
            endPage: startPage + Math.floor(CHUNK_SIZE / 2) - 1,
          });
          allPages.push(...smallerChunk);
          startPage += Math.floor(CHUNK_SIZE / 2);
          chunkNumber++;
        } else {
          console.error(`Error processing chunk ${chunkNumber}:`, error);
          break;
        }
      }
    }

    console.log(`\n✅ Total pages extracted: ${allPages.length}\n`);

    // Extract chapters
    console.log("Step 3: Extracting chapters...");
    const pdfChapters = extractChapters(allPages);
    console.log(`✅ Found ${pdfChapters.length} chapters\n`);

    // Display chapter summary
    console.log("Chapter Summary:");
    console.log("-".repeat(60));
    pdfChapters.forEach((chapter, index) => {
      console.log(
        `${index + 1}. ${chapter.title} (pages ${chapter.startPage}-${chapter.endPage}, ${chapter.pages.length} pages)`
      );
    });
    console.log("-".repeat(60));
    console.log();

    // Save raw PDF chapters
    console.log("Step 4: Saving extracted PDF chapters...");
    await saveChaptersToJSON(pdfChapters, outputPath);
    console.log(`✅ Saved to: ${outputPath}\n`);

    // Convert to website format
    console.log("Step 5: Converting to website chapter format...");
    const chapters = convertPDFChaptersToChapters(pdfChapters);
    console.log(`✅ Converted ${chapters.length} chapters\n`);

    // Analyze for 3D models
    console.log("Step 6: Analyzing content for 3D models...");
    const { suggestedModels } = analyzeContentForModels(chapters);
    console.log(`✅ Identified ${suggestedModels.length} potential 3D models\n`);

    // Display model suggestions
    if (suggestedModels.length > 0) {
      console.log("Suggested 3D Models (by priority):");
      console.log("-".repeat(60));
      const highPriority = suggestedModels.filter((m) => m.priority === "high");
      const mediumPriority = suggestedModels.filter((m) => m.priority === "medium");
      const lowPriority = suggestedModels.filter((m) => m.priority === "low");

      if (highPriority.length > 0) {
        console.log("\n🔴 High Priority:");
        highPriority.forEach((model) => {
          console.log(`   - ${model.concept} (used in ${model.chapters.length} chapters)`);
        });
      }

      if (mediumPriority.length > 0) {
        console.log("\n🟡 Medium Priority:");
        mediumPriority.forEach((model) => {
          console.log(`   - ${model.concept} (used in ${model.chapters.length} chapters)`);
        });
      }

      if (lowPriority.length > 0) {
        console.log("\n🟢 Low Priority:");
        lowPriority.slice(0, 10).forEach((model) => {
          console.log(`   - ${model.concept}`);
        });
        if (lowPriority.length > 10) {
          console.log(`   ... and ${lowPriority.length - 10} more`);
        }
      }
      console.log("-".repeat(60));
      console.log();
    }

    // Save website chapters
    console.log("Step 7: Saving website chapters...");
    await saveChapters(chapters);
    console.log(`✅ Saved to: ${chaptersOutputPath}\n`);

    console.log("=".repeat(60));
    console.log("✅ Analysis Complete!");
    console.log("=".repeat(60));
    console.log("\nNext steps:");
    console.log("1. Review the extracted chapters in data/chapters/chapters.json");
    console.log("2. Create or source 3D models for the suggested concepts");
    console.log("3. Place models in public/models/ directory");
    console.log("4. Update chapter data with actual model paths");
  } catch (error) {
    console.error("\n❌ Error during PDF analysis:", error);
    if (error instanceof Error) {
      console.error("Error message:", error.message);
      console.error("Stack:", error.stack);
    }
    process.exit(1);
  }
}

main();


