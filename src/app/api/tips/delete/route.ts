import { NextRequest, NextResponse } from 'next/server';
import { deleteTipFromDb } from '@/lib/supabase-data';

interface DeleteTipRequest {
  tipId: string;
}

export async function DELETE(request: NextRequest) {
  try {
    // Parse request body
    const body: DeleteTipRequest = await request.json();
    const { tipId } = body;
    
    // Validate input
    if (!tipId) {
      return NextResponse.json({
        success: false,
        error: 'tipId is required'
      }, { status: 400 });
    }
    
    // Delete tip from Supabase (will cascade delete legs and bookmaker odds)
    await deleteTipFromDb(tipId);
    
    return NextResponse.json({
      success: true,
      message: `Tip '${tipId}' deleted successfully`,
      data: {
        tipId
      }
    });
    
  } catch (error) {
    console.error('Error deleting tip:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error'
    }, { status: 500 });
  }
}

// Optional: Add GET method to return API documentation
export async function GET() {
  return NextResponse.json({
    endpoint: 'DELETE /api/tips/delete',
    description: 'Delete a betting tip and all related data from Supabase database',
    requestBody: {
      required: true,
      contentType: 'application/json',
      schema: {
        tipId: 'string (required) - ID of the tip to delete'
      },
      example: {
        tipId: 'tip-safe-001'
      }
    },
    responses: {
      200: 'Tip deleted successfully',
      400: 'Missing tipId parameter', 
      500: 'Server error (check Supabase connection)'
    },
    warning: 'This operation is irreversible and will delete all related data (legs, bookmaker odds)'
  });
}
