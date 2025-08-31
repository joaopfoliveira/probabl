/**
 * Blog page - list of all blog posts
 */

import { Metadata } from 'next';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Calendar, Clock } from 'lucide-react';
import { getAllBlogPosts } from '@/lib/blog';
import { format } from 'date-fns';

export const metadata: Metadata = {
  title: 'Blog | Betting Tips & Sports Analysis',
  description: 'Read our latest articles on sports betting strategies, AI predictions, and expert analysis.',
  openGraph: {
    title: 'Blog | Betting Tips & Sports Analysis',
    description: 'Read our latest articles on sports betting strategies, AI predictions, and expert analysis.',
  },
  twitter: {
    title: 'Blog | Betting Tips & Sports Analysis',
    description: 'Read our latest articles on sports betting strategies, AI predictions, and expert analysis.',
  },
};

export default async function BlogPage() {
  const posts = await getAllBlogPosts();

  return (
    <div className="container py-8 max-w-6xl">
      {/* Header */}
      <div className="mb-8">
        <Button variant="outline" size="sm" asChild className="mb-4">
          <Link href="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Link>
        </Button>
        
        <h1 className="text-4xl font-bold mb-2">Blog & Analysis</h1>
        <p className="text-xl text-muted-foreground">
          Expert insights on sports betting and AI predictions
        </p>
      </div>

      {/* Posts Grid */}
      {posts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post) => (
            <Card key={post.slug} className="hover:shadow-md transition-shadow duration-200">
              <CardHeader>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                  <Calendar className="h-4 w-4" />
                  <span>{format(new Date(post.meta.publishedAt), 'MMM d, yyyy')}</span>
                  <Clock className="h-4 w-4 ml-2" />
                  <span>{post.readingTime.text}</span>
                </div>
                <CardTitle className="line-clamp-2 hover:text-primary">
                  <Link href={`/blog/${post.slug}`}>
                    {post.meta.title}
                  </Link>
                </CardTitle>
                <CardDescription className="line-clamp-3">
                  {post.excerpt}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex flex-wrap gap-2 mb-4">
                  {post.meta.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
                <Button asChild size="sm" variant="outline">
                  <Link href={`/blog/${post.slug}`}>
                    Read More
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-8 text-center">
            <h3 className="text-lg font-semibold mb-2">No Blog Posts Yet</h3>
            <p className="text-muted-foreground">
              We&apos;re working on creating valuable content for you. Please check back soon!
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}