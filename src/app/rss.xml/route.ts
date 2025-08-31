import { NextResponse } from 'next/server';
// import { generateRSSData } from '@/lib/blog'; // Commented out - Blog disabled

export async function GET() {
  // Blog RSS disabled - return empty RSS or redirect
  return NextResponse.json({ message: 'RSS feed temporarily disabled' }, { status: 404 });

  /*
  try {
    const rssData = await generateRSSData(); // Default to English
    
    const rssXml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${rssData.title}</title>
    <description>${rssData.description}</description>
    <link>${rssData.siteUrl}</link>
    <language>${rssData.language}</language>
    <atom:link href="${rssData.feedUrl}" rel="self" type="application/rss+xml" />
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    ${rssData.posts.map(post => `
    <item>
      <title><![CDATA[${post.meta.title}]]></title>
      <description><![CDATA[${post.meta.description}]]></description>
      <link>${rssData.siteUrl}/blog/${post.slug}</link>
      <guid isPermaLink="true">${rssData.siteUrl}/blog/${post.slug}</guid>
      <pubDate>${new Date(post.meta.publishedAt).toUTCString()}</pubDate>
      ${post.meta.author ? `<author>${post.meta.author}</author>` : ''}
      ${post.meta.tags.map(tag => `<category>${tag}</category>`).join('')}
    </item>`).join('')}
  </channel>
</rss>`;

    return new NextResponse(rssXml, {
      headers: {
        'Content-Type': 'application/rss+xml; charset=utf-8',
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
      },
    });
  } catch (error) {
    console.error('Error generating RSS feed:', error);
    return new NextResponse('Error generating RSS feed', { status: 500 });
  }
  */
}
