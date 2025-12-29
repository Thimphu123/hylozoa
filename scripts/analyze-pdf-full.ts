import { parsePDF, extractChapters, saveChaptersToJSON } from "../lib/pdf-parser";
import { convertPDFChaptersToChapters, analyzeContentForModels } from "../lib/content-analyzer";
import { saveChapters } from "../lib/chapter-data";
import path from "path";
import fs from "fs";

/**
 * Full PDF analysis script
 * This will analyze the entire PDF and create chapter data
 * Run with: npx tsx scripts/analyze-pdf-full.ts
 */

async function main() {
  const pdfPath = path.join(process.cwd(), "prototype.pdf");
  const outputPath = path.join(process.cwd(), "data", "chapters", "extracted.json");
  const chaptersOutputPath = path.join(process.cwd(), "data", "chapters", "chapters.json");

  console.log("=".repeat(60));
  console.log("PDF Analysis Tool");
  console.log("=".repeat(60));
  console.log(`Reading PDF from: ${pdfPath}\n`);

  try {
    // Check if PDF exists
    if (!fs.existsSync(pdfPath)) {
      console.error(`❌ PDF file not found at: ${pdfPath}`);
      process.exit(1);
    }

    // For very large PDFs, we might want to parse in chunks
    // For now, try to parse the whole thing
    console.log("Step 1: Parsing PDF...");
    let pages;
    try {
      pages = await parsePDF(pdfPath);
    } catch (error) {
      if (error instanceof Error && error.message.includes("too large")) {
        console.log("⚠️  PDF is very large. Attempting to parse first 100 pages as sample...");
        pages = await parsePDF(pdfPath, { maxPages: 100 });
        console.log("Note: Only first 100 pages were analyzed. Full analysis may require chunked processing.");
      } else {
        throw error;
      }
    }
    console.log(`✅ Extracted ${pages.length} pages\n`);

    // Extract chapters
    console.log("Step 2: Extracting chapters...");
    const pdfChapters = extractChapters(pages);
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
    console.log("Step 3: Saving extracted PDF chapters...");
    await saveChaptersToJSON(pdfChapters, outputPath);
    console.log(`✅ Saved to: ${outputPath}\n`);

    // Convert to website format
    console.log("Step 4: Converting to website chapter format...");
    const chapters = convertPDFChaptersToChapters(pdfChapters);
    console.log(`✅ Converted ${chapters.length} chapters\n`);

    // Analyze for 3D models
    console.log("Step 5: Analyzing content for 3D models...");
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
    console.log("Step 6: Saving website chapters...");
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

