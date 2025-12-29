"use client";

import GlossaryTerm from "./GlossaryTerm";
import glossaryData from "@/data/glossary.json";

interface ContentRendererProps {
  content: string;
}

export default function ContentRenderer({ content }: ContentRendererProps) {
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

  // 2. Helper to process a string and return an array of JSX (Text + Glossary Components)
  const renderTextWithGlossary = (text: string) => {
    const parts = text.split(/(\[\[.*?\]\])/g);
    return parts.map((part, index) => {
      if (part.startsWith("[[") && part.endsWith("]]")) {
        const termKey = part.slice(2, -2).toLowerCase().trim();
        const definition = (glossaryData as any)[termKey];
        return (
          <GlossaryTerm
            key={index}
            word={part.slice(2, -2)}
            definition={definition || "Definition not found."}
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

  // 3. Split content into blocks (Paragraphs vs Lists)
  const blocks = content.split(/\n\n+/);

  return (
    <div className="max-w-none mb-6 text-gray-700 dark:text-gray-300 leading-relaxed text-base">
      {blocks.map((block, bIndex) => {
        const trimmedBlock = block.trim();

        // 1. CHECK FOR SMALL HEADINGS (Starts with ###)
        if (trimmedBlock.startsWith("### ")) {
          const headingText = trimmedBlock.replace(/^###\s+/, "");
          return (
            <h3 key={bIndex} className="text-xl font-bold mt-8 mb-4 text-gray-900 dark:text-gray-100">
              {renderTextWithGlossary(headingText)}
            </h3>
          );
        }

        // 2. CHECK FOR LISTS
        const isBulletList = trimmedBlock.startsWith("- ");
        const isNumberedList = /^\d+\./.test(trimmedBlock);

        if (isBulletList || isNumberedList) {
          const ListTag = isNumberedList ? "ol" : "ul";
          const listClass = isNumberedList ? "list-decimal" : "list-disc";
          const items = trimmedBlock.split(/\n/);

          return (
            <ListTag key={bIndex} className={`${listClass} list-inside space-y-2 my-4`}>
              {items.map((item, iIndex) => {
                const cleanItem = item.replace(/^(-\s+|\d+\.\s+)/, "");
                return (
                  <li key={iIndex} className="pl-2">
                    {renderTextWithGlossary(cleanItem)}
                  </li>
                );
              })}
            </ListTag>
          );
        }

        // 3. REGULAR PARAGRAPHS
        return (
          <p key={bIndex} className="mb-4">
            {renderTextWithGlossary(block)}
          </p>
        );
      })}
    </div>
  );
}