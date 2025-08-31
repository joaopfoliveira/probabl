/**
 * API endpoint to export tips as CSV
 */

import { NextRequest, NextResponse } from 'next/server';
import { exportTipsToCSV } from '@/lib/data';
import { validateTipFilters } from '@/lib/schemas';
import type { TipFilters } from '@/lib/types';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    
    // Extract filters from query parameters safely
    const rawFilters = {
      ...(searchParams.get('sport') && { sport: searchParams.get('sport') }),
      ...(searchParams.get('risk') && { risk: searchParams.get('risk') }),
      ...(searchParams.get('result') && { result: searchParams.get('result') }),
      ...(searchParams.get('dateFrom') && { dateFrom: searchParams.get('dateFrom') }),
      ...(searchParams.get('dateTo') && { dateTo: searchParams.get('dateTo') }),
    };
    
    // Validate filters with proper typing
    let validatedFilters: TipFilters;
    try {
      validatedFilters = validateTipFilters(rawFilters);
    } catch (_error) {
      return NextResponse.json(
        { error: 'Invalid filter parameters' },
        { status: 400 }
      );
    }
    
    // Export to CSV
    const csvData = await exportTipsToCSV(validatedFilters);
    
    if (csvData.length === 0) {
      return NextResponse.json(
        { error: 'No data to export' },
        { status: 404 }
      );
    }
    
    // Convert to CSV format
    const headers = Object.keys(csvData[0]);
    const csvContent = [
      headers.join(','),
      ...csvData.map(row => 
        headers.map(header => {
          const value = row[header as keyof typeof row];
          // Escape commas and quotes in CSV
          if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
            return `"${value.replace(/"/g, '""')}"`;
          }
          return value;
        }).join(',')
      ),
    ].join('\n');
    
    // Return CSV with appropriate headers
    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="tips-export-${new Date().toISOString().split('T')[0]}.csv"`,
      },
    });
  } catch (error) {
    console.error('Error exporting CSV:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
