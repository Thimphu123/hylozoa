import Link from "next/link";
import React from "react";

export const metadata = {
  title: "เกี่ยวกับเรา",
};

export default function AboutPage(): JSX.Element {
  return (
    <div className="w-full px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <header className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100">เกี่ยวกับ Hylozoa</h1>
        </header>

        <section aria-labelledby="our-mission" className="mt-8">
          <h2 id="our-mission" className="text-2xl font-semibold mb-3 text-gray-900 dark:text-gray-100">
            ภารกิจของเรา
          </h2>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
            Hylozoa มีเป้าหมายเพื่อทำให้การเรียนชีววิทยาเป็นเรื่องที่เข้าถึงได้สำหรับ
            ผู้เรียนชาวไทย โดยผสมผสานคำอธิบายที่กระชับ ภาพประกอบ และโมเดล 3 มิติ
            ที่ผู้เรียนสามารถหมุน แยกชิ้น และดูองค์ประกอบต่าง ๆ ได้ด้วยตนเอง
          </p>
        </section>

        <section aria-labelledby="what-we-offer" className="mt-6">
          <h2 id="what-we-offer" className="text-2xl font-semibold mb-3 text-gray-900 dark:text-gray-100">
            สิ่งที่เราเสนอ
          </h2>
          <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300">
            <li>
              <strong>เนื้อหาเป็นภาษาไทย</strong> — อธิบายด้วยคำที่เข้าใจง่าย
              เหมาะสำหรับนักเรียนม.ต้น - ม.ปลายและผู้หาความรู้ทั่วไป
            </li>
            <li>
              <strong>โมเดล 3 มิติแบบ interactive</strong> — หมุน ซูม และแยกชิ้นส่วน
              เพื่อเห็นโครงสร้างภายในอย่างชัดเจน
            </li>
            <li>
              <strong>บทเรียนสรุป</strong> — สรุปใจความสำคัญพร้อมตัวอย่างและภาพประกอบ
            </li>
          </ul>
        </section>

        <section aria-labelledby="who-made" className="mt-8">
          <h2 id="who-made" className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
            ผู้พัฒนา
          </h2>

          <div className="mt-4 flex items-center gap-4">
            {/* TODO: เปลี่ยนเป็นรูป/ข้อมูลจริงของคุณ */}
            <div className="h-20 w-20 rounded-full bg-gray-200 dark:bg-gray-800 flex-shrink-0" />
            <div>
              <p className="font-semibold text-gray-900 dark:text-gray-100">เย็นศิระ พยอมพันธ์</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                นักพัฒนาและผู้จัดทำเนื้อหา — ปัจจุบันเป็นนักเรียน ม.3 โรงเรียนสาธิตมหาวิทยาลัยศรีนครินทรวิโรฒ ปทุมวัน
              </p>
              <p className="mt-2 text-sm">
                <Link
                  href="/contact"
                  className="text-blue-600 hover:underline dark:text-blue-400"
                >
                  ติดต่อผู้พัฒนา
                </Link>
              </p>
            </div>
          </div>

          <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
            หากคุณต้องการเป็นส่วนหนึ่งของ Hylozoa เช่น ร่วมทำเนื้อหา
            หรือมีข้อเสนอแนะเกี่ยวกับโมเดล 3 มิติ กรุณาติดต่อเรา — รายละเอียดจะใส่ไว้ที่หน้าติดต่อ
          </p>
        </section>

        <section aria-labelledby="cta" className="mt-8 text-center border-t border-gray-200 dark:border-gray-800">
          <h3 id="cta" className="text-xl font-semibold mt-6 text-gray-900 dark:text-gray-100">เริ่มเรียนกับเรา</h3>
          <p className="mt-2 text-gray-600 dark:text-gray-300">
            เริ่มต้นสำรวจบทเรียนและโมเดล 3 มิติ เพื่อเข้าใจชีววิทยาอย่างลึกซึ้งยิ่งขึ้น
          </p>
          <div className="mt-7">
            <Link
              href="/chapters"
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors"
            >
              ไปที่บทเรียน →
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
