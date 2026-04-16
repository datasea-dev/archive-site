import { MetadataRoute } from 'next'
import { db } from '@/lib/firebase'
import { collection, getDocs } from 'firebase/firestore'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://archive.datasea.id'

  // 1. Jurnal tetap Dinamis (Karena punya halaman [id])
  let jurnalEntries: MetadataRoute.Sitemap = []
  try {
    const jurnalSnap = await getDocs(collection(db, "submissions"));
    jurnalEntries = jurnalSnap.docs.map((doc) => ({
      url: `${baseUrl}/jurnal/${doc.id}`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    }))
  } catch (e) { console.error(e) }

  // 2. Return Sitemap
  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/materi`, // Cukup halaman utama materi
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/jurnal`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
    ...jurnalEntries, 
  ]
}