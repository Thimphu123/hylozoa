import fs from "fs";
import path from "path";
import { Chapter, Section } from "../lib/chapter-data";

/**
 * Improved refinement script that merges duplicate chapters and better cleans data
 */

interface RawChapter {
  slug: string;
  title: string;
  description?: string;
  order: number;
  sections?: Section[];
}

// Extract chapter number and clean title
function parseChapterTitle(title: string): { number: number; cleanTitle: string } | null {
  // Match "CHAPTER X" or "Chapter X" patterns (with or without "Chapter X:" prefix)
  let match = title.match(/^(?:CHAPTER|Chapter)\s+(\d+)\s*:?\s*(.+?)(?:\s+\d+)?$/i);
  if (!match) {
    // Try "Chapter X: Title" format
    match = title.match(/^Chapter\s+(\d+):\s*(.+?)(?:\s+\d+)?$/i);
  }
  if (match) {
    const number = parseInt(match[1], 10);
    let cleanTitle = match[2].trim();
    
    // Remove page numbers at the end
    cleanTitle = cleanTitle.replace(/\s+\d+\s*$/, "");
    
    // Remove photo credits and other metadata
    cleanTitle = cleanTitle.replace(/\s+top\s+.*$/i, "");
    cleanTitle = cleanTitle.replace(/\s+bottom\s+.*$/i, "");
    cleanTitle = cleanTitle.replace(/\s+www\..*$/i, "");
    cleanTitle = cleanTitle.replace(/\s+Alamy.*$/i, "");
    cleanTitle = cleanTitle.replace(/\s+Stock Photo.*$/i, "");
    cleanTitle = cleanTitle.replace(/\s+Getty.*$/i, "");
    cleanTitle = cleanTitle.replace(/\s+Science Source.*$/i, "");
    cleanTitle = cleanTitle.replace(/\s+Based on.*$/i, "");
    cleanTitle = cleanTitle.replace(/\s+Data from.*$/i, "");
    cleanTitle = cleanTitle.replace(/\s+From:.*$/i, "");
    cleanTitle = cleanTitle.replace(/\s+Simulated.*$/i, "");
    cleanTitle = cleanTitle.replace(/\s+Graph.*$/i, "");
    cleanTitle = cleanTitle.replace(/\s+Screen.*$/i, "");
    cleanTitle = cleanTitle.replace(/\s+shots.*$/i, "");
    cleanTitle = cleanTitle.replace(/\s+Mac OS.*$/i, "");
    cleanTitle = cleanTitle.replace(/\s+found at.*$/i, "");
    
    // Clean up any remaining extra spaces
    cleanTitle = cleanTitle.replace(/\s+/g, " ").trim();
    
    return { number, cleanTitle };
  }
  return null;
}

// Merge sections from multiple chapter entries
function mergeSections(sections: Section[][]): Section[] {
  const merged: Section[] = [];
  const seenTitles = new Set<string>();
  
  for (const sectionGroup of sections) {
    for (const section of sectionGroup) {
      if (!section) continue;
      
      const title = (section.title || "Introduction").toLowerCase().trim();
      
      // Skip duplicates
      if (seenTitles.has(title)) {
        // Merge content if different
        const existing = merged.find(s => (s.title || "").toLowerCase().trim() === title);
        if (existing && section.content && !existing.content?.includes(section.content)) {
          existing.content = (existing.content || "") + "\n\n" + section.content;
        }
        continue;
      }
      
      seenTitles.add(title);
      
      // Clean section
      const cleanTitle = section.title?.trim() || "Introduction";
      const cleanContent = section.content?.trim() || "";
      
      // Skip empty sections unless they're the introduction
      if (!cleanContent && cleanTitle !== "Introduction") {
        continue;
      }
      
      // Skip very short content that's likely noise
      if (cleanContent && cleanContent.length < 30 && cleanTitle !== "Introduction") {
        continue;
      }
      
      merged.push({
        title: cleanTitle,
        content: cleanContent || undefined,
        models: section.models && section.models.length > 0 ? section.models : undefined,
      });
    }
  }
  
  return merged;
}

