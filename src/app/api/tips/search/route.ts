/**
 * API endpoint to search tips with filters and pagination
 */

import { NextRequest, NextResponse } from 'next/server';
import { getTipsWithFilters, calculateTipStats } from '@/lib/data';
import { validateTipFilters } from '@/lib/schemas';
import type { TipFilters } from '@/lib/types';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    
    // Parse query parameters for filters
    const filters: Partial<TipFilters> = {};
    
    if (searchParams.get('sport')) {
      filters.sport = searchParams.get('sport')!;
    }
    
    if (searchParams.get('risk')) {
      filters.risk = searchParams.get('risk') as TipFilters['risk'];
    }
    
    if (searchParams.get('result')) {
      filters.result = searchParams.get('result') as TipFilters['result'];
    }
    
    if (searchParams.get('dateFrom')) {
      filters.dateFrom = searchParams.get('dateFrom')!;
    }
    
    if (searchParams.get('dateTo')) {
      filters.dateTo = searchParams.get('dateTo')!;
    }
    
    // Parse pagination parameters
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    
    // Validate pagination
    if (page < 1 || limit < 1 || limit > 100) {
      return NextResponse.json(
        { error: 'Invalid pagination parameters' },
        { status: 400 }
      );
    }
    
    // Validate filters
    let validatedFilters: TipFilters;
    try {
      validatedFilters = validateTipFilters(filters);
    } catch (_error) {
      return NextResponse.json(
        { error: 'Invalid filter parameters' },
        { status: 400 }
      );
    }
    
    // Get tips and stats
    const [tipsResult, stats] = await Promise.all([
      getTipsWithFilters(validatedFilters, page, limit),
      searchParams.get('includeStats') === 'true' 
        ? calculateTipStats(validatedFilters)
        : null,
    ]);
    
    return NextResponse.json({
      ...tipsResult,
      page,
      limit,
      stats,
    });
  } catch (error) {
    console.error('Error searching tips:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
