import { NextRequest, NextResponse } from 'next/server';
import { getTipsWithFilters } from '@/lib/data';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Extract filters from query parameters
    const sport = searchParams.get('sport') || undefined;
    const risk = searchParams.get('risk') || undefined;
    const result = searchParams.get('result') || undefined;
    const dateFrom = searchParams.get('dateFrom') || undefined;
    const dateTo = searchParams.get('dateTo') || undefined;
    
    // Extract pagination
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    
    // Validate pagination
    if (page < 1 || limit < 1 || limit > 100) {
      return NextResponse.json(
        { error: 'Invalid pagination parameters' },
        { status: 400 }
      );
    }
    
    // Build filters object
    const filters = {
      ...(sport && { sport }),
      ...(risk && { risk }),
      ...(result && { result }),
      ...(dateFrom && { dateFrom }),
      ...(dateTo && { dateTo }),
    };
    
    // Get filtered tips
    const data = await getTipsWithFilters(filters, page, limit);
    
    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
      },
    });
  } catch (error) {
    console.error('Error fetching tips history:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
