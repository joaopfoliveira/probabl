import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { DailyTipsPayloadSchema } from '@/lib/schemas';
import { ZodError } from 'zod';

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();
    
    // Validate the payload with our schema
    const validatedData = DailyTipsPayloadSchema.parse(body);
    
    // Extract date from dateISO (format: YYYY-MM-DD)
    const { dateISO } = validatedData;
    
    // Ensure data directory exists
    const dataDir = join(process.cwd(), 'data', 'daily');
    try {
      await mkdir(dataDir, { recursive: true });
    } catch (error) {
      // Directory might already exist, ignore error
    }
    
    // Create file path
    const filePath = join(dataDir, `${dateISO}.json`);
    
    // Write the validated data to file
    await writeFile(filePath, JSON.stringify(validatedData, null, 2), 'utf-8');
    
    return NextResponse.json({
      success: true,
      message: `Daily tips for ${dateISO} created successfully`,
      data: {
        date: dateISO,
        tipsCount: validatedData.tips.length,
        filePath: `data/daily/${dateISO}.json`
      }
    }, { status: 201 });
    
  } catch (error) {
    console.error('Error creating daily tips:', error);
    
    if (error instanceof ZodError) {
      console.error('Zod validation errors:', error.issues);
      return NextResponse.json({
        success: false,
        error: 'Validation failed',
        details: error.issues
      }, { status: 400 });
    }
    
    if (error instanceof SyntaxError) {
      return NextResponse.json({
        success: false,
        error: 'Invalid JSON format'
      }, { status: 400 });
    }
    
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}

// Optional: Add GET method to return API documentation
export async function GET() {
  return NextResponse.json({
    endpoint: 'POST /api/tips/create',
    description: 'Create or update daily betting tips',
    requestBody: {
      required: true,
      contentType: 'application/json',
      schema: 'DailyTipsPayload',
      example: {
        version: 2,
        dateISO: '2025-09-02',
        generatedAt: '2025-09-02T10:00:00.000Z',
        generatedBy: 'admin',
        tips: [
          {
            id: 'tip-001',
            betType: 'single',
            risk: 'safe',
            legs: [
              {
                sport: 'football',
                league: 'Premier League',
                event: { name: 'Arsenal vs Chelsea' },
                market: 'Match Result',
                selection: 'Arsenal Win',
                avgOdds: 2.10,
                bookmakers: [
                  { name: 'Bet365', odds: 2.10 },
                  { name: 'Betfair', odds: 2.05 },
                  { name: 'William Hill', odds: 2.15 }
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
      500: 'Server error'
    }
  });
}
