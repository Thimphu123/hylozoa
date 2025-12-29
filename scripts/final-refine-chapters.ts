import fs from "fs";
import path from "path";
import { Chapter, Section } from "../lib/chapter-data";

/**
 * Final refinement using known Campbell Biology chapter titles
 * This creates a clean, scientifically accurate chapter structure
 */

// Known Campbell Biology 12th Edition chapter titles
const CAMPBELL_CHAPTERS = [
  "Evolution, the Themes of Biology, and Scientific Inquiry",
  "The Chemical Context of Life",
  "Water and Life",
  "Carbon and the Molecular Diversity of Life",
  "The Structure and Function of Large Biological Molecules",
  "A Tour of the Cell",
  "Membrane Structure and Function",
  "An Introduction to Metabolism",
  "Cellular Respiration and Fermentation",
  "Photosynthesis",
  "Cell Communication",
  "The Cell Cycle",
  "Meiosis and Sexual Life Cycles",
  "Mendel and the Gene Idea",
  "The Chromosomal Basis of Inheritance",
  "The Molecular Basis of Inheritance",
  "Gene Expression: From Gene to Protein",
  "Regulation of Gene Expression",
  "Viruses",
  "DNA Tools and Biotechnology",
  "Genomes and Their Evolution",
  "Descent with Modification: A Darwinian View of Life",
  "The Evolution of Populations",
  "The Origin of Species",
  "The History of Life on Earth",
  "Phylogeny and the Tree of Life",
  "Bacteria and Archaea",
  "Protists",
  "Plant Diversity I: How Plants Colonized Land",
  "Plant Diversity II: The Evolution of Seed Plants",
  "Fungi",
  "An Overview of Animal Diversity",
  "An Introduction to Invertebrates",
  "The Origin and Evolution of Vertebrates",
  "Vascular Plant Structure, Growth, and Development",
  "Resource Acquisition and Transport in Vascular Plants",
  "Soil and Plant Nutrition",
  "Angiosperm Reproduction and Biotechnology",
  "Plant Responses to Internal and External Signals",
  "Basic Principles of Animal Form and Function",
  "Animal Nutrition",
  "Circulation and Gas Exchange",
  "The Immune System",
  "Osmoregulation and Excretion",
  "Hormones and the Endocrine System",
  "Animal Reproduction",
  "Animal Development",
  "Neurons, Synapses, and Signaling",
  "Nervous Systems",
  "Sensory and Motor Mechanisms",
  "Animal Behavior",
  "An Introduction to Ecology and the Biosphere",
  "Population Ecology",
  "Community Ecology",
  "Ecosystems and Restoration Ecology",
  "Conservation Biology and Global Change",
];

function findMatchingChapter(title: string, content: string): number | null {
  const lowerTitle = title.toLowerCase();
  const lowerContent = content.toLowerCase();
  
  for (let i = 0; i < CAMPBELL_CHAPTERS.length; i++) {
    const chapterTitle = CAMPBELL_CHAPTERS[i].toLowerCase();
    const keywords = chapterTitle.split(/\s+/).filter(w => w.length > 3);
    
    // Check if title or content contains key words from chapter title
    const titleMatch = keywords.every(kw => lowerTitle.includes(kw) || lowerContent.includes(kw));
    const exactMatch = lowerTitle.includes(chapterTitle) || lowerContent.includes(chapterTitle);
    
    if (exactMatch || (titleMatch && keywords.length >= 2)) {
      return i + 1;
    }
  }
  
  return null;
}

function cleanContent(content: string): string {
  if (!content) return "";
  
  // Remove excessive whitespace
  let cleaned = content.replace(/\s+/g, " ").trim();
  
  // Remove very short content
  if (cleaned.length < 50) {
    return "";
  }
  
  // Remove figure/table references at start
  cleaned = cleaned.replace(/^(Figure|Table)\s+\d+\.\d*[:\s]*/i, "");
  
  // Remove photo credits
  cleaned = cleaned.replace(/\s+top\s+.*$/i, "");
  cleaned = cleaned.replace(/\s+bottom\s+.*$/i, "");
  cleaned = cleaned.replace(/\s+www\..*$/i, "");
  cleaned = cleaned.replace(/\s+Alamy.*$/i, "");
  cleaned = cleaned.replace(/\s+Getty.*$/i, "");
  cleaned = cleaned.replace(/\s+Science Source.*$/i, "");
  cleaned = cleaned.replace(/\s+Based on.*$/i, "");
  cleaned = cleaned.replace(/\s+Data from.*$/i, "");
  
  return cleaned.trim();
}

