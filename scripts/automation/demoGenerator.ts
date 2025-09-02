#!/usr/bin/env tsx
/**
 * Demo version of daily tips generator that works without API keys
 * Creates realistic mock tips following the V2 schema
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import { AUTOMATION_CONFIG } from './config';
import { logger } from './logger';
import type { DailyTipsPayload, TipItem } from '../../src/lib/types';

class DemoTipsGenerator {
  async generateDemo(targetDate?: string): Promise<DailyTipsPayload> {
    const date = targetDate || this.getTodayISO();
    logger.info(`🎭 Generating demo tips for ${date}`);

    const tips = this.createRealisticTips();
    
    const payload: DailyTipsPayload = {
      version: 2,
      dateISO: date,
      generatedAt: new Date().toISOString(),
      generatedBy: 'demo-system',
      tips,
      seo: {
        title: `Daily Betting Tips for ${date} | Its Probabl`,
        description: `AI-generated betting tips with detailed analysis for ${date}. Safe, medium and high risk predictions across multiple sports.`
      }
    };

    // Save to file
    const outputPath = path.join(AUTOMATION_CONFIG.output.directory, `${date}.json`);
    await fs.mkdir(AUTOMATION_CONFIG.output.directory, { recursive: true });
    await fs.writeFile(outputPath, JSON.stringify(payload, null, 2));

    logger.info(`✅ Demo tips saved to: ${outputPath}`);
    return payload;
  }

  private getTodayISO(): string {
    return new Date().toISOString().split('T')[0];
  }

  private getEventTime(daysFromNow: number, hours: number, minutes: number): string {
    const date = new Date();
    date.setDate(date.getDate() + daysFromNow);
    date.setHours(hours, minutes, 0, 0);
    return date.toISOString();
  }

  private createRealisticTips(): TipItem[] {
    return [
      // Safe Accumulator  
      {
        id: 'tip-safe-001',
        betType: 'accumulator',
        risk: 'safe',
        legs: [
          {
            legId: 'leg-001a',
            sport: 'Tennis',
            league: 'ATP Finals',
            event: {
              home: 'Novak Djokovic',
              away: 'Carlos Alcaraz',
              name: 'Novak Djokovic vs Carlos Alcaraz',
              scheduledAt: this.getEventTime(1, 15, 0), // Tomorrow 15:00
              timezone: 'Europe/London'
            },
            market: 'Moneyline',
            selection: 'Novak Djokovic to win',
            avgOdds: 1.15,
            bookmakers: [
              { name: 'Unibet', odds: 1.14, url: 'https://www.unibet.co.uk' },
              { name: 'Betclic', odds: 1.15, url: 'https://www.betclic.com' },
              { name: 'Bwin', odds: 1.16, url: 'https://www.bwin.com' }
            ]
          },
          {
            legId: 'leg-001b', 
            sport: 'Football',
            league: 'Premier League',
            event: {
              home: 'Manchester City',
              away: 'Sheffield United',
              name: 'Manchester City vs Sheffield United',
              scheduledAt: this.getEventTime(1, 17, 30), // Tomorrow 17:30
              timezone: 'Europe/London'
            },
            market: 'Moneyline',
            selection: 'Manchester City to win',
            avgOdds: 1.18,
            bookmakers: [
              { name: 'Unibet', odds: 1.17, url: 'https://www.unibet.co.uk' },
              { name: 'Betclic', odds: 1.18, url: 'https://www.betclic.com' },
              { name: 'Bwin', odds: 1.19, url: 'https://www.bwin.com' }
            ]
          }
        ],
        combined: {
          avgOdds: 1.36,
          bookmakers: [
            { name: 'Unibet', odds: 1.34, url: 'https://www.unibet.co.uk' },
            { name: 'Betclic', odds: 1.36, url: 'https://www.betclic.com' },
            { name: 'Bwin', odds: 1.38, url: 'https://www.bwin.com' }
          ]
        },
        rationale: 'Conservative accumulator combining two heavy favorites. Djokovic\'s hard court dominance and City\'s home form against relegated opposition offer minimal risk exposure.',
        result: 'pending'
      },

      // Medium Single
      {
        id: 'tip-medium-001',
        betType: 'single',
        risk: 'medium',
        legs: [
          {
            legId: 'leg-002a',
            sport: 'Tennis',
            league: 'WTA Finals',
            event: {
              home: 'Aryna Sabalenka',
              away: 'Iga Swiatek',
              name: 'Aryna Sabalenka vs Iga Swiatek',
              scheduledAt: this.getEventTime(2, 14, 0), // Day after tomorrow 14:00
              timezone: 'Europe/London'
            },
            market: 'Total Games (Over/Under)',
            selection: 'Over 21.5 games',
            avgOdds: 1.95,
            bookmakers: [
              { name: 'Unibet', odds: 1.92, url: 'https://www.unibet.co.uk' },
              { name: 'Betclic', odds: 1.95, url: 'https://www.betclic.com' },
              { name: 'Bwin', odds: 1.98, url: 'https://www.bwin.com' },
              { name: 'Betano', odds: 1.96, url: 'https://www.betano.com' }
            ]
          }
        ],
        rationale: 'Both players possess powerful baseline games that typically produce competitive, extended sets. Recent H2H suggests tight contests with multiple tiebreaks likely.',
        result: 'pending'
      },

      // High Risk Single
      {
        id: 'tip-high-001',
        betType: 'single',
        risk: 'high',
        legs: [
          {
            legId: 'leg-003a',
            sport: 'Basketball',
            league: 'NBA',
            event: {
              home: 'Golden State Warriors',
              away: 'Los Angeles Lakers',
              name: 'Golden State Warriors vs Los Angeles Lakers',
              scheduledAt: this.getEventTime(3, 21, 0), // In 3 days, 21:00
              timezone: 'America/Los_Angeles'
            },
            market: 'Player Points',
            selection: 'Stephen Curry Over 28.5 points',
            avgOdds: 4.25,
            bookmakers: [
              { name: 'Unibet', odds: 4.10, url: 'https://www.unibet.co.uk' },
              { name: 'Betclic', odds: 4.25, url: 'https://www.betclic.com' },
              { name: 'Bwin', odds: 4.40, url: 'https://www.bwin.com' },
              { name: 'Betano', odds: 4.30, url: 'https://www.betano.com' }
            ]
          }
        ],
        rationale: 'Curry historically elevates against the Lakers in primetime. Recent shooting form and Lakers\' perimeter defense vulnerabilities create value despite the inflated line.',
        result: 'pending'
      }
    ];
  }
}

// CLI Interface
async function main() {
  const args = process.argv.slice(2);
  const dateIndex = args.indexOf('--date');
  const targetDate = dateIndex !== -1 && args[dateIndex + 1] ? args[dateIndex + 1] : undefined;

  try {
    const generator = new DemoTipsGenerator();
    const result = await generator.generateDemo(targetDate);
    
    console.log('\n🎉 DEMO TIPS GENERATED!');
    console.log(`📅 Date: ${result.dateISO}`);
    console.log(`🎯 Tips: ${result.tips.length}`);
    console.log(`📊 Risks: ${result.tips.map(t => t.risk).join(', ')}`);
    console.log(`🏆 Sports: ${[...new Set(result.tips.flatMap(t => t.legs.map(l => l.sport)))].join(', ')}`);
    console.log(`📁 File: data/daily/${result.dateISO}.json`);
    
    process.exit(0);

  } catch (error) {
    console.error('\n❌ DEMO FAILED:', error);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
