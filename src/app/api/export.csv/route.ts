/**
 * API endpoint to export tips as CSV
 */

import { NextRequest, NextResponse } from 'next/server';
import { getTipsWithFiltersFromDb } from '@/lib/supabase-data';
import { validateTipFilters } from '@/lib/schemas';
import type { TipFilters } from '@/lib/types';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    
    // Extract filters from query parameters safely
    const rawFilters = {
      ...(searchParams.get('sport') && { sport: searchParams.get('sport') }),
      ...(searchParams.get('risk') && { risk: searchParams.get('risk') }),
      ...(searchParams.get('result') && { result: searchParams.get('result') }),
      ...(searchParams.get('dateFrom') && { dateFrom: searchParams.get('dateFrom') }),
      ...(searchParams.get('dateTo') && { dateTo: searchParams.get('dateTo') }),
    };
    
    // Validate filters with proper typing
    let validatedFilters: TipFilters;
    try {
      validatedFilters = validateTipFilters(rawFilters);
    } catch (_error) {
      return NextResponse.json(
        { error: 'Invalid filter parameters' },
        { status: 400 }
      );
    }
    
    // Get tips data from Supabase
    const { tips } = await getTipsWithFiltersFromDb(validatedFilters);
    
    // Convert tips to CSV format
    const csvData: any[] = [];
    tips.forEach(tip => {
      if (tip.betType === 'single' && tip.legs.length > 0) {
        const leg = tip.legs[0];
        csvData.push({
          id: tip.id,
          date: validatedFilters.dateFrom || 'N/A',
          betType: tip.betType,
          risk: tip.risk,
          sport: leg.sport,
          league: leg.league || '',
          eventName: leg.event.name,
          homeTeam: leg.event.home || '',
          awayTeam: leg.event.away || '',
          market: leg.market,
          selection: leg.selection,
          avgOdds: leg.avgOdds,
          rationale: tip.rationale,
          result: tip.result
        });
      } else if (tip.betType === 'accumulator') {
        // For accumulators, create one row with combined data
        csvData.push({
          id: tip.id,
          date: validatedFilters.dateFrom || 'N/A',
          betType: tip.betType,
          risk: tip.risk,
          sport: 'Multiple',
          league: 'Multiple',
          eventName: tip.legs.map(l => l.event.name).join('; '),
          homeTeam: tip.legs.map(l => l.event.home || '').join('; '),
          awayTeam: tip.legs.map(l => l.event.away || '').join('; '),
          market: tip.legs.map(l => l.market).join('; '),
          selection: tip.legs.map(l => l.selection).join('; '),
          avgOdds: tip.combined?.avgOdds || tip.legs.reduce((acc, leg) => acc * leg.avgOdds, 1),
          rationale: tip.rationale,
          result: tip.result
        });
      }
    });
    
    if (csvData.length === 0) {
      return NextResponse.json(
        { error: 'No data to export' },
        { status: 404 }
      );
    }
    
    // Convert to CSV format
    const headers = Object.keys(csvData[0]);
    const csvContent = [
      headers.join(','),
      ...csvData.map(row => 
        headers.map(header => {
          const value = row[header as keyof typeof row];
          // Escape commas and quotes in CSV
          if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
            return `"${value.replace(/"/g, '""')}"`;
          }
          return value;
        }).join(',')
      ),
    ].join('\n');
    
    // Return CSV with appropriate headers
    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="tips-export-${new Date().toISOString().split('T')[0]}.csv"`,
      },
    });
  } catch (error) {
    console.error('Error exporting CSV:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
