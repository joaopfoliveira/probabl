#!/usr/bin/env tsx
/**
 * Script to ingest daily tips from stdin or file
 * Usage:
 *   pbpaste | npm run ingest (macOS)
 *   Get-Clipboard | npm run ingest (Windows PowerShell)
 *   npm run ingest path/to/tips.json
 *   npm run ingest --overwrite path/to/tips.json
 */

import { readFileSync } from 'fs';
import { saveDailyTipsToDb } from '../src/lib/supabase-data';
import { validateDailyTips } from '../src/lib/schemas';

async function main() {
  const args = process.argv.slice(2);
  let jsonContent: string;
  let overwrite = false;
  
  // Check for overwrite flag
  const overwriteIndex = args.indexOf('--overwrite');
  if (overwriteIndex !== -1) {
    overwrite = true;
    args.splice(overwriteIndex, 1); // Remove the flag from args
  }
  
  try {
    if (args.length === 0) {
      // Read from stdin
      console.log('Reading tips from stdin...');
      jsonContent = await readStdin();
    } else {
      // Read from file
      const filePath = args[0];
      console.log(`Reading tips from file: ${filePath}`);
      jsonContent = readFileSync(filePath, 'utf-8');
    }
    
    // Parse and validate JSON
    const data = JSON.parse(jsonContent);
    const validatedData = validateDailyTips(data);
    
    // Save the data to Supabase
    await saveDailyTipsToDb(validatedData);
    
    console.log(`✅ Successfully saved tips for ${validatedData.dateISO}`);
    console.log(`   Generated at: ${validatedData.generatedAt}`);
    console.log(`   Tips: ${validatedData.tips.map(t => `${t.risk} (${t.betType}, ${t.legs.length} leg${t.legs.length > 1 ? 's' : ''})`).join(', ')}`);
    
    if (validatedData.seo) {
      console.log(`   SEO title: ${validatedData.seo.title}`);
    }
    
  } catch (error) {
    if (error instanceof Error) {
      console.error('❌ Error:', error.message);
      
      // Provide helpful error messages for common issues
      if (error.message.includes('already exist')) {
        console.error('💡 Use --overwrite flag to replace existing tips');
      } else if (error.message.includes('JSON')) {
        console.error('💡 Make sure the input is valid JSON');
        console.error('💡 Expected format: ```json tipday ... ```');
      } else if (error.message.includes('validation')) {
        console.error('💡 Check the tips format matches the required schema');
        console.error('💡 Tips must be in order: safe, medium, high');
      console.error('💡 Each tip must have valid betType (single/accumulator) and matching legs structure');
      }
    } else {
      console.error('❌ Unknown error:', error);
    }
    process.exit(1);
  }
}

function readStdin(): Promise<string> {
  return new Promise((resolve, reject) => {
    let data = '';
    
    process.stdin.on('readable', () => {
      let chunk;
      while (null !== (chunk = process.stdin.read())) {
        data += chunk;
      }
    });
    
    process.stdin.on('end', () => {
      if (data.trim() === '') {
        reject(new Error('No data received from stdin'));
      } else {
        // Extract JSON from markdown code blocks if present
        const jsonMatch = data.match(/```json\s*tipday\s*\n([\s\S]*?)\n```/);
        if (jsonMatch) {
          resolve(jsonMatch[1]);
        } else {
          resolve(data.trim());
        }
      }
    });
    
    process.stdin.on('error', reject);
  });
}

if (require.main === module) {
  main();
}
