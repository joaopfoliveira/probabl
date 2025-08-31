/**
 * Individual blog post page - English only
 */

import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { MDXRemote } from 'next-mdx-remote/rsc';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { AdSlotInArticle } from '@/components/AdSlot';
import { getBlogPost, getRelatedPosts, getBlogPosts } from '@/lib/blog';
import { ArrowLeft, Calendar, Clock, Share2, Tag } from 'lucide-react';
import { format, parseISO } from 'date-fns';

interface BlogPostPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const posts = await getBlogPosts('en');
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getBlogPost(slug, 'en');
  
  if (!post) {
    return {
      title: 'Post Not Found',
    };
  }
  
  const siteUrl = process.env.SITE_URL || 'https://betting-tips-ai.com';
  const postUrl = `${siteUrl}/blog/${slug}`;
  
  return {
    title: post.meta.title,
    description: post.meta.description,
    openGraph: {
      title: post.meta.title,
      description: post.meta.description,
      type: 'article',
      url: postUrl,
      publishedTime: post.meta.publishedAt,
      modifiedTime: post.meta.updatedAt,
      tags: post.meta.tags,
      images: post.meta.image ? [post.meta.image] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: post.meta.title,
      description: post.meta.description,
      images: post.meta.image ? [post.meta.image] : undefined,
    },
    alternates: {
      canonical: postUrl,
    },
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = await getBlogPost(slug, 'en');
  
  if (!post) {
    notFound();
  }
  
  const relatedPosts = await getRelatedPosts(post, 3);
  
  return (
    <div className="container py-8 max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="outline" size="sm" asChild>
            <a href="/blog">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Blog
            </a>
          </Button>
          
          <Button variant="outline" size="sm" className="ml-auto">
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </Button>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <time dateTime={post.meta.publishedAt}>
                {format(parseISO(post.meta.publishedAt), 'MMM d, yyyy')}
              </time>
            </div>
            
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span>{post.readingTime.text}</span>
            </div>
            
            {post.meta.author && (
              <div>
                By {post.meta.author}
              </div>
            )}
          </div>
          
          <h1 className="text-3xl md:text-4xl font-bold leading-tight">
            {post.meta.title}
          </h1>
          
          <p className="text-xl text-muted-foreground leading-relaxed">
            {post.meta.description}
          </p>
          
          {post.meta.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {post.meta.tags.map((tag) => (
                <Badge key={tag} variant="secondary" asChild>
                  <a href={`/blog?tag=${encodeURIComponent(tag)}`}>
                    <Tag className="h-3 w-3 mr-1" />
                    {tag}
                  </a>
                </Badge>
              ))}
            </div>
          )}
        </div>
      </div>
      
      {/* Featured Image */}
      {post.meta.image && (
        <div className="mb-8">
          <img 
            src={post.meta.image} 
            alt={post.meta.title}
            className="w-full h-64 md:h-96 object-cover rounded-lg"
          />
        </div>
      )}
      
      {/* Content */}
      <article className="prose prose-lg dark:prose-invert max-w-none">
        <MDXRemote source={post.content} />
      </article>
      
      {/* Ad Slot */}
      <div className="my-8">
        <AdSlotInArticle />
      </div>
      
      {/* Author Info */}
      {post.meta.author && (
        <Card className="my-8">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                {post.meta.author.charAt(0)}
              </div>
              <div>
                <h3 className="font-semibold">{post.meta.author}</h3>
                <p className="text-sm text-muted-foreground">
                  Sports Betting Analyst
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Related Posts */}
      {relatedPosts.length > 0 && (
        <div className="mt-12">
          <Separator className="mb-8" />
          
          <h2 className="text-2xl font-bold mb-6">
            Related Articles
          </h2>
          
          <div className="grid gap-6 md:grid-cols-3">
            {relatedPosts.map((relatedPost) => (
              <Card key={relatedPost.slug} className="hover:shadow-lg transition-shadow duration-200">
                <CardHeader>
                  <CardTitle className="text-base line-clamp-2">
                    <a 
                      href={`/blog/${relatedPost.slug}`}
                      className="hover:text-primary transition-colors"
                    >
                      {relatedPost.meta.title}
                    </a>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                    {relatedPost.meta.description}
                  </p>
                  
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    <time dateTime={relatedPost.meta.publishedAt}>
                      {format(parseISO(relatedPost.meta.publishedAt), 'MMM d, yyyy')}
                    </time>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
      
      {/* Back to Blog */}
      <div className="mt-12 text-center">
        <Button asChild>
          <a href="/blog">
            View More Articles
          </a>
        </Button>
      </div>
    </div>
  );
}
