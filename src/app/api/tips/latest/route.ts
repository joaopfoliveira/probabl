/**
 * API endpoint to get the latest daily tips
 */

import { NextResponse } from 'next/server';
import { getLatestDailyTips } from '@/lib/data';

export async function GET() {
  try {
    const latestTips = await getLatestDailyTips();
    
    if (!latestTips) {
      return NextResponse.json(
        { error: 'No tips available' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(latestTips);
  } catch (error) {
    console.error('Error fetching latest tips:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
