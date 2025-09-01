import { NextRequest, NextResponse } from 'next/server';
import { readFile, writeFile, readdir } from 'fs/promises';
import { join } from 'path';
import { DailyTipsPayloadSchema } from '@/lib/schemas';
import { ZodError } from 'zod';
import type { DailyTipsPayload, ResultType } from '@/lib/types';

interface UpdateResultRequest {
  tipId: string;
  result: ResultType;
  date?: string; // Optional: if provided, only search in this specific date file
}

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body: UpdateResultRequest = await request.json();
    const { tipId, result, date } = body;
    
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
    
    const dataDir = join(process.cwd(), 'data', 'daily');
    let targetFile: string | null = null;
    let targetData: DailyTipsPayload | null = null;
    
    // If date is provided, search only in that file
    if (date) {
      const filePath = join(dataDir, `${date}.json`);
      try {
        const fileContent = await readFile(filePath, 'utf-8');
        const data = DailyTipsPayloadSchema.parse(JSON.parse(fileContent));
        
        // Check if tip exists in this file
        const tipExists = data.tips.some(tip => tip.id === tipId);
        if (tipExists) {
          targetFile = filePath;
          targetData = data;
        }
      } catch (error) {
        // File doesn't exist or is invalid, continue searching
      }
    } else {
      // Search through all daily files
      try {
        const files = await readdir(dataDir);
        const jsonFiles = files.filter(file => file.endsWith('.json'));
        
        for (const file of jsonFiles) {
          const filePath = join(dataDir, file);
          try {
            const fileContent = await readFile(filePath, 'utf-8');
            const data = DailyTipsPayloadSchema.parse(JSON.parse(fileContent));
            
            // Check if tip exists in this file
            const tipExists = data.tips.some(tip => tip.id === tipId);
            if (tipExists) {
              targetFile = filePath;
              targetData = data;
              break; // Found it, stop searching
            }
          } catch (error) {
            // Skip invalid files
            continue;
          }
        }
      } catch (error) {
        return NextResponse.json({
          success: false,
          error: 'Could not read data directory'
        }, { status: 500 });
      }
    }
    
    // Check if tip was found
    if (!targetFile || !targetData) {
      return NextResponse.json({
        success: false,
        error: `Tip with ID '${tipId}' not found${date ? ` in date ${date}` : ''}`
      }, { status: 404 });
    }
    
    // Update the specific tip
    const updatedTips = targetData.tips.map(tip => {
      if (tip.id === tipId) {
        return {
          ...tip,
          result
        };
      }
      return tip;
    });
    
    // Create updated data object
    const updatedData: DailyTipsPayload = {
      ...targetData,
      tips: updatedTips
    };
    
    // Validate the updated data
    const validatedData = DailyTipsPayloadSchema.parse(updatedData);
    
    // Write the updated data back to file
    await writeFile(targetFile, JSON.stringify(validatedData, null, 2), 'utf-8');
    
    // Extract filename for response
    const fileName = targetFile.split('/').pop() || targetFile;
    
    return NextResponse.json({
      success: true,
      message: `Tip '${tipId}' result updated to '${result}'`,
      data: {
        tipId,
        previousResult: targetData.tips.find(tip => tip.id === tipId)?.result,
        newResult: result,
        file: fileName,
        date: validatedData.dateISO
      }
    });
    
  } catch (error) {
    console.error('Error updating tip result:', error);
    
    if (error instanceof ZodError) {
      return NextResponse.json({
        success: false,
        error: 'Validation failed after update',
        details: error.errors
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