async function main() {
  const inputPath = path.join(process.cwd(), "data", "chapters", "chapters.json");
  const outputPath = path.join(process.cwd(), "data", "chapters", "chapters-final.json");
  const backupPath = path.join(process.cwd(), "data", "chapters", "chapters.json.backup-final");

  console.log("=".repeat(60));
  console.log("Final Chapter Refinement Tool");
  console.log("=".repeat(60));
  console.log(`Reading from: ${inputPath}\n`);

  try {
    const rawData = fs.readFileSync(inputPath, "utf-8");
    const rawChapters: any[] = JSON.parse(rawData);
    
    console.log(`Found ${rawChapters.length} entries\n`);

    // Create backup
    fs.writeFileSync(backupPath, rawData, "utf-8");
    console.log(`✅ Created backup: ${backupPath}\n`);

    // Group by matching chapter
    const chapterMap = new Map<number, { sections: Section[]; content: string }>();

    for (const rawChapter of rawChapters) {
      const allContent = (rawChapter.description || "") + " " + 
                        (rawChapter.sections?.map((s: any) => s.content || "").join(" ") || "");
      
      const chapterNum = findMatchingChapter(rawChapter.title, allContent);
      if (!chapterNum) continue;

      if (!chapterMap.has(chapterNum)) {
        chapterMap.set(chapterNum, { sections: [], content: "" });
      }

      const chapter = chapterMap.get(chapterNum)!;
      chapter.content += " " + allContent;

      // Add sections
      if (rawChapter.sections) {
        for (const section of rawChapter.sections) {
          const cleanedContent = cleanContent(section.content || "");
          if (cleanedContent && cleanedContent.length > 50) {
            // Skip if it's a question
            if (/^\d+\.\s*(what|how|why|explain|describe|compare|make connections)/i.test(section.title || "")) {
              continue;
            }
            
            chapter.sections.push({
              title: section.title?.trim() || "Introduction",
              content: cleanedContent,
              models: section.models && section.models.length > 0 ? section.models : undefined,
            });
          }
        }
      }
    }

    // Create final chapters
    const finalChapters: Chapter[] = [];

    for (let i = 0; i < CAMPBELL_CHAPTERS.length; i++) {
      const chapterNum = i + 1;
      const chapterTitle = CAMPBELL_CHAPTERS[i];
      const chapterData = chapterMap.get(chapterNum);

      const sections = chapterData?.sections || [];
      
      // Remove duplicate sections
      const uniqueSections: Section[] = [];
      const seenTitles = new Set<string>();
      
      for (const section of sections) {
        const titleKey = (section.title || "").toLowerCase().trim();
        if (!seenTitles.has(titleKey) && section.content && section.content.length > 50) {
          seenTitles.add(titleKey);
          uniqueSections.push(section);
        }
      }

      // If no sections, create a placeholder
      if (uniqueSections.length === 0) {
        uniqueSections.push({
          title: "Introduction",
          content: `Content for ${chapterTitle} will be available soon.`,
        });
      }

      finalChapters.push({
        slug: `chapter-${chapterNum}-${chapterTitle.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "")}`,
        title: `Chapter ${chapterNum}: ${chapterTitle}`,
        description: `Chapter ${chapterNum} of Campbell Biology: ${chapterTitle}`,
        order: chapterNum,
        sections: uniqueSections.length > 0 ? uniqueSections : undefined,
      });
    }

    console.log(`✅ Created ${finalChapters.length} final chapters\n`);

    // Display summary
    console.log("Final Chapter List:");
    console.log("-".repeat(60));
    finalChapters.forEach((chapter) => {
      const sectionCount = chapter.sections?.length || 0;
      console.log(`${chapter.order}. ${chapter.title} (${sectionCount} sections)`);
    });
    console.log("-".repeat(60));
    console.log();

    // Save
    fs.writeFileSync(outputPath, JSON.stringify(finalChapters, null, 2), "utf-8");
    console.log(`✅ Saved to: ${outputPath}\n`);

    fs.writeFileSync(inputPath, JSON.stringify(finalChapters, null, 2), "utf-8");
    console.log(`✅ Updated: ${inputPath}\n`);

    console.log("=".repeat(60));
    console.log("✅ Final Refinement Complete!");
    console.log("=".repeat(60));
  } catch (error) {
    console.error("\n❌ Error:", error);
    process.exit(1);
  }
}

main();

