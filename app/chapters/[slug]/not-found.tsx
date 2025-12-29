import Link from "next/link";

export default function NotFound() {
  return (
    <div className="container mx-auto px-4 py-12 text-center">
      <h1 className="text-4xl font-bold mb-4">Chapter Not Found</h1>
      <p className="text-gray-600 dark:text-gray-400 mb-8">
        The chapter you're looking for doesn't exist or hasn't been created yet.
      </p>
      <Link
        href="/chapters"
        className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors duration-200"
      >
        Back to Chapters
      </Link>
    </div>
  );
}

