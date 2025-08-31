'use client';

/**
 * Component to display a betting tip in card format
 */

// Removed next-intl - using English only
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { BadgeRisk } from '@/components/BadgeRisk';
import { ResultsChip } from '@/components/ResultsChip';
import { Eye, TrendingUp } from 'lucide-react';
import type { TipItem } from '@/lib/types';

interface TipCardProps {
  tip: TipItem;
  date?: string;
  // Removed locale parameter - English only
  showDetails?: boolean;
  onViewDetails?: () => void;
  compact?: boolean;
}

export function TipCard({ 
  tip, 
  date, 
  
  showDetails = false, 
  onViewDetails,
  compact = false 
}: TipCardProps) {
  const rationale = tip.rationale || 'No rationale available';
  
  // Helper function to format event name
  const formatEventName = (event: { name?: string; home?: string; away?: string }) => {
    return event?.name || 
      (event?.home && event?.away ? `${event.home} vs ${event.away}` : 
       event?.home || event?.away || 'Event');
  };
  
  if (compact) {
    return (
      <Card className="hover:shadow-md transition-shadow duration-200">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <BadgeRisk risk={tip.risk} size="sm" />
            <Badge variant={tip.betType === 'accumulator' ? 'secondary' : 'outline'} className="text-xs">
              {tip.betType === 'accumulator' ? `Accumulator (${tip.legs?.length || 0})` : 'Single'}
            </Badge>
            {tip.result && <ResultsChip result={tip.result} size="sm" />}
          </div>

          {tip.betType === 'single' ? (
            // Single bet compact view
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="space-y-1">
                  <p className="font-medium text-sm truncate" title={formatEventName(tip.legs?.[0]?.event)}>
                    {formatEventName(tip.legs?.[0]?.event)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {tip.legs?.[0]?.sport} {tip.legs?.[0]?.league && `• ${tip.legs?.[0]?.league}`}
                  </p>
                  <p className="text-xs">
                    <span className="font-medium">{tip.legs?.[0]?.market}:</span> {tip.legs?.[0]?.selection}
                  </p>
                </div>
              </div>
              
              <div className="flex flex-col items-end gap-2">
                <div className="text-right">
                  <div className="text-lg font-bold text-primary">
                    {tip.legs?.[0]?.avgOdds?.toFixed(2) || 'N/A'}
                  </div>
                  <div className="text-xs text-muted-foreground">Odds</div>
                </div>
              </div>
            </div>
          ) : (
            // Accumulator compact view
            <div className="space-y-2">
              <div className="space-y-1">
                {tip.legs?.slice(0, 2).map((leg, index) => (
                  <div key={index} className="flex justify-between items-center text-xs">
                    <span className="truncate flex-1 pr-2">{formatEventName(leg.event)} - {leg.selection}</span>
                    <span className="font-medium">{leg.avgOdds?.toFixed(2)}</span>
                  </div>
                ))}
                {(tip.legs?.length || 0) > 2 && (
                  <div className="text-xs text-muted-foreground">
                    +{(tip.legs?.length || 0) - 2} more legs...
                  </div>
                )}
              </div>
              
              <div className="flex items-center justify-between pt-2 border-t">
                <span className="text-xs font-medium">Combined Odds:</span>
                <span className="text-lg font-bold text-primary">
                  {tip.combined?.avgOdds?.toFixed(2) || 'N/A'}
                </span>
              </div>
            </div>
          )}
          
          {onViewDetails && (
            <Button size="sm" variant="outline" onClick={onViewDetails} className="w-full mt-3">
              <Eye className="h-3 w-3 mr-1" />
              Details
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="hover:shadow-lg transition-shadow duration-200">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <BadgeRisk risk={tip.risk} />
              <Badge variant={tip.betType === 'accumulator' ? 'secondary' : 'outline'}>
                {tip.betType === 'accumulator' ? `Accumulator (${tip.legs?.length || 0})` : 'Single'}
              </Badge>
              {tip.result && <ResultsChip result={tip.result} />}
              {date && (
                <Badge variant="outline" className="text-xs">
                  {date}
                </Badge>
              )}
            </div>
            
            {tip.betType === 'single' ? (
              <>
                <h3 className="font-semibold text-lg leading-tight mb-1">
                  {formatEventName(tip.legs?.[0]?.event)}
                </h3>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>{tip.legs?.[0]?.sport}</span>
                  {tip.legs?.[0]?.league && (
                    <>
                      <span>•</span>
                      <span>{tip.legs?.[0]?.league}</span>
                    </>
                  )}
                </div>
              </>
            ) : (
              <>
                <h3 className="font-semibold text-lg leading-tight mb-1">
                  {tip.legs?.length || 0} Leg Accumulator
                </h3>
                <div className="text-sm text-muted-foreground">
                  Multiple selections combined
                </div>
              </>
            )}
          </div>
          
          <div className="text-right">
            <div className="text-2xl font-bold text-primary">
              {tip.betType === 'accumulator' ? 
                (tip.combined?.avgOdds?.toFixed(2) || 'N/A') : 
                (tip.legs?.[0]?.avgOdds?.toFixed(2) || 'N/A')
              }
            </div>
            <div className="text-xs text-muted-foreground">
              {tip.betType === 'accumulator' ? 'Combined Odds' : 'Odds'}
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <Separator className="mb-4" />
        
        <div className="space-y-4">
          {tip.betType === 'single' ? (
            // Single bet details
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Market</span>
                <p className="font-medium">{tip.legs?.[0]?.market || 'N/A'}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Selection</span>
                <p className="font-medium">{tip.legs?.[0]?.selection || 'N/A'}</p>
              </div>
            </div>
          ) : (
            // Accumulator legs details
            <div className="space-y-3">
              <div className="space-y-2">
                {tip.legs?.map((leg, index) => (
                  <div key={index} className="bg-muted/30 rounded-lg p-3 space-y-2">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="text-sm">
                          <p className="font-medium">{formatEventName(leg.event)}</p>
                          <p className="text-muted-foreground text-xs">
                            {leg.sport} {leg.league && `• ${leg.league}`}
                          </p>
                        </div>
                        
                        <div className="text-xs mt-1">
                          <span className="font-medium">{leg.market}:</span> {leg.selection}
                        </div>
                      </div>
                      
                      <div className="text-sm font-bold text-primary ml-3">
                        {leg.avgOdds?.toFixed(2)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="bg-primary/10 rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Combined Odds</span>
                  <span className="text-lg font-bold text-primary">
                    {tip.combined?.avgOdds?.toFixed(2) || 'N/A'}
                  </span>
                </div>
                {tip.combined?.bookmakers && tip.combined.bookmakers.length > 0 && (
                  <div className="mt-2 text-xs text-muted-foreground">
                    Best odds: {Math.max(...tip.combined.bookmakers.map(b => b.odds)).toFixed(2)}
                  </div>
                )}
              </div>
            </div>
          )}
          
          {showDetails && (
            <div className="pt-2">
              <span className="text-muted-foreground text-sm">Rationale</span>
              <p className="mt-1 text-sm leading-relaxed">{rationale}</p>
            </div>
          )}
          
          {!showDetails && onViewDetails && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onViewDetails}
              className="w-full mt-4"
            >
              <Eye className="h-4 w-4 mr-2" />
              View Details
            </Button>
          )}
          
          {showDetails && tip.result === 'pending' && (
            <div className="flex items-center gap-2 pt-2 text-sm text-muted-foreground">
              <TrendingUp className="h-4 w-4" />
              <span>Live odds may vary</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
