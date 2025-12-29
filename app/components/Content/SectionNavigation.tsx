"use client";

import { useEffect, useState } from "react";
import { Section } from "@/lib/chapter-data";

interface SectionNavigationProps {
  sections: Section[];
  chapterSlug: string;
}

export default function SectionNavigation({
  sections,
  chapterSlug,
}: SectionNavigationProps) {
  const [activeSection, setActiveSection] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const sectionElements = sections.map((_, index) => {
        const element = document.getElementById(`section-${index}`);
        return { index, element, top: element?.getBoundingClientRect().top || 0 };
      });

      // Find the section currently in view
      const currentSection = sectionElements.find(
        (section, index) => {
          const nextSection = sectionElements[index + 1];
          return (
            section.top <= 100 &&
            (!nextSection || nextSection.top > 100)
          );
        }
      );

      if (currentSection) {
        setActiveSection(currentSection.index);
      }
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll(); // Initial check

    return () => window.removeEventListener("scroll", handleScroll);
  }, [sections]);

  const scrollToSection = (index: number) => {
    const element = document.getElementById(`section-${index}`);
    if (element) {
      const offset = 80; // Account for sticky header
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
    }
  };

  if (sections.length === 0) {
    return null;
  }

  return (
    <nav className="hidden lg:block sticky top-20 h-fit">
      <div className="bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-700 rounded-lg p-4 shadow-sm">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
          สารบัญ
        </h3>
        <ul className="space-y-2">
          {sections.map((section, index) => (
            <li key={index}>
              <button
                onClick={() => scrollToSection(index)}
                className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${
                  activeSection === index
                    ? "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 font-medium"
                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                }`}
              >
                {section.title}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}

