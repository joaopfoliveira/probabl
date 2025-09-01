/**
 * Data utilities for managing tips data
 * Handles file I/O, filtering, and aggregation
 */

import { promises as fs } from 'fs';
import path from 'path';
import { format, parseISO, isAfter, isBefore, isValid } from 'date-fns';
import type { DailyTipsPayload, TipItem, TipFilters, TipStats, TipCsvRow } from './types';
import { validateDailyTips } from './schemas';

const DATA_DIR = path.join(process.cwd(), 'data', 'daily');

/**
 * Ensure data directory exists
 */
async function ensureDataDir(): Promise<void> {
  try {
    await fs.access(DATA_DIR);
  } catch {
    await fs.mkdir(DATA_DIR, { recursive: true });
  }
}

/**
 * Get file path for a specific date
 */
function getFilePath(dateISO: string): string {
  return path.join(DATA_DIR, `${dateISO}.json`);
}

/**
 * Load daily tips for a specific date
 */
export async function loadDailyTips(dateISO: string): Promise<DailyTipsPayload | null> {
  try {
    const filePath = getFilePath(dateISO);
    const content = await fs.readFile(filePath, 'utf-8');
    const data = JSON.parse(content);
    return validateDailyTips(data);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      return null; // File doesn't exist
    }
    throw error;
  }
}

/**
 * Save daily tips for a specific date
 */
export async function saveDailyTips(data: DailyTipsPayload): Promise<void> {
  await ensureDataDir();
  const validatedData = validateDailyTips(data);
  const filePath = getFilePath(validatedData.dateISO);
  
  // Check if file already exists
  try {
    await fs.access(filePath);
    throw new Error(`Tips for ${validatedData.dateISO} already exist. Use --overwrite to replace.`);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
      throw error; // Re-throw if it's not a "file not found" error
    }
  }
  
  await fs.writeFile(filePath, JSON.stringify(validatedData, null, 2), 'utf-8');
}

/**
 * Save daily tips with overwrite option
 */
export async function saveDailyTipsWithOverwrite(data: DailyTipsPayload, overwrite = false): Promise<void> {
  await ensureDataDir();
  const validatedData = validateDailyTips(data);
  const filePath = getFilePath(validatedData.dateISO);
  
  if (!overwrite) {
    try {
      await fs.access(filePath);
      throw new Error(`Tips for ${validatedData.dateISO} already exist. Use --overwrite to replace.`);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
        throw error;
      }
    }
  }
  
  await fs.writeFile(filePath, JSON.stringify(validatedData, null, 2), 'utf-8');
}

/**
 * Get the latest daily tips
 */
export async function getLatestDailyTips(): Promise<DailyTipsPayload | null> {
  try {
    await ensureDataDir();
    const files = await fs.readdir(DATA_DIR);
    const jsonFiles = files
      .filter(file => file.endsWith('.json') && !file.endsWith('.v1.json'))
      .map(file => file.replace('.json', ''))
      .sort()
      .reverse();
    
    for (const dateISO of jsonFiles) {
      const data = await loadDailyTips(dateISO);
      if (data) return data;
    }
    
    return null;
  } catch {
    return null;
  }
}

/**
 * Get all available dates with tips
 */
export async function getAvailableDates(): Promise<string[]> {
  try {
    await ensureDataDir();
    const files = await fs.readdir(DATA_DIR);
    return files
      .filter(file => file.endsWith('.json') && !file.endsWith('.v1.json'))
      .map(file => file.replace('.json', ''))
      .sort()
      .reverse();
  } catch {
    return [];
  }
}

/**
 * Get tips with filters and pagination
 */
export async function getTipsWithFilters(
  filters: TipFilters = {},
  page = 1,
  limit = 20
): Promise<{
  tips: Array<TipItem & { date: string }>;
  total: number;
  hasMore: boolean;
}> {
  const dates = await getAvailableDates();
  const allTips: Array<TipItem & { date: string }> = [];
  
  // Load and flatten all tips
  for (const date of dates) {
    const dailyData = await loadDailyTips(date);
    if (dailyData) {
      const tipsByDate = dailyData.tips.map(tip => ({ ...tip, date }));
      allTips.push(...tipsByDate);
    }
  }
  
  // Apply filters
  let filteredTips = allTips;
  
  if (filters.sport) {
    filteredTips = filteredTips.filter(tip => 
      tip.legs?.some(leg => leg.sport.toLowerCase().includes(filters.sport!.toLowerCase()))
    );
  }
  
  if (filters.risk) {
    filteredTips = filteredTips.filter(tip => tip.risk === filters.risk);
  }
  
  if (filters.result) {
    filteredTips = filteredTips.filter(tip => tip.result === filters.result);
  }
  
  if (filters.betType) {
    filteredTips = filteredTips.filter(tip => tip.betType === filters.betType);
  }
  
  if (filters.minLegs) {
    filteredTips = filteredTips.filter(tip => (tip.legs?.length || 0) >= filters.minLegs!);
  }
  
  if (filters.dateFrom) {
    const fromDate = parseISO(filters.dateFrom);
    filteredTips = filteredTips.filter(tip => {
      const tipDate = parseISO(tip.date);
      return isValid(tipDate) && !isBefore(tipDate, fromDate);
    });
  }
  
  if (filters.dateTo) {
    const toDate = parseISO(filters.dateTo);
    filteredTips = filteredTips.filter(tip => {
      const tipDate = parseISO(tip.date);
      return isValid(tipDate) && !isAfter(tipDate, toDate);
    });
  }
  
  // Sort by date descending, then by risk (safe, medium, high)
  const riskOrder = { safe: 0, medium: 1, high: 2 };
  filteredTips.sort((a, b) => {
    const dateCompare = b.date.localeCompare(a.date);
    if (dateCompare !== 0) return dateCompare;
    return riskOrder[a.risk] - riskOrder[b.risk];
  });
  
  // Pagination
  const total = filteredTips.length;
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const paginatedTips = filteredTips.slice(startIndex, endIndex);
  
  return {
    tips: paginatedTips,
    total,
    hasMore: endIndex < total,
  };
}

