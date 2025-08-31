/**
 * Home page - landing page with hero section and features
 */

import { Metadata } from 'next';
import { AdSlotInArticle } from '@/components/AdSlot';
import { MainAffiliateButton } from '@/components/AffiliateButton';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, TrendingUp, Target, Zap } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Probabl - AI-Powered Betting Tips & Predictions',
  description: 'Get daily AI-generated betting tips and sports predictions. Our advanced algorithms analyze data to provide you with winning betting strategies.',
  openGraph: {
    title: 'Probabl - AI-Powered Betting Tips & Predictions',
    description: 'Get daily AI-generated betting tips and sports predictions. Our advanced algorithms analyze data to provide you with winning betting strategies.',
  },
};

export default function HomePage() {
  return (
    <div className="container py-8 space-y-12">
      {/* Hero Section */}
      <section className="text-center space-y-6 py-12">
        <div className="space-y-4">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
            Probabl Betting Tips
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Daily predictions powered by artificial intelligence
          </p>
          <p className="text-base text-muted-foreground max-w-3xl mx-auto">
            Our advanced AI algorithms analyze thousands of data points to generate winning betting tips. Get accurate predictions for football, basketball, tennis and more.
          </p>
        </div>
        
        <div className="flex flex-wrap justify-center gap-4">
          <Button asChild size="lg">
            <a href="/today">
              View Today's Tips
              <ArrowRight className="ml-2 h-4 w-4" />
            </a>
          </Button>
          <MainAffiliateButton locale="en" />
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="text-center">
            <CardHeader>
              <Target className="h-10 w-10 mx-auto text-primary mb-2" />
              <CardTitle className="text-lg">High Accuracy</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Our AI models achieve industry-leading accuracy rates through advanced machine learning algorithms.
              </p>
            </CardContent>
          </Card>
          
          <Card className="text-center">
            <CardHeader>
              <Zap className="h-10 w-10 mx-auto text-primary mb-2" />
              <CardTitle className="text-lg">Real-Time Updates</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Get instant notifications and updates on all your favorite sports and betting markets.
              </p>
            </CardContent>
          </Card>
          
          <Card className="text-center">
            <CardHeader>
              <TrendingUp className="h-10 w-10 mx-auto text-primary mb-2" />
              <CardTitle className="text-lg">Proven Results</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Track your success with detailed statistics and performance analytics for all predictions.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Today's Tips Preview - Removed to avoid redundancy with /today page */}
      {/*
      <section className="py-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-2">Today's Featured Tips</h2>
          <p className="text-muted-foreground">
            Our top AI predictions for today's matches
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {latestTips?.tips?.slice(0, 3).map((tip, index) => (
            <TipCard
              key={tip.id || index}
              tip={tip}
              locale="en"
              compact={true}
            />
          )) || <div className="col-span-3 text-center text-muted-foreground">No tips available today</div>}
        </div>
        
        <div className="text-center">
          <Button asChild size="lg" variant="outline">
            <a href="/today">
              View All Today's Tips
              <ArrowRight className="ml-2 h-4 w-4" />
            </a>
          </Button>
        </div>
      </section>
      */}

      {/* Ad Slot */}
      <AdSlotInArticle className="my-12" />

      {/* Recent Performance - Removed to avoid redundancy with /history page */}
      {/*
      <section className="py-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-2">Recent Performance</h2>
          <p className="text-muted-foreground">
            Check out our latest predictions and their results
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {recentTips.slice(0, 4).map((tip, index) => (
            <TipCard
              key={tip.id || index}
              tip={tip}
              date={tip.date}
              locale="en"
              showDetails={true}
            />
          ))}
        </div>
        
        <div className="text-center">
          <Button asChild size="lg" variant="outline">
            <a href="/history">
              View Full History
              <ArrowRight className="ml-2 h-4 w-4" />
            </a>
          </Button>
        </div>
      </section>
      */}

      {/* CTA Section "Ready to Start Winning?" - Removed */}
      {/*
      <section className="text-center py-12 bg-muted/50 rounded-lg">
        <div className="space-y-4 max-w-2xl mx-auto px-6">
          <h2 className="text-3xl font-bold">Ready to Start Winning?</h2>
          <p className="text-muted-foreground">
            Join thousands of successful bettors who trust our AI predictions daily.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button asChild size="lg">
              <a href="/today">
                Get Today's Tips
                <ArrowRight className="ml-2 h-4 w-4" />
              </a>
            </Button>
            <MainAffiliateButton locale="en" />
          </div>
        </div>
      </section>
      */}
    </div>
  );
}
