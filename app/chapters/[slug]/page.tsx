import { notFound } from "next/navigation";
import { getChapters, getChapterBySlug } from "@/lib/chapter-data";
import ModelViewer from "@/app/components/ModelViewer/ModelViewer";
import SectionNavigation from "@/app/components/Content/SectionNavigation";
import ContentRenderer from "@/app/components/Content/ContentRenderer";
import ProgressTracker from "@/app/components/Content/ProgressTracker";
import SectionProgressTracker from "@/app/components/Progress/SectionProgressTracker";
import Link from "next/link";

export async function generateStaticParams() {
  const chapters = await getChapters();
  return chapters.map((chapter) => ({
    slug: chapter.slug,
  }));
}

export default async function ChapterPage({
  params,
}: {
  params: { slug: string };
}) {
  const chapter = await getChapterBySlug(params.slug);

  if (!chapter) {
    notFound();
  }

  const chapters = await getChapters();
  const currentIndex = chapters.findIndex((c) => c.slug === params.slug);
  const prevChapter = currentIndex > 0 ? chapters[currentIndex - 1] : null;
  const nextChapter =
    currentIndex < chapters.length - 1 ? chapters[currentIndex + 1] : null;

  return (
    <div className="lg:pl-64 w-full">
      <div className="mx-auto lg:mx-0 px-4 lg:px-6 py-8 max-w-7xl lg:ml-0">
        <div className="mb-8 overflow-x-hidden">
          <Link
            href="/chapters"
            className="text-blue-600 dark:text-blue-400 hover:underline mb-4 inline-block"
          >
            ← กลับไปที่บทเรียน
          </Link>
          <h1 className="text-4xl font-bold mt-4 mb-4 text-gray-900 dark:text-gray-100">{chapter.title}</h1>
          {chapter.description && (
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-4">
              {chapter.description}
            </p>
          )}
          {chapter.sections && chapter.sections.length > 0 && (
            <ProgressTracker sections={chapter.sections} chapterSlug={chapter.slug} />
          )}
        </div>

        <div className="flex flex-col lg:flex-row gap-4 lg:gap-8 items-start">
          {/* Main content */}
          <div className="flex-1 min-w-0 w-full overflow-x-hidden">
            <div className="space-y-12">
              {chapter.sections && chapter.sections.length > 0 ? (
                chapter.sections.map((section, index) => (
                  <section
                    key={index}
                    id={`section-${index}`}
                    className="scroll-mt-20"
                  >
                    <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
                      {section.title}
                    </h2>

                    {section.content && (
                      <ContentRenderer content={section.content} />
                    )}

                {section.models && section.models.length > 0 && (
                  <div className="space-y-6 mb-8">
                    {section.models.map((model, modelIndex) => (
                      <div
                        key={modelIndex}
                        className="bg-gray-50 dark:bg-gray-900 p-4 md:p-6 rounded-lg border border-gray-200 dark:border-gray-800"
                      >
                        <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
                          {model.title || "3D Model"}
                        </h3>
                        <div className="w-full h-[400px] md:h-[500px] rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800">
                          <ModelViewer
                            modelPath={model.path}
                            annotations={model.annotations}
                          />
                        </div>
                        {model.description && (
                          <p className="mt-4 text-gray-600 dark:text-gray-300">
                            {model.description}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Section Progress Tracker */}
                {chapter.sections && (
                  <SectionProgressTracker
                    chapterSlug={chapter.slug}
                    sectionIndex={index}
                    totalSections={chapter.sections.length}
                  />
                )}
              </section>
            ))
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-600 dark:text-gray-400">
                    เรากำลังสร้างบทเรียน. กลับมาใหม่เร็วๆ นี้นะ!
                  </p>
                </div>
              )}
            </div>

            {/* Navigation between chapters */}
            <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-800 flex flex-col sm:flex-row justify-between gap-4">
              {prevChapter ? (
                <Link
                  href={`/chapters/${prevChapter.slug}`}
                  className="text-blue-600 dark:text-blue-400 hover:underline flex items-center"
                >
                  ← {prevChapter.title}
                </Link>
              ) : (
                <div></div>
              )}
              {nextChapter ? (
                <Link
                  href={`/chapters/${nextChapter.slug}`}
                  className="text-blue-600 dark:text-blue-400 hover:underline flex items-center"
                >
                  {nextChapter.title} →
                </Link>
              ) : (
                <div></div>
              )}
            </div>
          </div>

          {/* Sidebar navigation */}
          {chapter.sections && chapter.sections.length > 0 && (
            <aside className="hidden lg:block w-64 flex-shrink-0">
              <SectionNavigation
                sections={chapter.sections}
                chapterSlug={chapter.slug}
              />
            </aside>
          )}
        </div>
      </div>
    </div>
  );
}

