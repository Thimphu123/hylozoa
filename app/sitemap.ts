import { MetadataRoute } from 'next'
import { getChapters } from '@/lib/chapter-data'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const chapters = await getChapters()
  
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://hylozoa.vercel.app'
  
  const chapterUrls = chapters.map((chapter) => ({
    url: `${baseUrl}/chapters/${chapter.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 1,
    },
    {
      url: `${baseUrl}/chapters`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    ...chapterUrls,
  ]
}

