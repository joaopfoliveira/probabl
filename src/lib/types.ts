/**
 * Data types for the betting tips system - V2 Leg-based Contract
 * This is the contract with ChatGPT for daily tips generation
 */

// Core enums and types
export type Risk = "safe" | "medium" | "high"; // English risk levels
export type Result = "win" | "loss" | "void" | "pending";
export type BetType = "single" | "accumulator";

// Simplified - English only
export type LocalizedText = string;

export interface EventTeams {
  home?: string; // Optional for 1v1 sports or no home/away
  away?: string;
  name?: string; // e.g., "Benfica vs Porto" or "Alcaraz vs Sinner"
}

export interface BookmakerPrice {
  name: string;        // e.g., "bet365", "Betfair", "Betano"
  odds: number;        // Decimal odds (e.g., 1.80)
  url?: string;        // Optional URL to bookmaker
}

export interface Leg {
  legId?: string;          // Optional unique identifier for leg
  sport: string;           // e.g., "Football", "Tennis"
  league?: string;         // e.g., "Premier League", "ATP"
  event: EventTeams;       // Event details
  market: string;          // "1X2", "Over 2.5", "Handicap", etc.
  selection: string;       // "Arsenal to win", "Over 2.5", etc.
  avgOdds: number;         // Average odds across bookmakers
  bookmakers: BookmakerPrice[]; // 3-6 bookmaker prices
}

export interface CombinedPrice {
  avgOdds: number;         // Average combined odds
  bookmakers: BookmakerPrice[]; // 3-6 bookmaker prices for the combined bet
}

export interface TipItem {
  id: string;              // Unique slug (kebab-case)
  betType: BetType;        // "single" | "accumulator"
  risk: Risk;              // "safe" | "medium" | "high"
  legs: Leg[];             // 1 leg for single, 2+ for accumulator
  combined?: CombinedPrice; // Required for accumulator, undefined for single
  rationale: LocalizedText; // Short explanation (1-3 sentences, English)
  result?: Result;         // Default "pending"
}

export interface DailyTipsPayload {
  version: 2;
  dateISO: string;          // YYYY-MM-DD (Lisbon timezone)
  generatedAt: string;      // ISO timestamp
  generatedBy: "chatgpt";   // Stable marker
  tips: TipItem[];          // Array of tips (minimum 3: safe, medium, high)
  seo?: {
    title: LocalizedText;
    description: LocalizedText;
  };
}

// Filter types for the UI
export interface TipFilters {
  sport?: string;
  risk?: Risk;
  result?: Result;
  betType?: BetType;
  minLegs?: number;
  dateFrom?: string;
  dateTo?: string;
}

// Aggregated data for history/stats
export interface TipStats {
  totalTips: number;
  winRate: number;
  winsByRisk: Record<Risk, number>;
  totalByRisk: Record<Risk, number>;
  betsByType: Record<BetType, number>;
  sports: Array<{
    sport: string;
    count: number;
    winRate: number;
  }>;
}

// Export CSV row format (v2) - flattened with one row per leg + summary for accumulators
export interface TipCsvRow {
  dateISO: string;
  tipId: string;
  betType: string;
  risk: string;
  legIndex: number | null;         // null for summary rows
  sport: string | null;
  league: string | null;
  eventName: string | null;
  market: string | null;
  selection: string | null;
  legAvgOdds: number | null;
  legBookmakersJSON: string | null;
  combinedAvgOdds: number | null;
  combinedBookmakersJSON: string | null;
  result: string;
}

// Blog post metadata
export interface BlogPost {
  slug: string;
  title: string;
  description: string;
  content: string;
  publishedAt: string;
  readingTime: number;
  tags: string[];
}