// Get better model suggestions based on chapter content
function getBetterModelSuggestions(chapterTitle: string, allContent: string): any[] {
  const models: any[] = [];
  const lowerTitle = chapterTitle.toLowerCase();
  const lowerContent = allContent.toLowerCase();

  // DNA and Genetics
  if (lowerTitle.includes("dna") || lowerTitle.includes("genetic") || lowerTitle.includes("gene") || 
      lowerContent.includes("dna") || lowerContent.includes("gene") || lowerContent.includes("chromosome")) {
    models.push({
      path: "/models/dna-double-helix.glb",
      title: "DNA Double Helix Structure",
      description: "3D model showing the double helix structure of DNA with base pairs (A-T, G-C)"
    });
    models.push({
      path: "/models/chromosome-structure.glb",
      title: "Chromosome Structure",
      description: "3D model of chromosome showing DNA packaging with histone proteins"
    });
  }

  // Cell structures
  if (lowerTitle.includes("cell") || lowerContent.includes("organelle") || 
      lowerContent.includes("mitochondria") || lowerContent.includes("nucleus") ||
      lowerContent.includes("endoplasmic reticulum") || lowerContent.includes("golgi")) {
    models.push({
      path: "/models/eukaryotic-cell.glb",
      title: "Eukaryotic Cell Structure",
      description: "3D model showing major organelles: nucleus, mitochondria, ER, Golgi apparatus, and ribosomes"
    });
    if (lowerContent.includes("plant") || lowerContent.includes("chloroplast")) {
      models.push({
        path: "/models/plant-cell.glb",
        title: "Plant Cell Structure",
        description: "3D model of plant cell with chloroplasts, cell wall, and central vacuole"
      });
    }
  }

  // Proteins
  if (lowerTitle.includes("protein") || lowerContent.includes("amino acid") || 
      lowerContent.includes("polypeptide") || lowerContent.includes("enzyme")) {
    models.push({
      path: "/models/protein-structure.glb",
      title: "Protein Structure",
      description: "3D model showing primary, secondary (alpha helix, beta sheet), tertiary, and quaternary protein structure"
    });
    if (lowerContent.includes("enzyme") || lowerContent.includes("catalyst")) {
      models.push({
        path: "/models/enzyme-substrate.glb",
        title: "Enzyme-Substrate Complex",
        description: "3D model showing enzyme active site, substrate binding, and induced fit mechanism"
      });
    }
  }

  // Membranes
  if (lowerTitle.includes("membrane") || lowerContent.includes("phospholipid") || 
      lowerContent.includes("plasma membrane") || lowerContent.includes("bilayer")) {
    models.push({
      path: "/models/plasma-membrane.glb",
      title: "Plasma Membrane Structure",
      description: "3D model showing phospholipid bilayer with embedded proteins, cholesterol, and glycoproteins"
    });
  }

  // Photosynthesis
  if (lowerTitle.includes("photosynthesis") || lowerContent.includes("chloroplast") || 
      lowerContent.includes("light reaction") || lowerContent.includes("calvin cycle")) {
    models.push({
      path: "/models/chloroplast.glb",
      title: "Chloroplast Structure",
      description: "3D model of chloroplast showing thylakoids, grana, and stroma"
    });
    models.push({
      path: "/models/photosystem.glb",
      title: "Photosystem Complex",
      description: "3D model of photosystem II showing light-harvesting complexes and electron transport chain"
    });
  }

  // Cellular respiration
  if (lowerTitle.includes("respiration") || lowerContent.includes("mitochondria") || 
      lowerContent.includes("atp synthase") || lowerContent.includes("krebs cycle") ||
      lowerContent.includes("electron transport")) {
    models.push({
      path: "/models/mitochondrion.glb",
      title: "Mitochondrion Structure",
      description: "3D model showing outer membrane, inner membrane with cristae, and matrix"
    });
    models.push({
      path: "/models/atp-synthase.glb",
      title: "ATP Synthase",
      description: "3D model of ATP synthase enzyme complex showing proton gradient and ATP production"
    });
  }

  // Meiosis and mitosis
  if (lowerTitle.includes("meiosis") || lowerTitle.includes("mitosis") || 
      lowerContent.includes("cell division") || lowerContent.includes("chromosome segregation")) {
    models.push({
      path: "/models/cell-division.glb",
      title: "Cell Division Process",
      description: "3D animation showing stages of mitosis: prophase, metaphase, anaphase, and telophase"
    });
    if (lowerTitle.includes("meiosis")) {
      models.push({
        path: "/models/meiosis.glb",
        title: "Meiosis Process",
        description: "3D animation showing two divisions of meiosis with crossing over"
      });
    }
  }

  // Evolution
  if (lowerTitle.includes("evolution") || lowerContent.includes("natural selection") || 
      lowerContent.includes("phylogeny") || lowerContent.includes("speciation")) {
    models.push({
      path: "/models/phylogenetic-tree.glb",
      title: "Phylogenetic Tree",
      description: "3D visualization of evolutionary relationships and common ancestry"
    });
  }

  // Molecules and chemistry
  if (lowerTitle.includes("chemical") || lowerTitle.includes("molecule") || 
      lowerContent.includes("molecular") || lowerTitle.includes("water") ||
      lowerTitle.includes("carbon")) {
    if (lowerTitle.includes("water") || lowerContent.includes("water")) {
      models.push({
        path: "/models/water-molecule.glb",
        title: "Water Molecule Structure",
        description: "3D model showing polar structure of water molecule with hydrogen bonds"
      });
    }
    models.push({
      path: "/models/organic-molecules.glb",
      title: "Organic Molecules",
      description: "3D models of carbohydrates, lipids, proteins, and nucleic acids"
    });
  }

  // Remove duplicates
  const uniqueModels = models.filter((model, index, self) =>
    index === self.findIndex(m => m.path === model.path)
  );

  return uniqueModels;
}

