/**
 * Blog utilities for loading and managing MDX posts
 */

import { promises as fs } from 'fs';
import path from 'path';
import matter from 'gray-matter';
import readingTime from 'reading-time';

export interface BlogPostMeta {
  title: string;
  description: string;
  publishedAt: string;
  updatedAt?: string;
  tags: string[];
  image?: string;
  author?: string;
  featured?: boolean;
}

export interface BlogPost {
  slug: string;
  locale: string;
  meta: BlogPostMeta;
  content: string;
  readingTime: {
    text: string;
    minutes: number;
    time: number;
    words: number;
  };
  excerpt: string;
}

const BLOG_DIR = path.join(process.cwd(), 'content', 'blog');

/**
 * Get all blog posts for a specific locale
 */
// English-only version
export async function getAllBlogPosts(): Promise<BlogPost[]> {
  return getBlogPosts('en');
}

export async function getBlogPosts(locale: string = 'en'): Promise<BlogPost[]> {
  const localeDir = path.join(BLOG_DIR, locale);
  
  try {
    // Check if directory exists
    try {
      await fs.access(localeDir);
    } catch {
      // Directory doesn't exist, return empty array
      return [];
    }

    const files = await fs.readdir(localeDir);
    const mdxFiles = files.filter(file => file.endsWith('.mdx'));
    
    const posts = await Promise.all(
      mdxFiles.map(async (file) => {
        const slug = file.replace('.mdx', '');
        return await getBlogPost(slug, locale);
      })
    );
    
    // Filter out null posts and sort by date
    return posts
      .filter((post): post is BlogPost => post !== null)
      .sort((a, b) => new Date(b.meta.publishedAt).getTime() - new Date(a.meta.publishedAt).getTime());
  } catch (error) {
    console.error(`Error reading blog posts for locale ${locale}:`, error);
    return [];
  }
}

/**
 * Get a specific blog post by slug and locale
 */
export async function getBlogPost(slug: string, locale: string = 'en'): Promise<BlogPost | null> {
  const filePath = path.join(BLOG_DIR, locale, `${slug}.mdx`);
  
  try {
    const fileContent = await fs.readFile(filePath, 'utf-8');
    const { data, content } = matter(fileContent);
    
    const meta = data as BlogPostMeta;
    const stats = readingTime(content);
    
    return {
      slug,
      locale,
      meta,
      content,
      readingTime: stats,
      excerpt: meta.description || content.slice(0, 160) + '...',
    };
  } catch (error) {
    console.error(`Error reading blog post ${slug} for locale ${locale}:`, error);
    return null;
  }
}

/**
 * Get featured blog posts
 */
export async function getFeaturedPosts(locale: string = 'en', limit = 3): Promise<BlogPost[]> {
  const posts = await getBlogPosts(locale);
  return posts
    .filter(post => post.meta.featured)
    .slice(0, limit);
}

/**
 * Get posts by tag
 */
export async function getPostsByTag(tag: string, locale: string = 'en'): Promise<BlogPost[]> {
  const posts = await getBlogPosts(locale);
  return posts.filter(post => 
    post.meta.tags.some(postTag => 
      postTag.toLowerCase() === tag.toLowerCase()
    )
  );
}

/**
 * Get all unique tags for a locale
 */
export async function getAllTags(locale: string = 'en'): Promise<string[]> {
  const posts = await getBlogPosts(locale);
  const allTags = posts.flatMap(post => post.meta.tags);
  return [...new Set(allTags)].sort();
}

/**
 * Get related posts based on tags
 */
export async function getRelatedPosts(currentPost: BlogPost, limit = 3): Promise<BlogPost[]> {
  const allPosts = await getBlogPosts(currentPost.locale);
  
  // Filter out current post and calculate relevance score
  const otherPosts = allPosts
    .filter(post => post.slug !== currentPost.slug)
    .map(post => {
      const commonTags = post.meta.tags.filter(tag => 
        currentPost.meta.tags.includes(tag)
      );
      return {
        post,
        score: commonTags.length,
      };
    })
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
  
  return otherPosts.map(item => item.post);
}

/**
 * Generate RSS feed data
 */
export async function generateRSSData(locale: string = 'en') {
  const posts = await getBlogPosts(locale);
  const siteUrl = process.env.SITE_URL || 'https://betting-tips-ai.com';
  
  return {
    title: 'Betting Tips AI - Blog',
    description: 'Educational articles about sports betting and market analysis',
    siteUrl,
    feedUrl: `${siteUrl}/rss.xml`,
    language: 'en',
    posts: posts.slice(0, 20), // Latest 20 posts
  };
}
