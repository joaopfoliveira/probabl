/**
 * API endpoint to search tips with filters and pagination
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
    
    // Get tips from Supabase
    const tipsResult = await getTipsWithFiltersFromDb(validatedFilters, page, limit);
    
    return NextResponse.json({
      ...tipsResult,
      page,
      limit,
    });
  } catch (error) {
    console.error('Error searching tips:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
