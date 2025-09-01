/**
 * Zod schemas for validating tip data - V2 Leg-based Contract
 * Used for API validation and ChatGPT data ingestion
 */

import { z } from 'zod';
import type { 
  Risk, 
  Result, 
  BetType, 
  LocalizedText, 
  EventTeams, 
  BookmakerPrice, 
  Leg, 
  CombinedPrice, 
  TipItem, 
  DailyTipsPayload, 
  TipFilters 
} from './types';

// Base schemas
export const RiskSchema = z.enum(['safe', 'medium', 'high']) as z.ZodType<Risk>;
export const ResultSchema = z.enum(['win', 'loss', 'void', 'pending']) as z.ZodType<Result>;
export const BetTypeSchema = z.enum(['single', 'accumulator']) as z.ZodType<BetType>;

export const LocalizedTextSchema: z.ZodType<LocalizedText> = z.string().min(1).max(2000);

export const EventTeamsSchema: z.ZodType<EventTeams> = z.object({
  home: z.string().optional(),
  away: z.string().optional(),
  name: z.string().optional(),
}).refine(
  (data) => data.home || data.away || data.name,
  {
    message: "At least one of home, away, or name must be provided",
  }
);

export const BookmakerPriceSchema: z.ZodType<BookmakerPrice> = z.object({
  name: z.string().min(1),
  odds: z.number().min(1.01).max(1000),
  url: z.string().url().optional(),
});

export const LegSchema: z.ZodType<Leg> = z.object({
  legId: z.string().optional(),
  sport: z.string().min(1),
  league: z.string().optional(),
  event: EventTeamsSchema,
  market: z.string().min(1),
  selection: z.string().min(1),
  avgOdds: z.number().min(1.01).max(1000),
  bookmakers: z.array(BookmakerPriceSchema).min(1).max(6),
});

export const CombinedPriceSchema: z.ZodType<CombinedPrice> = z.object({
  avgOdds: z.number().min(1.01).max(1000),
  bookmakers: z.array(BookmakerPriceSchema).min(1).max(6),
});

export const TipItemSchema: z.ZodType<TipItem> = z.object({
  id: z.string().min(1).regex(/^[a-z0-9-]+$/, "ID must be kebab-case"),
  betType: BetTypeSchema,
  risk: RiskSchema,
  legs: z.array(LegSchema).min(1),
  combined: CombinedPriceSchema.optional(),
  rationale: z.string().min(1).max(1000), // Flexible rationale - no sentence restrictions
  result: ResultSchema.optional().default('pending'),
}).refine(
  (data) => {
    // Single bet validation: exactly 1 leg, no combined
    if (data.betType === 'single') {
      return data.legs.length === 1 && data.combined === undefined;
    }
    // Accumulator validation: 2+ legs, combined required
    if (data.betType === 'accumulator') {
      return data.legs.length >= 2 && data.combined !== undefined;
    }
    return false;
  },
  {
    message: "Single bets must have 1 leg and no combined odds. Accumulators must have 2+ legs and combined odds.",
  }
).refine(
  (data) => {
    // Explicitly allow any rationale content - override any hidden sentence validation
    return typeof data.rationale === 'string' && data.rationale.length > 0;
  },
  {
    message: "Rationale must be a non-empty string",
  }
);

export const DailyTipsPayloadSchema: z.ZodType<DailyTipsPayload> = z.object({
  version: z.literal(2),
  dateISO: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format"),
  generatedAt: z.string().datetime(),
  generatedBy: z.string().min(1),
  tips: z.array(TipItemSchema).min(1, "Must have at least 1 tip"),
  seo: z.object({
    title: LocalizedTextSchema,
    description: LocalizedTextSchema,
  }).optional(),
}).refine(
  (data) => {
    // Ensure all tip IDs are unique
    const ids = data.tips.map(tip => tip.id);
    return new Set(ids).size === ids.length;
  },
  {
    message: "All tip IDs must be unique",
  }
);

// Filter schemas for API validation
export const TipFiltersSchema: z.ZodType<TipFilters> = z.object({
  sport: z.string().optional(),
  risk: RiskSchema.optional(),
  result: ResultSchema.optional(),
  betType: BetTypeSchema.optional(),
  minLegs: z.number().int().min(1).optional(),
  dateFrom: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  dateTo: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
}).refine(
  (data) => {
    if (data.dateFrom && data.dateTo) {
      return new Date(data.dateFrom) <= new Date(data.dateTo);
    }
    return true;
  },
  {
    message: "dateFrom must be before or equal to dateTo",
  }
);

// Date validation schema
export const DateISOSchema = z.string().regex(
  /^\d{4}-\d{2}-\d{2}$/,
  "Date must be in YYYY-MM-DD format"
).refine(
  (date) => {
    const parsed = new Date(date);
    return !isNaN(parsed.getTime()) && parsed.toISOString().split('T')[0] === date;
  },
  {
    message: "Date must be a valid date in YYYY-MM-DD format",
  }
);

// Validation helpers
export function validateDailyTips(data: unknown): DailyTipsPayload {
  return DailyTipsPayloadSchema.parse(data);
}

export function validateTipFilters(data: unknown): TipFilters {
  return TipFiltersSchema.parse(data);
}

export function validateDateISO(date: unknown): string {
  return DateISOSchema.parse(date);
}
