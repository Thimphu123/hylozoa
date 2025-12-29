import { NextResponse } from "next/server";
import { getChapters } from "@/lib/chapter-data";

export async function GET() {
  try {
    const chapters = await getChapters();
    return NextResponse.json(chapters);
  } catch (error) {
    console.error("Error fetching chapters:", error);
    return NextResponse.json(
      { error: "Failed to fetch chapters" },
      { status: 500 }
    );
  }
}

