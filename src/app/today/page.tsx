/**
 * Today's Tips page - organized by sport with detailed view of all tips
 */

import { Metadata } from 'next';

import { TipCard } from '@/components/TipCard';
import { AdSlotInArticle } from '@/components/AdSlot';
import { MainAffiliateButton } from '@/components/AffiliateButton';

import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { getLatestDailyTips, getTodayDateISO } from '@/lib/data';
import { Calendar, Goal, Trophy, Zap } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Today\'s Betting Tips | AI Predictions',
  description: 'Get today\'s top AI-generated betting tips and predictions. Daily updated sports betting analysis and winning strategies.',
  openGraph: {
    title: 'Today\'s Betting Tips | AI Predictions',
    description: 'Get today\'s top AI-generated betting tips and predictions. Daily updated sports betting analysis and winning strategies.',
  },
};

export default async function TodayPage() {
  const dailyTipsData = await getLatestDailyTips();
  const todayDate = getTodayDateISO();
  
  // Extract tips array from the daily tips payload and filter only pending tips
  const allTips = dailyTipsData?.tips || [];
  const tips = allTips.filter(tip => tip.result === 'pending');
  
  // Group tips by sport
  const groupedTips = tips.reduce((groups: Record<string, typeof tips>, tip) => {
    const sport = tip.legs?.[0]?.sport || 'Other';
    if (!groups[sport]) {
      groups[sport] = [];
    }
    groups[sport].push(tip);
    return groups;
  }, {});
  
  // Get sport icon
  const getSportIcon = (sport: string) => {
    switch (sport.toLowerCase()) {
      case 'football':
        return <Goal className="h-5 w-5" />;
      case 'tennis':
        return <Trophy className="h-5 w-5" />;
      case 'basketball':
        return <Zap className="h-5 w-5" />;
      default:
        return <Trophy className="h-5 w-5" />;
    }
  };
  
  return (
    <div className="container py-8 max-w-4xl">
      {/* Header */}
      <div className="mb-8">


        <h1 className="text-4xl font-bold mb-2">It&apos;s Probabl that today</h1>

        <div className="flex items-center gap-2 mb-2">
          <Calendar className="h-5 w-5 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">
            {new Date(todayDate).toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </span>
        </div>



      </div>

      {/* Statistics Card - Performance Overview (Commented out) */}
      {/*
      <Card className="mb-8">
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="h-5 w-5 text-green-600" />
            <span className="font-semibold">Performance Overview</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-green-600">85%</div>
              <div className="text-sm text-muted-foreground">Win Rate</div>
            </div>
            <div>
              <div className="text-2xl font-bold">+12.4%</div>
              <div className="text-sm text-muted-foreground">ROI</div>
            </div>
            <div>
              <div className="text-2xl font-bold">{tips.length}</div>
              <div className="text-sm text-muted-foreground">Today's Tips</div>
            </div>
            <div>
              <div className="text-2xl font-bold">2.1</div>
              <div className="text-sm text-muted-foreground">Avg Odds</div>
            </div>
          </div>
        </CardContent>
      </Card>
      */}

      {/* Tips Grouped by Sport */}
      <div className="space-y-8 mb-8">
        {Object.keys(groupedTips).length > 0 ? (
          Object.entries(groupedTips).map(([sport, sportTips], sportIndex) => (
            <div key={sport} className="space-y-4">
              {/* Sport Header */}
              <div className="flex items-center gap-3 mb-4">
                <div className="flex items-center gap-2 text-primary">
                  {getSportIcon(sport)}
                  <h2 className="text-2xl font-bold">{sport}</h2>
                </div>
                <div className="flex-1 h-px bg-border"></div>
                <span className="text-sm text-muted-foreground bg-muted px-3 py-1 rounded-full">
                  {sportTips.length} tip{sportTips.length !== 1 ? 's' : ''}
                </span>
              </div>
              
              {/* Tips for this sport */}
              <div className="space-y-6">
                {sportTips.map((tip, tipIndex) => (
                  <div key={tip.id || `${sport}-${tipIndex}`}>
                    <TipCard
                      tip={tip}
                      showDetails={true}
                    />
                    {tipIndex < sportTips.length - 1 && <Separator className="my-6" />}
                  </div>
                ))}
              </div>
              
              {/* Separator between sports */}
              {sportIndex < Object.keys(groupedTips).length - 1 && (
                <div className="pt-6">
                  <Separator />
                </div>
              )}
            </div>
          ))
        ) : (
          <Card>
            <CardContent className="p-8 text-center">
              <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Tips Available Today</h3>
              <p className="text-muted-foreground">
                Tips are usually published early in the morning. Please check back later.
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Ad Slot */}
      <AdSlotInArticle className="my-8" />

      {/* CTA Section */}
      <Card>
        <CardContent className="p-8 text-center">
          <h2 className="text-2xl font-bold mb-2">Ready to Place Your Bets?</h2>
          <p className="text-muted-foreground mb-4">
            Get the best odds and start winning with our recommended bookmakers.
          </p>
          <MainAffiliateButton locale="en" />
        </CardContent>
      </Card>

      {/* Disclaimer */}
      <div className="mt-8 p-4 bg-muted/50 rounded-lg">
        <p className="text-sm text-muted-foreground text-center">
          <strong>Disclaimer:</strong> Betting involves risk. Please gamble responsibly and never bet more than you can afford to lose. 
          Our predictions are for informational purposes only and do not guarantee winnings.
        </p>
      </div>
    </div>
  );
}