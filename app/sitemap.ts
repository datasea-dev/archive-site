import { MetadataRoute } from 'next'
 
export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://archive.datasea.id' // Ganti domain nanti

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 1,
    },
    {
      url: `${baseUrl}/materi`,
      lastModified: new Date(),
      changeFrequency: 'weekly', // Karena materi sering update
      priority: 0.8,
    },
    {
      url: `${baseUrl}/jurnal`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
  ]
}