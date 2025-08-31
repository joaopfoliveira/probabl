/**
 * API endpoint to get tips for a specific date
 */

import { NextRequest, NextResponse } from 'next/server';
import { loadDailyTips } from '@/lib/data';
import { validateDateISO } from '@/lib/schemas';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const date = searchParams.get('date');
    
    if (!date) {
      return NextResponse.json(
        { error: 'Date parameter is required' },
        { status: 400 }
      );
    }
    
    // Validate date format
    let validatedDate: string;
    try {
      validatedDate = validateDateISO(date);
    } catch (_error) {
      return NextResponse.json(
        { error: 'Invalid date format. Expected YYYY-MM-DD' },
        { status: 400 }
      );
    }
    
    const dailyTips = await loadDailyTips(validatedDate);
    
    if (!dailyTips) {
      return NextResponse.json(
        { error: `No tips found for ${validatedDate}` },
        { status: 404 }
      );
    }
    
    return NextResponse.json(dailyTips);
  } catch (error) {
    console.error('Error fetching tips by date:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
