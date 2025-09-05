import { NextRequest, NextResponse } from 'next/server';
import { updateTipResultInDb } from '@/lib/supabase-data';
import type { Result } from '@/lib/types';

interface UpdateResultRequest {
  tipId: string;
  result: Result;
}

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body: UpdateResultRequest = await request.json();
    const { tipId, result } = body;
    
    // Validate input
    if (!tipId || !result) {
      return NextResponse.json({
        success: false,
        error: 'tipId and result are required'
      }, { status: 400 });
    }
    
    if (!['pending', 'win', 'loss', 'void'].includes(result)) {
      return NextResponse.json({
        success: false,
        error: 'result must be one of: pending, win, loss, void'
      }, { status: 400 });
    }
    
    // Update tip result in Supabase
    await updateTipResultInDb(tipId, result);
    
    return NextResponse.json({
      success: true,
      message: `Tip '${tipId}' result updated to '${result}'`,
      data: {
        tipId,
        newResult: result
      }
    });
    
  } catch (error) {
    console.error('Error updating tip result:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error'
    }, { status: 500 });
  }
}

// Optional: Add GET method to return API documentation
export async function GET() {
  return NextResponse.json({
    endpoint: 'POST /api/tips/update-result',
    description: 'Update the result of a specific betting tip',
    requestBody: {
      required: true,
      contentType: 'application/json',
      schema: {
        tipId: 'string (required) - The ID of the tip to update',
        result: 'string (required) - One of: pending, win, loss, void',
        date: 'string (optional) - YYYY-MM-DD format. If provided, only search in this date file'
      },
      examples: [
        {
          description: 'Update tip result (search all files)',
          body: {
            tipId: 'tip-001',
            result: 'win'
          }
        },
        {
          description: 'Update tip result in specific date',
          body: {
            tipId: 'tip-002',
            result: 'loss',
            date: '2025-09-01'
          }
        }
      ]
    },
    responses: {
      200: 'Tip result updated successfully',
      400: 'Invalid request body or validation error',
      404: 'Tip not found',
      500: 'Server error'
    }
  });
}
