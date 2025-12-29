import { getChapters } from "@/lib/chapter-data";
import NavigationClient from "./NavigationClient";

export default async function Navigation() {
  const chapters = await getChapters();

  return <NavigationClient chapters={chapters} />;
}

