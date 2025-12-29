"use client";

import Link from "next/link";
import { useState } from "react";
import SearchBarClient from "@/app/components/Search/SearchBarClient";

interface Chapter {
  slug: string;
  title: string;
  description?: string;
  sections?: Array<{
    title: string;
    content?: string;
  }>;
}

interface NavigationClientProps {
  chapters: Chapter[];
}

export default function NavigationClient({ chapters }: NavigationClientProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="prose bg-white dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="text-2xl font-bold text-blue-600 dark:text-blue-400 lg:ml-48">
            Hylozoa
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6 flex-1 justify-center max-w-md mx-8">
            <SearchBarClient chapters={chapters} />
          </div>
          <div className="hidden md:flex items-center space-x-6 lg:mr-48">
            <Link
              href="/"
              className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              หน้าหลัก
            </Link>
            <Link
              href="/chapters"
              className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              บทเรียน
            </Link>
            <Link
              href="/about"
              className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              เกี่ยวกับเรา
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-gray-700 dark:text-gray-300"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle menu"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              {isOpen ? (
                <path d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden py-4 space-y-2">
            <Link
              href="/"
              className="block px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
              onClick={() => setIsOpen(false)}
            >
              หน้าหลัก
            </Link>
            <Link
              href="/chapters"
              className="block px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
              onClick={() => setIsOpen(false)}
            >
              บทเรียน
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}