async function main() {
  const inputPath = path.join(process.cwd(), "data", "chapters", "chapters.json");
  const outputPath = path.join(process.cwd(), "data", "chapters", "chapters-refined-v2.json");
  const backupPath = path.join(process.cwd(), "data", "chapters", "chapters.json.backup-v2");

  console.log("=".repeat(60));
  console.log("Chapter Data Refinement Tool v2");
  console.log("=".repeat(60));
  console.log(`Reading from: ${inputPath}\n`);

  try {
    // Read existing chapters
    const rawData = fs.readFileSync(inputPath, "utf-8");
    const rawChapters: RawChapter[] = JSON.parse(rawData);
    
    console.log(`Found ${rawChapters.length} entries\n`);

    // Create backup
    fs.writeFileSync(backupPath, rawData, "utf-8");
    console.log(`✅ Created backup: ${backupPath}\n`);

    // Group chapters by number
    const chapterMap = new Map<number, { title: string; sections: Section[][]; content: string }>();

    for (const rawChapter of rawChapters) {
      const parsed = parseChapterTitle(rawChapter.title);
      if (!parsed) {
        // Try to extract from order if title parsing fails
        if (rawChapter.order > 0 && rawChapter.order < 100) {
          const number = rawChapter.order;
          let cleanTitle = rawChapter.title.replace(/^(?:CHAPTER|Chapter)\s+\d+\s*:?\s*/i, "").trim();
          cleanTitle = cleanTitle.replace(/\s+\d+\s*$/, "").trim();
          if (cleanTitle.length > 5) {
            const chapter = chapterMap.get(number);
            if (!chapter) {
              chapterMap.set(number, {
                title: cleanTitle,
                sections: [],
                content: "",
              });
            }
            const ch = chapterMap.get(number)!;
            if (rawChapter.sections && rawChapter.sections.length > 0) {
              ch.sections.push(rawChapter.sections);
            }
            ch.content += " " + (rawChapter.description || "") + " " + 
                          (rawChapter.sections?.map(s => s.content || "").join(" ") || "");
          }
        }
        continue;
      }

      const { number, cleanTitle } = parsed;

      if (!chapterMap.has(number)) {
        chapterMap.set(number, {
          title: cleanTitle,
          sections: [],
          content: "",
        });
      }

      const chapter = chapterMap.get(number)!;
      
      // Use the cleanest title (longest, most descriptive)
      if (cleanTitle.length > chapter.title.length && !cleanTitle.includes("top") && !cleanTitle.includes("bottom")) {
        chapter.title = cleanTitle;
      }

      // Collect sections
      if (rawChapter.sections && rawChapter.sections.length > 0) {
        chapter.sections.push(rawChapter.sections);
      }

      // Collect content for model suggestions
      const allContent = (rawChapter.description || "") + " " + 
                        (rawChapter.sections?.map(s => s.content || "").join(" ") || "");
      chapter.content += " " + allContent;
    }

    // Create refined chapters
    const refinedChapters: Chapter[] = [];

    for (const [chapterNum, chapterData] of Array.from(chapterMap.entries()).sort((a, b) => a[0] - b[0])) {
      // Merge sections
      const mergedSections = mergeSections(chapterData.sections);

      // Get model suggestions
      const models = getBetterModelSuggestions(chapterData.title, chapterData.content);

      // Add models to first section if no sections have models
      if (mergedSections.length > 0 && models.length > 0) {
        const firstSection = mergedSections[0];
        if (!firstSection.models || firstSection.models.length === 0) {
          firstSection.models = models;
        }
      }

      const refinedChapter: Chapter = {
        slug: `chapter-${chapterNum}-${chapterData.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").substring(0, 50)}`,
        title: `Chapter ${chapterNum}: ${chapterData.title}`,
        description: `Chapter ${chapterNum} of Campbell Biology: ${chapterData.title}`,
        order: chapterNum,
        sections: mergedSections.length > 0 ? mergedSections : undefined,
      };

      refinedChapters.push(refinedChapter);
    }

    console.log(`✅ Refined to ${refinedChapters.length} unique chapters\n`);

    // Display summary
    console.log("Chapter Summary:");
    console.log("-".repeat(60));
    refinedChapters.forEach((chapter) => {
      const sectionCount = chapter.sections?.length || 0;
      const modelCount = chapter.sections?.reduce((sum, s) => sum + (s.models?.length || 0), 0) || 0;
      console.log(`${chapter.order}. ${chapter.title.substring(0, 60)}${chapter.title.length > 60 ? "..." : ""} (${sectionCount} sections, ${modelCount} models)`);
    });
    console.log("-".repeat(60));
    console.log();

    // Save refined chapters
    fs.writeFileSync(outputPath, JSON.stringify(refinedChapters, null, 2), "utf-8");
    console.log(`✅ Saved refined chapters to: ${outputPath}\n`);

    // Also update the main file
    fs.writeFileSync(inputPath, JSON.stringify(refinedChapters, null, 2), "utf-8");
    console.log(`✅ Updated: ${inputPath}\n`);

    console.log("=".repeat(60));
    console.log("✅ Refinement Complete!");
    console.log("=".repeat(60));
    console.log(`\nReduced from ${rawChapters.length} entries to ${refinedChapters.length} unique chapters`);
    console.log("\nNext steps:");
    console.log("1. Review the refined chapters");
    console.log("2. Further edit chapter content as needed");
    console.log("3. Create or source 3D models based on suggestions");
    console.log("4. Update model paths when models are ready");
  } catch (error) {
    console.error("\n❌ Error during refinement:", error);
    if (error instanceof Error) {
      console.error("Error message:", error.message);
      console.error("Stack:", error.stack);
    }
    process.exit(1);
  }
}

main();

