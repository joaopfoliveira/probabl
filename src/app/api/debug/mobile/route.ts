import { NextResponse } from 'next/server';
import { getLatestTipsFromDb } from '@/lib/supabase-data';

/**
 * Debug endpoint specifically for mobile cache issues
 */
export async function GET() {
  const timestamp = new Date().toISOString();
  
  try {
    // Get latest tips
    const latestTips = await getLatestTipsFromDb();
    
    // Return debug info
    return NextResponse.json({
      success: true,
      timestamp,
      debug: {
        hasTips: !!latestTips,
        tipsCount: latestTips?.tips?.length || 0,
        dateISO: latestTips?.dateISO || null,
        generatedBy: latestTips?.generatedBy || null,
        version: latestTips?.version || null,
        environment: process.env.NODE_ENV,
        vercel: {
          region: process.env.VERCEL_REGION || 'unknown',
          url: process.env.VERCEL_URL || 'unknown'
        }
      },
      tips: latestTips?.tips?.map(tip => ({
        id: tip.id,
        betType: tip.betType,
        risk: tip.risk,
        result: tip.result,
        sport: tip.legs[0]?.sport || 'unknown'
      })) || []
    }, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate, max-age=0',
        'Pragma': 'no-cache',
        'Expires': '0',
        'Surrogate-Control': 'no-store',
        'CDN-Cache-Control': 'no-store',
        'Vercel-CDN-Cache-Control': 'no-store',
        'X-Cache-Status': 'MISS',
        'X-Debug-Timestamp': timestamp,
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      timestamp,
      error: error instanceof Error ? error.message : 'Unknown error',
      debug: {
        environment: process.env.NODE_ENV,
        vercel: {
          region: process.env.VERCEL_REGION || 'unknown', 
          url: process.env.VERCEL_URL || 'unknown'
        }
      }
    }, {
      status: 500,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
        'X-Debug-Error': 'true',
      },
    });
  }
}
