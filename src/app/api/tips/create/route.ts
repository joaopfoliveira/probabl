import { NextRequest, NextResponse } from 'next/server';
import { DailyTipsPayloadSchema } from '@/lib/schemas';
import { ZodError } from 'zod';
import { saveDailyTipsToDb } from '@/lib/supabase-data';

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();
    
    // Validate the payload with our schema
    const validatedData = DailyTipsPayloadSchema.parse(body);
    
    // Save to Supabase
    await saveDailyTipsToDb(validatedData);
    
    return NextResponse.json({
      success: true,
      message: `Daily tips for ${validatedData.dateISO} created successfully`,
      data: {
        dateISO: validatedData.dateISO,
        tipCount: validatedData.tips.length,
        riskBreakdown: {
          safe: validatedData.tips.filter(tip => tip.risk === 'safe').length,
          medium: validatedData.tips.filter(tip => tip.risk === 'medium').length,
          high: validatedData.tips.filter(tip => tip.risk === 'high').length,
        },
        betTypeBreakdown: {
          single: validatedData.tips.filter(tip => tip.betType === 'single').length,
          accumulator: validatedData.tips.filter(tip => tip.betType === 'accumulator').length,
        },
      }
    }, { status: 201 });
    
  } catch (error) {
    console.error('Error creating daily tips:', error);
    
    // Handle Zod validation errors
    if (error instanceof ZodError) {
      return NextResponse.json({
        success: false,
        error: 'Validation failed',
        details: error.issues
      }, { status: 400 });
    }
    
    // Handle JSON parsing errors
    if (error instanceof SyntaxError) {
      return NextResponse.json({
        success: false,
        error: 'Invalid JSON format'
      }, { status: 400 });
    }
    
    // Generic error handler
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error'
    }, { status: 500 });
  }
}

// Optional: Add GET method to return API documentation
export async function GET() {
  return NextResponse.json({
    endpoint: 'POST /api/tips/create',
    description: 'Create daily betting tips in Supabase database',
    requestBody: {
      required: true,
      contentType: 'application/json',
      schema: 'DailyTipsPayload (V2)',
      example: {
        version: 2,
        dateISO: '2025-09-05',
        generatedAt: '2025-09-05T10:00:00.000Z',
        generatedBy: 'manual',
        tips: [
          {
            id: 'tip-safe-001',
            betType: 'single',
            risk: 'safe',
            legs: [
              {
                sport: 'Football',
                league: 'Premier League',
                event: {
                  name: 'Arsenal vs Chelsea',
                  home: 'Arsenal',
                  away: 'Chelsea',
                  scheduledAt: '2025-09-05T15:00:00.000Z',
                  timezone: 'Europe/London'
                },
                market: 'Match Result',
                selection: 'Arsenal Win',
                avgOdds: 2.10,
                bookmakers: [
                  { name: 'bet365', odds: 2.10 },
                  { name: 'Betfair', odds: 2.05 },
                  { name: 'Unibet', odds: 2.15 }
                ]
              }
            ],
            rationale: 'Arsenal has strong home form and Chelsea is missing key players.',
            result: 'pending'
          }
        ]
      }
    },
    responses: {
      201: 'Tips created successfully',
      400: 'Validation error or invalid JSON',
      500: 'Server error (check Supabase connection)'
    }
  });
}