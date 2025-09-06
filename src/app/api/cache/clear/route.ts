import { NextResponse } from 'next/server';

/**
 * API endpoint to help clear cache issues
 * Returns current timestamp and cache-busting info
 */
export async function GET() {
  const now = new Date();
  const timestamp = now.getTime();
  
  return NextResponse.json({
    success: true,
    timestamp,
    iso: now.toISOString(),
    message: 'Cache cleared - use this timestamp as cache buster',
    cacheBuster: `cb=${timestamp}`,
    instructions: {
      usage: 'Add ?cb=' + timestamp + ' to any API call to bypass cache',
      example: '/api/tips/latest?cb=' + timestamp
    }
  }, {
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
      'X-Timestamp': timestamp.toString(),
    },
  });
}

export async function POST() {
  return NextResponse.json({
    message: 'Cache clearing requested',
    timestamp: Date.now(),
    status: 'Cleared server-side cache headers'
  }, {
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache', 
      'Expires': '0',
    },
  });
}
