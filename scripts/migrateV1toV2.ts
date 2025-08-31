#!/usr/bin/env tsx

/**
 * Migration script: Convert V1 tips to V2 leg-based format
 * 
 * Usage:
 *   npm run migrate:v2
 *   npm run migrate:v2 -- --overwrite
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

// V1 Types (legacy)
interface V1TipItem {
  id: string;
  sport: string;
  league?: string;
  event: {
    home?: string;
    away?: string;
    name?: string;
  };
  market: string;
  selection: string;
  odds: number;
  risk: 'safe' | 'medium' | 'high';
  rationale: string;
  source?: string;
  result?: 'win' | 'loss' | 'void' | 'pending';
  closingOdds?: number;
}

interface V1DailyTipsPayload {
  version: 1;
  dateISO: string;
  generatedAt: string;
  generatedBy: 'chatgpt';
  tips: [V1TipItem, V1TipItem, V1TipItem];
  seo?: {
    title: string;
    description: string;
  };
}

// V2 Types (target)
interface V2BookmakerPrice {
  name: string;
  odds: number;
}

interface V2Leg {
  sport: string;
  league?: string;
  event: {
    home?: string;
    away?: string;
    name?: string;
  };
  market: string;
  selection: string;
  avgOdds: number;
  bookmakers: V2BookmakerPrice[];
}

interface V2CombinedPrice {
  avgOdds: number;
  bookmakers: V2BookmakerPrice[];
}

interface V2TipItem {
  id: string;
  betType: 'single' | 'accumulator';
  risk: 'safe' | 'medium' | 'high';
  legs: V2Leg[];
  combined?: V2CombinedPrice;
  rationale: string;
  result?: 'win' | 'loss' | 'void' | 'pending';
}

interface V2DailyTipsPayload {
  version: 2;
  dateISO: string;
  generatedAt: string;
  generatedBy: 'chatgpt';
  tips: [V2TipItem, V2TipItem, V2TipItem];
  seo?: {
    title: string;
    description: string;
  };
}

// Common bookmaker names for synthetic data
const BOOKMAKERS = ['bet365', 'Betfair', 'Betano', 'Pinnacle', 'Betclic', 'Bwin'];

function generateSyntheticBookmakers(baseOdds: number, count: number = 4): V2BookmakerPrice[] {
  const bookmakers: V2BookmakerPrice[] = [];
  const selectedBookmakers = BOOKMAKERS.slice(0, count);
  
  for (let i = 0; i < count; i++) {
    // Generate odds within ±5% of base odds
    const variation = (Math.random() - 0.5) * 0.1; // ±5%
    const odds = Math.round((baseOdds * (1 + variation)) * 100) / 100;
    
    bookmakers.push({
      name: selectedBookmakers[i],
      odds: Math.max(1.01, odds), // Ensure minimum odds
    });
  }
  
  return bookmakers;
}

function migrateV1TipToV2(v1Tip: V1TipItem): V2TipItem {
  // Detect if it's likely an accumulator based on market/selection text
  const isAccumulator = v1Tip.market.toLowerCase().includes('accumulator') ||
                       v1Tip.selection.includes('+') ||
                       v1Tip.selection.includes('&');
  
  if (isAccumulator) {
    // Parse accumulator legs (simplified - real parsing would be more complex)
    const legs: V2Leg[] = [];
    const selections = v1Tip.selection.split(/\s*\+\s*|\s*&\s*/);
    
    if (selections.length >= 2) {
      // Create legs based on parsed selections
      selections.forEach((selection, index) => {
        const legOdds = Math.pow(v1Tip.odds, 1/selections.length); // Approximate individual leg odds
        legs.push({
          sport: v1Tip.sport,
          league: v1Tip.league,
          event: index === 0 ? v1Tip.event : { name: `Event ${index + 1}` },
          market: index === 0 ? v1Tip.market.replace(/accumulator/i, '').trim() || '1X2' : '1X2',
          selection: selection.trim(),
          avgOdds: Math.round(legOdds * 100) / 100,
          bookmakers: generateSyntheticBookmakers(legOdds),
        });
      });
    } else {
      // Fallback: create 2 legs for accumulator
      const legOdds = Math.sqrt(v1Tip.odds); // Approximate individual leg odds
      legs.push({
        sport: v1Tip.sport,
        league: v1Tip.league,
        event: v1Tip.event,
        market: '1X2',
        selection: v1Tip.selection,
        avgOdds: Math.round(legOdds * 100) / 100,
        bookmakers: generateSyntheticBookmakers(legOdds),
      });
      legs.push({
        sport: v1Tip.sport,
        league: v1Tip.league,
        event: { name: 'Secondary Event' },
        market: 'Over 2.5',
        selection: 'Over 2.5 goals',
        avgOdds: Math.round(legOdds * 100) / 100,
        bookmakers: generateSyntheticBookmakers(legOdds),
      });
    }
    
    return {
      id: v1Tip.id,
      betType: 'accumulator',
      risk: v1Tip.risk,
      legs,
      combined: {
        avgOdds: v1Tip.odds,
        bookmakers: generateSyntheticBookmakers(v1Tip.odds),
      },
      rationale: v1Tip.rationale,
      result: v1Tip.result || 'pending',
    };
  } else {
    // Single bet
    return {
      id: v1Tip.id,
      betType: 'single',
      risk: v1Tip.risk,
      legs: [{
        sport: v1Tip.sport,
        league: v1Tip.league,
        event: v1Tip.event,
        market: v1Tip.market,
        selection: v1Tip.selection,
        avgOdds: v1Tip.odds,
        bookmakers: generateSyntheticBookmakers(v1Tip.odds),
      }],
      // No combined for single bets
      rationale: v1Tip.rationale,
      result: v1Tip.result || 'pending',
    };
  }
}

