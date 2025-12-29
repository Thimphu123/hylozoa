"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";

interface Chapter {
  slug: string;
  title: string;
  description?: string;
  sections?: Array<{
    title: string;
    content?: string;
  }>;
}

interface SearchBarClientProps {
  chapters: Chapter[];
}

export default function SearchBarClient({ chapters }: SearchBarClientProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Array<{
    chapter: Chapter;
    sectionIndex?: number;
    sectionTitle?: string;
    match: string;
  }>>([]);
  const [isOpen, setIsOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearch = (searchQuery: string) => {
    setQuery(searchQuery);
    
    if (searchQuery.length < 2) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    const lowerQuery = searchQuery.toLowerCase();
    const searchResults: Array<{
      chapter: Chapter;
      sectionIndex?: number;
      sectionTitle?: string;
      match: string;
    }> = [];

    chapters.forEach((chapter) => {
      // Search in chapter title
      if (chapter.title.toLowerCase().includes(lowerQuery)) {
        searchResults.push({
          chapter,
          match: chapter.title,
        });
      }

      // Search in chapter description
      if (
        chapter.description &&
        chapter.description.toLowerCase().includes(lowerQuery)
      ) {
        searchResults.push({
          chapter,
          match: chapter.description,
        });
      }

      // Search in sections
      chapter.sections?.forEach((section, sectionIndex) => {
        if (section.title.toLowerCase().includes(lowerQuery)) {
          searchResults.push({
            chapter,
            sectionIndex,
            sectionTitle: section.title,
            match: section.title,
          });
        }

        if (
          section.content &&
          section.content.toLowerCase().includes(lowerQuery)
        ) {
          // Extract a snippet around the match
          const index = section.content.toLowerCase().indexOf(lowerQuery);
          const start = Math.max(0, index - 50);
          const end = Math.min(
            section.content.length,
            index + lowerQuery.length + 50
          );
          const snippet = section.content.substring(start, end);

          searchResults.push({
            chapter,
            sectionIndex,
            sectionTitle: section.title,
            match: snippet,
          });
        }
      });
    });

    setResults(searchResults.slice(0, 10)); // Limit to 10 results
    setIsOpen(searchResults.length > 0);
  };

  const handleResultClick = (
    chapterSlug: string,
    sectionIndex?: number
  ) => {
    setIsOpen(false);
    setQuery("");
    if (sectionIndex !== undefined) {
      router.push(`/chapters/${chapterSlug}#section-${sectionIndex}`);
    } else {
      router.push(`/chapters/${chapterSlug}`);
    }
  };

  return (
    <div ref={searchRef} className="relative w-full max-w-md">
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          onFocus={() => query.length >= 2 && results.length > 0 && setIsOpen(true)}
          placeholder="ค้นหาบทเรียน..."
          className="w-full px-4 py-2 pl-10 pr-4 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-label="Search chapters"
        />
        <svg
          className="absolute left-3 top-2.5 h-5 w-5 text-gray-400"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>

      {isOpen && results.length > 0 && (
        <div className="absolute z-50 w-full mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-96 overflow-y-auto">
          {results.map((result, index) => (
            <button
              key={index}
              onClick={() =>
                handleResultClick(result.chapter.slug, result.sectionIndex)
              }
              className="w-full text-left px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors border-b border-gray-200 dark:border-gray-700 last:border-b-0"
            >
              <div className="font-semibold text-sm text-gray-900 dark:text-gray-100">
                {result.chapter.title}
              </div>
              {result.sectionTitle && (
                <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  {result.sectionTitle}
                </div>
              )}
              <div className="text-xs text-gray-500 dark:text-gray-500 mt-1 line-clamp-2">
                {result.match}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

