#!/usr/bin/env tsx
/**
 * Script to export tips to CSV
 * Usage:
 *   npm run export:csv
 *   npm run export:csv -- --sport=Futebol
 *   npm run export:csv -- --risk=segura
 *   npm run export:csv -- --dateFrom=2025-01-01 --dateTo=2025-01-31
 */

import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';
import { exportTipsToCSV } from '../src/lib/data';
import type { TipFilters } from '../src/lib/types';

async function main() {
  const args = process.argv.slice(2);
  const filters: TipFilters = {};
  
  // Parse command line arguments
  for (const arg of args) {
    if (arg.startsWith('--sport=')) {
      filters.sport = arg.split('=')[1];
    } else if (arg.startsWith('--risk=')) {
      filters.risk = arg.split('=')[1] as TipFilters['risk'];
    } else if (arg.startsWith('--result=')) {
      filters.result = arg.split('=')[1] as TipFilters['result'];
    } else if (arg.startsWith('--dateFrom=')) {
      filters.dateFrom = arg.split('=')[1];
    } else if (arg.startsWith('--dateTo=')) {
      filters.dateTo = arg.split('=')[1];
    }
  }
  
  try {
    console.log('🔍 Exporting tips with filters:', filters);
    
    const csvData = await exportTipsToCSV(filters);
    
    if (csvData.length === 0) {
      console.log('📭 No tips found matching the filters');
      return;
    }
    
    // Create output directory
    const outputDir = join(process.cwd(), 'public', 'export');
    mkdirSync(outputDir, { recursive: true });
    
    // Generate filename with timestamp and filters
    const timestamp = new Date().toISOString().split('T')[0];
    const filterSuffix = Object.entries(filters)
      .filter(([_, value]) => value)
      .map(([key, value]) => `${key}-${value}`)
      .join('_');
    
    const filename = `tips-export-${timestamp}${filterSuffix ? '-' + filterSuffix : ''}.csv`;
    const filepath = join(outputDir, filename);
    
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
    
    // Write to file
    writeFileSync(filepath, csvContent, 'utf-8');
    
    console.log(`✅ Exported ${csvData.length} tips to: ${filepath}`);
    console.log(`📊 Summary:`);
    
    // Show summary stats
    const riskCounts = csvData.reduce((acc, tip) => {
      acc[tip.risk] = (acc[tip.risk] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const resultCounts = csvData.reduce((acc, tip) => {
      acc[tip.result] = (acc[tip.result] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    console.log(`   Risk distribution:`, riskCounts);
    console.log(`   Result distribution:`, resultCounts);
    
  } catch (error) {
    if (error instanceof Error) {
      console.error('❌ Error:', error.message);
    } else {
      console.error('❌ Unknown error:', error);
    }
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}
