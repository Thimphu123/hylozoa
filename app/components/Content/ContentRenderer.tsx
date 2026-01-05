"use client";

import GlossaryTerm from "./GlossaryTerm";
import glossaryData from "@/data/glossary.json";
import ModelViewer from "@/app/components/ModelViewer/ModelViewer";
import { MediaEmbed } from "@/lib/chapter-data";

interface ContentRendererProps {
  content: string;
  media?: MediaEmbed[];
}

// Global counter for glossary terms across all content
let globalGlossaryTermIndex = 0;

export default function ContentRenderer({ content, media = [] }: ContentRendererProps) {
  // Reset counter for each content render
  globalGlossaryTermIndex = 0;

  // --- NEW: A Set to collect missing words during this render ---
  const missingTerms = new Set<string>();

  // Simple markdown-like rendering
  const formatContent = (text: string): string => {
    let formatted = text;

    // 1. Convert single \n to <br /> (Crucial for your JSON newlines)
    formatted = formatted.replace(/\n/g, "<br />");

    // 2. Convert subscripts: ~2~ -> <sub>2</sub>
    formatted = formatted.replace(/~(.+?)~/g, "<sub>$1</sub>");

    // 3. Convert superscripts (Optional but helpful for ions): ^2+^ -> <sup>2+</sup>
    formatted = formatted.replace(/\^(.+?)\^/g, "<sup>$1</sup>");

    // Convert **bold** to <strong>
    formatted = formatted.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");

    // Convert *italic* to <em>
    formatted = formatted.replace(/\*(.+?)\*/g, "<em>$1</em>");

    // Convert numbered lists
    formatted = formatted.replace(/^\d+\.\s+(.+)$/gm, "<li>$1</li>");

    // Convert bullet points
    formatted = formatted.replace(/^-\s+(.+)$/gm, "<li>$1</li>");

    // Wrap lists in <ul> or <ol>
    formatted = formatted.replace(/(<li>[\s\S]*?<\/li>)/g, (match) => {
      const items = match.match(/<li>.*?<\/li>/g) || [];
      if (items.length > 0 && items[0]) {
        // Check if it's a numbered list (starts with number)
        const firstItem = items[0];
        const itemIndex = text.indexOf(firstItem);
        const isNumbered = itemIndex >= 0 && /^\d+\./.test(
          text.substring(Math.max(0, itemIndex - 10), itemIndex)
        );
        return isNumbered
          ? `<ol class="list-decimal list-inside space-y-2">${match}</ol>`
          : `<ul class="list-disc list-inside space-y-2">${match}</ul>`;
      }
      return match;
    });

    return formatted;
  };

  // Helper to strip [[glossary]] markup from text (for headers, titles, etc.)
  const stripGlossaryMarkup = (text: string): string => {
    return text.replace(/\[\[([^\]]+)\]\]/g, "$1");
  };

  // 2. Helper to process a string and return an array of JSX (Text + Glossary Components)
  const renderTextWithGlossary = (text: string) => {
    const parts = text.split(/(\[\[.*?\]\])/g);
    return parts.map((part, index) => {
      if (part.startsWith("[[") && part.endsWith("]]")) {
        const termKey = part.slice(2, -2).toLowerCase().trim();
        const definition = (glossaryData as any)[termKey];
        const currentIndex = globalGlossaryTermIndex++;

        // --- NEW: If definition is missing, add to our list ---
        if (!definition) {
          missingTerms.add(part.slice(2, -2).trim());
        }
        
        return (
          <GlossaryTerm
            key={index}
            word={part.slice(2, -2)}
            definition={definition || "Definition not found."}
            index={currentIndex}
          />
        );
      }
      return (
        <span
          key={index}
          className="inline"
          dangerouslySetInnerHTML={{ __html: formatContent(part) }}
        />
      );
    });
  };

  // Render media embed
  const renderMediaEmbed = (embed: MediaEmbed, index: number) => {
    const widthClass = 
      embed.width === "small" ? "max-w-sm mx-auto" :
      embed.width === "medium" ? "max-w-md mx-auto" :
      embed.width === "large" ? "max-w-2xl mx-auto" :
      "w-full";

    if (embed.type === "image") {
      return (
        <figure key={`media-${index}`} className={`${widthClass} my-6`}>
          <img
            src={embed.path}
            alt={embed.title || "Image"}
            className="w-full h-auto rounded-lg shadow-md"
          />
          {(embed.title || embed.description) && (
            <figcaption className="mt-2 text-sm text-center text-gray-600 dark:text-gray-400">
              {embed.title && <strong>{embed.title}</strong>}
              {embed.title && embed.description && " - "}
              {embed.description}
            </figcaption>
          )}
        </figure>
      );
    }

    if (embed.type === "video") {
      return (
        <figure key={`media-${index}`} className={`${widthClass} my-6`}>
          <div className="relative w-full aspect-video rounded-lg overflow-hidden shadow-md bg-gray-100 dark:bg-gray-800">
            <video
              src={embed.path}
              controls
              loop={embed.loop}
              autoPlay={embed.autoplay}
              muted={embed.muted}
              playsInline
              className="w-full h-full"
            >
              Your browser does not support the video tag.
            </video>
          </div>
          {(embed.title || embed.description) && (
            <figcaption className="mt-2 text-sm text-center text-gray-600 dark:text-gray-400">
              {embed.title && <strong>{embed.title}</strong>}
              {embed.title && embed.description && " - "}
              {embed.description}
            </figcaption>
          )}
        </figure>
      );
    }

    if (embed.type === "model") {
      const heightClass = 
        embed.width === "small" ? "h-[200px]" :
        embed.width === "medium" ? "h-[300px]" :
        embed.width === "large" ? "h-[400px]" :
        "h-[300px]";

      return (
        <figure key={`media-${index}`} className={`${widthClass} my-6`}>
          <div className={`w-full ${heightClass} rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700`}>
            <ModelViewer
              modelPath={embed.path}
              annotations={embed.annotations}
            />
          </div>
          {(embed.title || embed.description) && (
            <figcaption className="mt-2 text-sm text-center text-gray-600 dark:text-gray-400">
              {embed.title && <strong>{embed.title}</strong>}
              {embed.title && embed.description && " - "}
              {embed.description}
            </figcaption>
          )}
        </figure>
      );
    }

    return null;
  };

  // Parse content for media embeds: {{image:0}}, {{video:1}}, {{model:2}}
  const parseContentWithMedia = (text: string) => {
    const parts: Array<{ type: "text" | "media"; content?: string; mediaIndex?: number }> = [];
    let lastIndex = 0;
    const mediaRegex = /\{\{(image|video|model):(\d+)\}\}/g;
    let match;

    while ((match = mediaRegex.exec(text)) !== null) {
      // Add text before the match
      if (match.index > lastIndex) {
        parts.push({
          type: "text",
          content: text.substring(lastIndex, match.index),
        });
      }

      // Add media embed
      const mediaType = match[1] as "image" | "video" | "model";
      const mediaIndex = parseInt(match[2], 10);
      const embed = media.find((m, i) => i === mediaIndex && m.type === mediaType);
      
      if (embed) {
        parts.push({
          type: "media",
          mediaIndex: mediaIndex,
        });
      }

      lastIndex = match.index + match[0].length;
    }

    // Add remaining text
    if (lastIndex < text.length) {
      parts.push({
        type: "text",
        content: text.substring(lastIndex),
      });
    }

    // If no media embeds found, return original text
    if (parts.length === 0) {
      return [{ type: "text" as const, content: text }];
    }

    return parts;
  };

  // Parse markdown table
  const parseTable = (tableText: string) => {
    const lines = tableText.trim().split(/\n/);
    if (lines.length < 2) return null;

    // Check if it's a table (has | separator and header separator)
    const firstLine = lines[0].trim();
    if (!firstLine.startsWith("|") || !firstLine.endsWith("|")) return null;

    const secondLine = lines[1].trim();
    // Check if second line is a separator row (starts/ends with |, contains only dashes, spaces, colons, and pipes)
    if (!secondLine.startsWith("|") || !secondLine.endsWith("|")) return null;
    const separatorCells = secondLine.slice(1, -1).split(/\|/).map(cell => cell.trim());
    const isSeparatorRow = separatorCells.every(cell => /^[\s\-:]+$/.test(cell));
    if (!isSeparatorRow) return null;

    const rows: string[][] = [];
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line.startsWith("|") && line.endsWith("|")) {
        // Skip separator row (second line)
        if (i === 1) {
          const cells = line.slice(1, -1).split(/\|/).map(cell => cell.trim());
          if (cells.every(cell => /^[\s\-:]+$/.test(cell))) continue;
        }
        
        const cells = line
          .slice(1, -1) // Remove leading and trailing |
          .split(/\|/)
          .map(cell => cell.trim());
        if (cells.length > 0) {
          rows.push(cells);
        }
      }
    }

    if (rows.length === 0) return null;
    return rows;
  };

  // Render table cell content with glossary support (for body cells)
  const renderTableCell = (cellContent: string) => {
    return renderTextWithGlossary(cellContent);
  };

  // Render table header cell without glossary highlighting
  const renderTableHeaderCell = (cellContent: string) => {
    const textWithoutMarkup = stripGlossaryMarkup(cellContent);
    return (
      <span
        className="inline"
        dangerouslySetInnerHTML={{ __html: formatContent(textWithoutMarkup) }}
      />
    );
  };

  // 3. Split content into blocks (Paragraphs vs Lists)
  const blocks = content.split(/\n\n+/);

  return (
    <div className="w-full mb-6 text-gray-700 dark:text-gray-300 leading-relaxed text-base" style={{ maxWidth: '100%' }}>
      {blocks.map((block, bIndex) => {
        const trimmedBlock = block.trim();

        // CHECK FOR NOTE BOXES (:::note ... :::)
        if (trimmedBlock.startsWith(":::note")) {
          const noteContent = trimmedBlock
            .replace(/^:::note\n?/, "")
            .replace(/\n?:::$/, "")
            .trim();
          
          const parsedParts = parseContentWithMedia(noteContent);
          
          return (
            <div key={bIndex} className="my-6 p-5 bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 rounded-r-lg shadow-sm">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-0.5">
                  <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="font-bold text-blue-800 dark:text-blue-300 mb-2">Note:</p>
                  <div className="text-gray-700 dark:text-gray-300">
                    {parsedParts.map((part, pIndex) => {
                      if (part.type === "media" && part.mediaIndex !== undefined) {
                        const embed = media[part.mediaIndex];
                        return embed ? renderMediaEmbed(embed, part.mediaIndex) : null;
                      }
                      return (
                        <span key={pIndex}>
                          {renderTextWithGlossary(part.content || "")}
                        </span>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          );
        }

        // 0. CHECK FOR TABLES (Markdown table syntax)
        const tableData = parseTable(trimmedBlock);
        if (tableData) {
          const [headerRow, ...bodyRows] = tableData;
          return (
            <div key={bIndex} className="my-6">
              <table className="table-auto border-collapse border border-gray-300 dark:border-gray-800 bg-white dark:bg-gray-950 rounded-lg shadow-sm">
                <thead>
                  <tr className="bg-blue-100 dark:bg-blue-600/50">
                    {headerRow.map((cell, cellIndex) => (
                      <th
                        key={cellIndex}
                        className="border border-gray-300 dark:border-gray-600 py-3 text-center font-semibold text-gray-600 dark:text-gray-300"
                      >
                        {renderTableHeaderCell(cell)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {bodyRows.map((row, rowIndex) => (
                    <tr
                      key={rowIndex}
                      className="hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors"
                    >
                      {row.map((cell, cellIndex) => (
                        <td
                          key={cellIndex}
                          className="border border-gray-300 dark:border-gray-600 py-3 text-gray-700 dark:text-gray-300"
                        >
                          <span className="px-4">{renderTableCell(cell)}</span>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        }

        // 1. CHECK FOR SMALL HEADINGS (Starts with ###)
        if (trimmedBlock.startsWith("### ")) {
          const headingText = trimmedBlock.replace(/^###\s+/, "");
          const textWithoutMarkup = stripGlossaryMarkup(headingText);
          return (
            <h3 key={bIndex} className="text-xl font-bold mt-8 mb-4 text-gray-900 dark:text-gray-100">
              <span
                className="inline"
                dangerouslySetInnerHTML={{ __html: formatContent(textWithoutMarkup) }}
              />
            </h3>
          );
        }

        // 2. CHECK FOR LISTS
        const isBulletList = trimmedBlock.startsWith("- ");
        const isNumberedList = /^\d+\./.test(trimmedBlock);

        if (isBulletList || isNumberedList) {
          const ListTag = isNumberedList ? "ol" : "ul";
          const listClass = isNumberedList ? "list-decimal" : "list-disc";
          
          let items: string[] = [];
          if (isNumberedList) {
            // For numbered lists, split by single \n when followed by a number pattern
            // This handles items separated by single newline
            const lines = trimmedBlock.split(/\n/);
            let currentItem = "";
            for (let i = 0; i < lines.length; i++) {
              const line = lines[i];
              // Check if this line starts a new numbered item
              if (/^\d+\.\s+/.test(line.trim())) {
                // Save previous item if exists
                if (currentItem.trim()) {
                  items.push(currentItem.trim());
                }
                currentItem = line;
              } else if (currentItem) {
                // Continuation of current item
                currentItem += "\n" + line;
              } else {
                // First line that doesn't match pattern - shouldn't happen but handle it
                currentItem = line;
              }
            }
            // Add last item
            if (currentItem.trim()) {
              items.push(currentItem.trim());
            }
          } else {
            // For bullet lists, split by \n\n
            items = trimmedBlock.split(/\n\n+/).filter(item => item.trim() && item.startsWith("-"));
          }

          return (
            <ListTag key={bIndex} className={`${listClass} list-inside space-y-2 my-4`}>
              {items.map((item, iIndex) => {
                const cleanItem = item.replace(/^(-\s+|\d+\.\s+)/, "");
                // Parse item for media embeds
                const parsedParts = parseContentWithMedia(cleanItem);
                return (
                  <li key={iIndex} className="pl-2">
                    {parsedParts.map((part, pIndex) => {
                      if (part.type === "media" && part.mediaIndex !== undefined) {
                        const embed = media[part.mediaIndex];
                        return embed ? (
                          <span key={pIndex} className="block my-2">
                            {renderMediaEmbed(embed, part.mediaIndex)}
                          </span>
                        ) : null;
                      }
                      return (
                        <span key={pIndex}>
                          {renderTextWithGlossary(part.content || "")}
                        </span>
                      );
                    })}
                  </li>
                );
              })}
            </ListTag>
          );
        }

        // 3. REGULAR PARAGRAPHS - Check for media embeds
        const parsedParts = parseContentWithMedia(block);
        
        // If no media embeds, render normally
        if (parsedParts.length === 1 && parsedParts[0].type === "text") {
          return (
            <p key={bIndex} className="mb-4">
              {renderTextWithGlossary(block)}
            </p>
          );
        }

        // Render with media embeds
        return (
          <div key={bIndex} className="mb-4">
            {parsedParts.map((part, pIndex) => {
              if (part.type === "media" && part.mediaIndex !== undefined) {
                const embed = media[part.mediaIndex];
                return embed ? renderMediaEmbed(embed, part.mediaIndex) : null;
              }
              return (
                <p key={pIndex} className="mb-4">
                  {renderTextWithGlossary(part.content || "")}
                </p>
              );
            })}
          </div>
        );
      })}

      {/* --- NEW: Missing Definitions Debug Section --- */}
      {missingTerms.size > 0 && (
        <div className="mt-12 p-6 border-2 border-dashed border-red-300 bg-red-50 dark:bg-red-900/10 rounded-xl">
          <h3 className="text-lg font-bold text-red-600 dark:text-red-400 mb-2 flex items-center gap-2">
            <span>ตรวจพบ {missingTerms.size} คำที่ไม่ได้ใส่ความหมาย</span>
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            ทางทีมงานจะดำเนินการแก้ไขเร็วๆ นี้
          </p>
          <div className="bg-white dark:bg-gray-900 p-4 rounded border border-red-200 dark:border-red-800">
            <code className="text-red-500 block whitespace-pre-wrap">
              {Array.from(missingTerms).join(", ")}
            </code>
          </div>
        </div>
      )}
    </div>
  );
}