function migrateV1ToV2(v1Data: V1DailyTipsPayload): V2DailyTipsPayload {
  return {
    version: 2,
    dateISO: v1Data.dateISO,
    generatedAt: v1Data.generatedAt,
    generatedBy: v1Data.generatedBy,
    tips: [
      migrateV1TipToV2(v1Data.tips[0]),
      migrateV1TipToV2(v1Data.tips[1]),
      migrateV1TipToV2(v1Data.tips[2]),
    ] as [V2TipItem, V2TipItem, V2TipItem],
    seo: v1Data.seo,
  };
}

async function migrateFile(filePath: string, overwrite: boolean): Promise<boolean> {
  try {
    const content = await fs.readFile(filePath, 'utf-8');
    const v1Data: V1DailyTipsPayload = JSON.parse(content);
    
    // Check if already v2
    if (v1Data.version === 2) {
      console.log(`⏭️  ${path.basename(filePath)}: Already v2`);
      return false;
    }
    
    if (v1Data.version !== 1) {
      console.log(`❌ ${path.basename(filePath)}: Unknown version ${v1Data.version}`);
      return false;
    }
    
    // Migrate to v2
    const v2Data = migrateV1ToV2(v1Data);
    
    // Create backup if not overwriting
    if (!overwrite) {
      const backupPath = filePath.replace('.json', '.v1.json');
      await fs.copyFile(filePath, backupPath);
      console.log(`📋 Created backup: ${path.basename(backupPath)}`);
    }
    
    // Write v2 data
    await fs.writeFile(filePath, JSON.stringify(v2Data, null, 2));
    console.log(`✅ Migrated: ${path.basename(filePath)} (v1 → v2)`);
    
    return true;
  } catch (error) {
    console.error(`❌ Error migrating ${filePath}:`, error);
    return false;
  }
}

async function main() {
  const args = process.argv.slice(2);
  const overwrite = args.includes('--overwrite');
  
  console.log('🔄 Starting V1 to V2 migration...');
  console.log(`📁 Mode: ${overwrite ? 'Overwrite' : 'Create backups'}`);
  console.log();
  
  const dataDir = path.join(process.cwd(), 'data', 'daily');
  
  try {
    const files = await fs.readdir(dataDir);
    const jsonFiles = files.filter(f => f.endsWith('.json') && !f.endsWith('.v1.json'));
    
    if (jsonFiles.length === 0) {
      console.log('📭 No JSON files found in data/daily/');
      return;
    }
    
    let migratedCount = 0;
    
    for (const file of jsonFiles.sort()) {
      const filePath = path.join(dataDir, file);
      const migrated = await migrateFile(filePath, overwrite);
      if (migrated) migratedCount++;
    }
    
    console.log();
    console.log(`🎉 Migration complete! Migrated ${migratedCount} files.`);
    
    if (!overwrite && migratedCount > 0) {
      console.log('💡 Original files backed up as .v1.json');
      console.log('💡 To clean up backups: rm data/daily/*.v1.json');
    }
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

// Run the migration
main().catch(console.error);
