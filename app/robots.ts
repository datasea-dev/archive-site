import { MetadataRoute } from 'next'
 
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: '/private/', // Contoh folder yang dilarang
    },
    sitemap: 'https://archive.datasea.id/sitemap.xml',
  }
}