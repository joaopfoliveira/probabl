import { MetadataRoute } from 'next';
// import { getBlogPosts } from '@/lib/blog'; // Commented out - Blog disabled
import { getAvailableDates } from '@/lib/data';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.SITE_URL || 'https://betting-tips-ai.com';
  
  // Get blog posts for English only - COMMENTED OUT
  // const posts = await getBlogPosts('en');
  
  // Get some recent dates for history pages
  const tipDates = (await getAvailableDates()).slice(0, 30); // Last 30 days
  
  const staticPages = [
    // Home page
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1,
    },
    
    // Today's tips
    {
      url: `${baseUrl}/today`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.9,
    },
    
    // History page
    {
      url: `${baseUrl}/history`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.8,
    },
    
    // Blog index page - COMMENTED OUT
    /*
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    },
    */
    
    // About page
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    },
    
    // Legal pages
    {
      url: `${baseUrl}/privacy`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.3,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.3,
    },
  ];
  
  // Blog post URLs - COMMENTED OUT
  /*
  const blogUrls = posts.map(post => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: new Date(post.meta.updatedAt || post.meta.publishedAt),
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }));
  */
  const blogUrls: never[] = []; // Empty array when blog is disabled
  
  // History date URLs (last 30 days)
  const historyUrls = tipDates.map(date => ({
    url: `${baseUrl}/history/${date}`,
    lastModified: new Date(),
    changeFrequency: 'never' as const,
    priority: 0.4,
  }));
  
  return [
    ...staticPages,
    ...blogUrls,
    ...historyUrls,
  ];
}
