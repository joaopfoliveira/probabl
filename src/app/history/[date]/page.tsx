/**
 * Daily history page - shows tips for a specific date
 */

import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { TipCard } from '@/components/TipCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, Calendar } from 'lucide-react';
import { loadDailyTipsFromDb } from '@/lib/supabase-data';
import { format, parseISO, isValid } from 'date-fns';

interface DailyHistoryPageProps {
  params: Promise<{ date: string }>;
}

export async function generateMetadata({ params }: DailyHistoryPageProps): Promise<Metadata> {
  const { date } = await params;
  
  const parsedDate = parseISO(date);
  if (!isValid(parsedDate)) {
    return {
      title: 'Invalid Date',
      description: 'The requested date is invalid.',
    };
  }

  const formattedDate = format(parsedDate, 'MMMM d, yyyy');
  
  return {
    title: `Betting Tips for ${formattedDate} | Daily Results`,
    description: `Check the betting tips and results for ${formattedDate}. View our AI predictions and their outcomes.`,
    openGraph: {
      title: `Betting Tips for ${formattedDate} | Daily Results`,
      description: `Check the betting tips and results for ${formattedDate}. View our AI predictions and their outcomes.`,
    },
    twitter: {
      title: `Betting Tips for ${formattedDate} | Daily Results`,
      description: `Check the betting tips and results for ${formattedDate}. View our AI predictions and their outcomes.`,
    },
  };
}

export default async function DailyHistoryPage({ params }: DailyHistoryPageProps) {
  const { date } = await params;
  
  // Validate date format
  const parsedDate = parseISO(date);
  if (!isValid(parsedDate)) {
    notFound();
  }

  const dailyTips = await loadDailyTipsFromDb(date);
  const tips = dailyTips?.tips || [];
  const formattedDate = format(parsedDate, 'EEEE, MMMM d, yyyy');
  
  return (
    <div className="container py-8 max-w-6xl">
      {/* Header */}
      <div className="mb-8">
        <Button variant="outline" size="sm" asChild className="mb-4">
          <Link href="/history">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to History
          </Link>
        </Button>
        
        <div className="flex items-center gap-2 mb-2">
          <Calendar className="h-5 w-5 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">{formattedDate}</span>
        </div>
        
        <h1 className="text-4xl font-bold mb-2">Daily Tips & Results</h1>
        <p className="text-xl text-muted-foreground">
          All predictions for {format(parsedDate, 'MMM d, yyyy')}
        </p>
      </div>

      {/* Tips */}
      {tips.length > 0 ? (
        <div className="space-y-6">
          {tips.map((tip, index) => (
            <TipCard
              key={tip.id || index}
              tip={tip}
              date={date}
              showDetails={true}
            />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-8 text-center">
            <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Tips Found</h3>
            <p className="text-muted-foreground">
              No betting tips were found for this date.
            </p>
            <Button asChild className="mt-4" variant="outline">
              <Link href="/history">
                Browse Other Dates
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Summary Statistics */}
      {tips.length > 0 && (
        <Card className="mt-8">
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold mb-4">Daily Summary</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold">{tips.length}</div>
                <div className="text-sm text-muted-foreground">Total Tips</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">
                  {tips.filter(tip => tip.result === 'win').length}
                </div>
                <div className="text-sm text-muted-foreground">Wins</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-red-600">
                  {tips.filter(tip => tip.result === 'loss').length}
                </div>
                <div className="text-sm text-muted-foreground">Losses</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-600">
                  {tips.filter(tip => tip.result === 'pending').length}
                </div>
                <div className="text-sm text-muted-foreground">Pending</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}