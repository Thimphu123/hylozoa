import Link from "next/link";
import { getChapters } from "@/lib/chapter-data";
import ProgressDashboard from "@/app/components/Progress/ProgressDashboard";
import ChapterCard from "@/app/components/Progress/ChapterCard";

export default async function ChaptersPage() {
  const chapters = await getChapters();

  return (
    <div className="lg:ml-64">
      <div className="prose container mx-auto px-4 py-12 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">บทเรียน</h1>
          <p className="text-gray-600 dark:text-gray-400">
            เรียนรู้ชีววิทยาผ่านคำอธิบายที่เข้าใจง่ายและพร้อมโมเดล 3 มิติ และสื่อประกอบ
          </p>
        </div>

        {chapters.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400 text-lg mb-4">
              บทเรียนจะมาเพิ่มเร็วๆ นี้
            </p>
            <p className="text-gray-500 dark:text-gray-500">
              เรากำลังเรียบเรียงบทเรียน และสร้างโมเดล 3 มิติอยู่
            </p>
          </div>
        ) : (
          <>
            {/* Progress Dashboard */}
            <div className="mb-8">
              <ProgressDashboard chapters={chapters} />
            </div>

            {/* Chapter Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {chapters.map((chapter) => (
                <ChapterCard key={chapter.slug} chapter={chapter} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