/**
 * Calculate statistics from tips data
 */
export async function calculateTipStats(filters: TipFilters = {}): Promise<TipStats> {
  const { tips } = await getTipsWithFilters(filters, 1, 10000); // Get all tips
  
  const totalTips = tips.length;
  const winTips = tips.filter(tip => tip.result === 'win').length;
  const winRate = totalTips > 0 ? winTips / totalTips : 0;
  
  // Stats by risk
  const winsByRisk = { safe: 0, medium: 0, high: 0 };
  const totalByRisk = { safe: 0, medium: 0, high: 0 };
  
  // Stats by bet type
  const betsByType = { single: 0, accumulator: 0 };
  
  tips.forEach(tip => {
    totalByRisk[tip.risk]++;
    betsByType[tip.betType]++;
    if (tip.result === 'win') {
      winsByRisk[tip.risk]++;
    }
  });
  
  // Stats by sport (from legs)
  const sportStats = new Map<string, { count: number; wins: number }>();
  tips.forEach(tip => {
    // For v2, get sports from legs
    const sports = [...new Set(tip.legs?.map(leg => leg.sport) || [])];
    sports.forEach(sport => {
      const current = sportStats.get(sport) || { count: 0, wins: 0 };
      current.count++;
      if (tip.result === 'win') current.wins++;
      sportStats.set(sport, current);
    });
  });
  
  const sports = Array.from(sportStats.entries()).map(([sport, stats]) => ({
    sport,
    count: stats.count,
    winRate: stats.count > 0 ? stats.wins / stats.count : 0,
  })).sort((a, b) => b.count - a.count);
  
  return {
    totalTips,
    winRate,
    winsByRisk,
    totalByRisk,
    betsByType,
    sports,
  };
}

/**
 * Export tips to CSV format
 */
export async function exportTipsToCSV(filters: TipFilters = {}): Promise<TipCsvRow[]> {
  const { tips } = await getTipsWithFilters(filters, 1, 10000); // Get all tips
  const csvRows: TipCsvRow[] = [];
  
  tips.forEach(tip => {
    // Add one row per leg
    tip.legs?.forEach((leg, legIndex) => {
      const eventName = leg.event?.name || 
        (leg.event?.home && leg.event?.away ? `${leg.event.home} vs ${leg.event.away}` : '');
      
      csvRows.push({
        dateISO: tip.date,
        tipId: tip.id,
        betType: tip.betType,
        risk: tip.risk,
        legIndex: legIndex,
        sport: leg.sport,
        league: leg.league || null,
        eventName: eventName || null,
        market: leg.market,
        selection: leg.selection,
        legAvgOdds: leg.avgOdds,
        legBookmakersJSON: JSON.stringify(leg.bookmakers || []),
        combinedAvgOdds: tip.combined?.avgOdds || null,
        combinedBookmakersJSON: tip.combined ? JSON.stringify(tip.combined.bookmakers || []) : null,
        result: tip.result || 'pending',
      });
    });
    
    // For accumulators, add one summary row
    if (tip.betType === 'accumulator' && tip.combined) {
      csvRows.push({
        dateISO: tip.date,
        tipId: tip.id,
        betType: tip.betType,
        risk: tip.risk,
        legIndex: null, // null for summary
        sport: null,
        league: null,
        eventName: null,
        market: null,
        selection: null,
        legAvgOdds: null,
        legBookmakersJSON: null,
        combinedAvgOdds: tip.combined.avgOdds,
        combinedBookmakersJSON: JSON.stringify(tip.combined.bookmakers || []),
        result: tip.result || 'pending',
      });
    }
  });
  
  return csvRows;
}

/**
 * Get today's date in Lisbon timezone
 */
export function getTodayDateISO(): string {
  const now = new Date();
  // Convert to Lisbon timezone (Europe/Lisbon)
  const lisbonTime = new Date(now.toLocaleString("en-US", { timeZone: "Europe/Lisbon" }));
  return format(lisbonTime, 'yyyy-MM-dd');
}

/**
 * Get recent tips (last N days)
 */
export async function getRecentTips(days = 7): Promise<Array<TipItem & { date: string }>> {
  const today = getTodayDateISO();
  const fromDate = format(parseISO(today).getTime() - (days - 1) * 24 * 60 * 60 * 1000, 'yyyy-MM-dd');
  
  const { tips } = await getTipsWithFilters({
    dateFrom: fromDate,
    dateTo: today,
  }, 1, days * 3); // Max 3 tips per day
  
  return tips;
}

/**
 * Get daily tips by specific date
 */
export async function getDailyTipsByDate(date: string): Promise<DailyTipsPayload | null> {
  return await loadDailyTips(date);
}
