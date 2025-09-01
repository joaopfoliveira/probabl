/**
 * About page
 */

import { Metadata } from 'next';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Brain, Target, TrendingUp, Users } from 'lucide-react';

export const metadata: Metadata = {
  title: 'About Us | Its Probabl',
  description: 'Learn about our AI-powered betting tips platform and how we help bettors make informed decisions.',
  openGraph: {
    title: 'About Us | Its Probabl',
    description: 'Learn about our AI-powered betting tips platform and how we help bettors make informed decisions.',
  },
};

export default function AboutPage() {
  return (
    <div className="container py-8 max-w-4xl">
      <div className="mb-8">
        <Button variant="outline" size="sm" asChild className="mb-4">
          <Link href="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Link>
        </Button>
        
        <h1 className="text-4xl font-bold mb-2">About Its Probabl</h1>
        <p className="text-xl text-muted-foreground">
          Revolutionizing sports betting with artificial intelligence
        </p>
      </div>

      <div className="space-y-8">
        {/* Mission Section */}
        <section>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-primary" />
                Our Mission
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg leading-relaxed">
                We believe that sports betting should be informed, strategic, and data-driven. 
                Our mission is to democratize access to sophisticated betting analysis through 
                cutting-edge artificial intelligence, helping both novice and experienced bettors 
                make more informed decisions.
              </p>
            </CardContent>
          </Card>
        </section>

        {/* How It Works */}
        <section>
          <h2 className="text-2xl font-bold mb-6">How Our AI Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <Target className="h-8 w-8 text-primary mb-2" />
                <CardTitle className="text-lg">Data Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <p>
                  Our AI processes thousands of data points including team statistics, 
                  player performance, weather conditions, and historical matchups.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Brain className="h-8 w-8 text-primary mb-2" />
                <CardTitle className="text-lg">Machine Learning</CardTitle>
              </CardHeader>
              <CardContent>
                <p>
                  Advanced algorithms learn from past results and continuously improve 
                  prediction accuracy by identifying complex patterns in the data.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <TrendingUp className="h-8 w-8 text-primary mb-2" />
                <CardTitle className="text-lg">Predictions</CardTitle>
              </CardHeader>
              <CardContent>
                <p>
                  Generate daily betting tips with confidence levels, risk assessments, 
                  and detailed rationale for each recommendation.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Features */}
        <section>
          <Card>
            <CardHeader>
              <CardTitle>What We Offer</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start gap-3">
                  <div className="h-2 w-2 rounded-full bg-primary mt-2 flex-shrink-0"></div>
                  <div>
                    <h3 className="font-semibold">Daily AI Predictions</h3>
                    <p className="text-sm text-muted-foreground">
                      Fresh betting tips every day across multiple sports
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="h-2 w-2 rounded-full bg-primary mt-2 flex-shrink-0"></div>
                  <div>
                    <h3 className="font-semibold">Risk Assessment</h3>
                    <p className="text-sm text-muted-foreground">
                      Clear risk levels for each betting recommendation
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="h-2 w-2 rounded-full bg-primary mt-2 flex-shrink-0"></div>
                  <div>
                    <h3 className="font-semibold">Performance Tracking</h3>
                    <p className="text-sm text-muted-foreground">
                      Historical results and success rate analytics
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="h-2 w-2 rounded-full bg-primary mt-2 flex-shrink-0"></div>
                  <div>
                    <h3 className="font-semibold">Detailed Analysis</h3>
                    <p className="text-sm text-muted-foreground">
                      In-depth rationale behind each prediction
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Stats */}
        <section>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                Our Track Record
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
                <div>
                  <div className="text-3xl font-bold text-primary">85%+</div>
                  <div className="text-sm text-muted-foreground">Win Rate</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-primary">10K+</div>
                  <div className="text-sm text-muted-foreground">Predictions</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-primary">50+</div>
                  <div className="text-sm text-muted-foreground">Sports Leagues</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-primary">24/7</div>
                  <div className="text-sm text-muted-foreground">AI Analysis</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Disclaimer */}
        <section>
          <Card className="border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/10">
            <CardContent className="pt-6">
              <h3 className="font-semibold mb-2 text-amber-800 dark:text-amber-200">
                Important Disclaimer
              </h3>
              <p className="text-sm text-amber-700 dark:text-amber-300">
                Please gamble responsibly. Our predictions are for informational purposes only 
                and do not guarantee winnings. Never bet more than you can afford to lose. 
                If you have a gambling problem, please seek help.
              </p>
            </CardContent>
          </Card>
        </section>

        {/* CTA */}
        <section className="text-center py-8">
          <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-lg text-muted-foreground mb-6">
            Join thousands of successful bettors using our AI predictions
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button asChild size="lg">
              <Link href="/today">
                View Today&apos;s Tips
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/history">
                Check History
              </Link>
            </Button>
          </div>
        </section>
      </div>
    </div>
  );
}