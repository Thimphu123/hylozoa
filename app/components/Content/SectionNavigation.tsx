"use client";

import { useEffect, useState, useRef } from "react";
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
  const navRef = useRef<HTMLElement>(null);
  const [isSticky, setIsSticky] = useState(false);
  const [stickyStyle, setStickyStyle] = useState<{ top: string; width: string; left?: string } | undefined>(undefined);

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

      // Handle sticky positioning manually
      if (navRef.current) {
        const navRect = navRef.current.getBoundingClientRect();
        const parentAside = navRef.current.closest('aside');
        
        if (parentAside) {
          const containerRect = parentAside.getBoundingClientRect();
          const scrollY = window.scrollY;
          const stickyThreshold = containerRect.top + scrollY - 80; // 80px offset for header
          
          const shouldBeSticky = scrollY >= stickyThreshold && navRect.top <= 80;
          
          setIsSticky((prevIsSticky) => {
            if (shouldBeSticky) {
              if (!prevIsSticky) {
                // Calculate fixed position
                const left = containerRect.left + window.scrollX;
                setStickyStyle({
                  top: '80px',
                  width: `${navRect.width}px`,
                  left: `${left}px`
                });
                return true;
              }
              // Update position on resize/scroll
              const left = containerRect.left + window.scrollX;
              setStickyStyle({
                top: '80px',
                width: `${navRect.width}px`,
                left: `${left}px`
              });
              return prevIsSticky;
            } else {
              if (prevIsSticky) {
                setStickyStyle(undefined);
                return false;
              }
              return prevIsSticky;
            }
          });
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    window.addEventListener("resize", handleScroll);
    handleScroll(); // Initial check

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
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
    <nav 
      ref={navRef}
      className={`hidden lg:block h-fit z-40 ${
        isSticky ? 'fixed' : 'sticky top-20'
      }`}
      style={isSticky ? stickyStyle : undefined}
    >
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

