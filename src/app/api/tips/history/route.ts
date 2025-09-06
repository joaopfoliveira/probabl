import { NextRequest, NextResponse } from 'next/server';
import { getTipsWithFiltersFromDb } from '@/lib/supabase-data';
import { validateTipFilters } from '@/lib/schemas';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Extract pagination
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    
    // Validate pagination (allow higher limits for admin)
    if (page < 1 || limit < 1 || limit > 10000) {
      return NextResponse.json(
        { error: 'Invalid pagination parameters' },
        { status: 400 }
      );
    }
    
    // Extract and validate filters from query parameters
    const rawFilters = {
      ...(searchParams.get('sport') && { sport: searchParams.get('sport') }),
      ...(searchParams.get('risk') && { risk: searchParams.get('risk') }),
      ...(searchParams.get('result') && { result: searchParams.get('result') }),
      ...(searchParams.get('dateFrom') && { dateFrom: searchParams.get('dateFrom') }),
      ...(searchParams.get('dateTo') && { dateTo: searchParams.get('dateTo') }),
    };
    
    // Validate filters with proper typing
    const filters = validateTipFilters(rawFilters);
    
    // Get filtered tips
    const data = await getTipsWithFiltersFromDb(filters, page, limit);
    
    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    });
  } catch (error) {
    console.error('Error fetching tips history:', error);
    
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
