#!/usr/bin/env tsx
/**
 * Main automation script for generating daily betting tips
 * Usage: tsx scripts/automation/generateDailyTips.ts [--mock] [--date YYYY-MM-DD]
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import { AUTOMATION_CONFIG } from './config';
import { LLMManager } from './llmIntegration';
import { logger } from './logger';
import type { DailyTipsPayload } from '../../src/lib/types';

interface GenerationOptions {
  useMockData?: boolean;
  targetDate?: string;
  force?: boolean; // Override existing file
}

class DailyTipsGenerator {
  private llmManager: LLMManager;

  constructor() {
    this.llmManager = new LLMManager();
  }

  async generate(options: GenerationOptions = {}): Promise<DailyTipsPayload> {
    const startTime = Date.now();
    logger.info('🚀 Starting daily tips generation', options);

    try {
      // Determine target date
      const targetDate = options.targetDate || this.getTodayISO();
      logger.info(`Generating tips for date: ${targetDate}`);

      // Check if file already exists
      const outputPath = this.getOutputPath(targetDate);
      if (!options.force && await this.fileExists(outputPath)) {
        throw new Error(`Tips file already exists for ${targetDate}. Use --force to override.`);
      }

      // Step 1: Generate tips using LLM with online research
      let generatedTips;
      if (options.useMockData) {
        logger.info('📝 Using mock data for testing - generating realistic tips');
        // Use demo generator for mock mode  
        const demoGenerator = new (await import('./demoGenerator')).DemoTipsGenerator();
        generatedTips = await demoGenerator.generateDemo(targetDate);
      } else {
        logger.info('🤖 Generating tips with LLM online research...');
        generatedTips = await this.llmManager.generateDailyTips();
      }

      // Step 2: Post-process and ensure correct date
      generatedTips = this.postProcessTips(generatedTips, targetDate);

      // Step 4: Save to file
      await this.saveTipsToFile(generatedTips, targetDate);

      // Step 5: Create backup
      await this.createBackup(generatedTips, targetDate);

      const duration = Date.now() - startTime;
      logger.info(`✅ Tips generation completed successfully in ${duration}ms`, {
        date: targetDate,
        tipsCount: generatedTips.tips.length,
        duration
      });

      return generatedTips;

    } catch (error) {
      const duration = Date.now() - startTime;
      logger.error(`❌ Tips generation failed after ${duration}ms:`, error);
      throw error;

    } finally {
      await this.cleanup();
    }
  }

  private getTodayISO(): string {
    const now = new Date();
    // Adjust for Lisbon timezone if needed
    const lisbon = new Date(now.toLocaleString('en-US', { timeZone: 'Europe/Lisbon' }));
    return lisbon.toISOString().split('T')[0];
  }

  private getOutputPath(date: string): string {
    return path.join(AUTOMATION_CONFIG.output.directory, `${date}.json`);
  }

  private async fileExists(filePath: string): Promise<boolean> {
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }

  private postProcessTips(tips: DailyTipsPayload, targetDate: string): DailyTipsPayload {
    // Ensure correct date and metadata
    const processed: DailyTipsPayload = {
      ...tips,
      dateISO: targetDate,
      generatedAt: new Date().toISOString(),
      generatedBy: 'automated-system',
      // Ensure all tips have unique IDs
      tips: tips.tips.map((tip, index) => ({
        ...tip,
        id: `tip-${tip.risk}-${String(index + 1).padStart(3, '0')}`,
        result: 'pending' // Always start as pending
      }))
    };

    logger.info('Tips post-processed', {
      originalDate: tips.dateISO,
      newDate: targetDate,
      tipsCount: processed.tips.length
    });

    return processed;
  }

  private async saveTipsToFile(tips: DailyTipsPayload, date: string): Promise<void> {
    const outputPath = this.getOutputPath(date);
    
    // Ensure output directory exists
    await fs.mkdir(AUTOMATION_CONFIG.output.directory, { recursive: true });
    
    // Save with pretty formatting
    const content = JSON.stringify(tips, null, 2);
    await fs.writeFile(outputPath, content, 'utf-8');
    
    logger.info(`💾 Tips saved to: ${outputPath}`, {
      fileSize: content.length,
      tipsCount: tips.tips.length
    });
  }

  private async createBackup(tips: DailyTipsPayload, date: string): Promise<void> {
    try {
      const backupDir = AUTOMATION_CONFIG.output.backupDirectory;
      await fs.mkdir(backupDir, { recursive: true });
      
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupPath = path.join(backupDir, `${date}-${timestamp}.json`);
      
      await fs.writeFile(backupPath, JSON.stringify(tips, null, 2), 'utf-8');
      logger.info(`💾 Backup created: ${backupPath}`);

    } catch (error) {
      logger.warn('Failed to create backup:', error);
      // Don't fail the entire process for backup issues
    }
  }

  private async cleanup(): Promise<void> {
    try {
      // No cleanup needed for LLM-only generation
      logger.info('🧹 Cleanup completed');
    } catch (error) {
      logger.warn('Cleanup failed:', error);
    }
  }
}

// CLI Interface
async function main() {
  const args = process.argv.slice(2);
  
  const options: GenerationOptions = {
    useMockData: args.includes('--mock'),
    force: args.includes('--force'),
    targetDate: undefined
  };

  // Parse date argument
  const dateIndex = args.indexOf('--date');
  if (dateIndex !== -1 && args[dateIndex + 1]) {
    options.targetDate = args[dateIndex + 1];
  }

  try {
    const generator = new DailyTipsGenerator();
    const result = await generator.generate(options);
    
    console.log('\n🎉 SUCCESS! Generated tips:');
    console.log(`📅 Date: ${result.dateISO}`);
    console.log(`🎯 Tips: ${result.tips.length}`);
    console.log(`📊 Risks: ${result.tips.map(t => t.risk).join(', ')}`);
    console.log(`🏆 Sports: ${[...new Set(result.tips.flatMap(t => t.legs.map(l => l.sport)))].join(', ')}`);
    
    process.exit(0);

  } catch (error) {
    console.error('\n❌ FAILED:', error);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { DailyTipsGenerator };
