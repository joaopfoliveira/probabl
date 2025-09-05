import { NextRequest, NextResponse } from 'next/server';
import { getTipsWithFiltersFromDb } from '@/lib/supabase-data';
import { validateTipFilters } from '@/lib/schemas';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Get format parameter
    const format = searchParams.get('format') || 'json';
    
    // Extract and validate filters from query parameters
    const rawFilters = {
      ...(searchParams.get('sport') && { sport: searchParams.get('sport') }),
      ...(searchParams.get('risk') && { risk: searchParams.get('risk') }),
      ...(searchParams.get('result') && { result: searchParams.get('result') }),
      ...(searchParams.get('betType') && { betType: searchParams.get('betType') }),
      ...(searchParams.get('minLegs') && { minLegs: parseInt(searchParams.get('minLegs')!) }),
      ...(searchParams.get('dateFrom') && { dateFrom: searchParams.get('dateFrom') }),
      ...(searchParams.get('dateTo') && { dateTo: searchParams.get('dateTo') }),
    };
    
    // Validate filters with proper typing
    const filters = validateTipFilters(rawFilters);
    
    // Get all matching tips (no pagination for export)
    const data = await getTipsWithFiltersFromDb(filters, 1, 1000);
    
    if (format === 'csv') {
      // Generate V2 CSV with flattened legs
      const csvHeaders = [
        'dateISO',
        'tipId', 
        'betType',
        'risk',
        'legIndex',
        'sport',
        'league',
        'eventName',
        'market',
        'selection',
        'legAvgOdds',
        'legBookmakersJSON',
        'combinedAvgOdds',
        'combinedBookmakersJSON',
        'result'
      ];
      
      const csvRows: string[][] = [];
      
      data.tips.forEach(tip => {
        // Add one row per leg
        tip.legs?.forEach((leg, legIndex) => {
          const eventName = leg.event?.name || 
            (leg.event?.home && leg.event?.away ? `${leg.event.home} vs ${leg.event.away}` : '');
          
          csvRows.push([
            tip.date || '',
            tip.id || '',
            tip.betType || '',
            tip.risk || '',
            legIndex.toString(),
            leg.sport || '',
            leg.league || '',
            `"${eventName.replace(/"/g, '""')}"`,
            `"${(leg.market || '').replace(/"/g, '""')}"`,
            `"${(leg.selection || '').replace(/"/g, '""')}"`,
            leg.avgOdds?.toString() || '',
            `"${JSON.stringify(leg.bookmakers || []).replace(/"/g, '""')}"`,
            tip.combined?.avgOdds?.toString() || '',
            `"${JSON.stringify(tip.combined?.bookmakers || []).replace(/"/g, '""')}"`,
            tip.result || ''
          ]);
        });
        
        // For accumulators, add one summary row
        if (tip.betType === 'accumulator' && tip.combined) {
          csvRows.push([
            tip.date || '',
            tip.id || '',
            tip.betType || '',
            tip.risk || '',
            '', // null legIndex for summary
            '', // null sport
            '', // null league
            '', // null eventName
            '', // null market
            '', // null selection
            '', // null legAvgOdds
            '', // null legBookmakersJSON
            tip.combined.avgOdds?.toString() || '',
            `"${JSON.stringify(tip.combined.bookmakers || []).replace(/"/g, '""')}"`,
            tip.result || ''
          ]);
        }
      });
      
      const csvContent = [
        csvHeaders.join(','),
        ...csvRows.map(row => row.join(','))
      ].join('\n');
      
      return new NextResponse(csvContent, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="betting-tips-v2-${new Date().toISOString().split('T')[0]}.csv"`,
          'Cache-Control': 'no-cache',
        },
      });
    } else {
      // Return JSON
      return NextResponse.json(data, {
        headers: {
          'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
        },
      });
    }
  } catch (error) {
    console.error('Error exporting tips:', error);
    
    // Handle validation errors specifically
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Invalid filter parameters', details: error.message },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
