import Link from "next/link";

export default function Home() {
  return (
    <div className="w-full px-4 py-12 lg:pl-0">
      <div className="prose max-w-4xl mx-auto">
        <div className="text-center my-12">
          <h1 className="text-5xl lg:text-7xl font-bold pt-8 my-4">
            ยินดีต้อนรับสู่ <span className="bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">Hylozoa</span>
          </h1>
          <p className="text-xl lg:text-3xl text-gray-600 dark:text-gray-300 my-8">
            แหล่งรวมความรู้ทางชีววิทยาสำหรับคนไทย
          </p>
        </div>

        <div className="text-center mt-16">
          <Link
            href="/chapters"
            className="inline-block text-xl bg-blue-950 hover:bg-blue-800 shadow-md shadow-blue-900 hover:shadow-xl text-white py-4 px-8 rounded-lg transition-colors transition-shadow duration-200"
          >
            เริ่มเรียน →
          </Link>
        </div>
      </div>
    </div>
  );
}

