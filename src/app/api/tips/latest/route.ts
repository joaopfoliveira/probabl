/**
 * API endpoint to get the latest daily tips
 */

import { NextResponse } from 'next/server';
import { getLatestTipsFromDb } from '@/lib/supabase-data';

export async function GET() {
  try {
    const latestTips = await getLatestTipsFromDb();
    
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
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
