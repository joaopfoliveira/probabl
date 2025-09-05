/**
 * Supabase data operations for betting tips
 * Replaces the file-based data operations with database queries
 */

import { supabase } from './supabase'
import type { DailyTipsPayload, TipItem, TipFilters, Result } from './types'
import type { Database } from './database.types'

type TipRow = Database['public']['Tables']['tips']['Row']
type TipInsert = Database['public']['Tables']['tips']['Insert']
type TipLegInsert = Database['public']['Tables']['tip_legs']['Insert']
type BookmakerOddsInsert = Database['public']['Tables']['bookmaker_odds']['Insert']

/**
 * Save daily tips to Supabase
 */
export async function saveDailyTipsToDb(payload: DailyTipsPayload): Promise<void> {
  const { data: existingTips, error: checkError } = await supabase
    .from('tips')
    .select('id')
    .eq('date_iso', payload.dateISO)
    .limit(1)

  if (checkError) {
    throw new Error(`Error checking existing tips: ${checkError.message}`)
  }

  if (existingTips && existingTips.length > 0) {
    throw new Error(`Tips for ${payload.dateISO} already exist. Delete them first to recreate.`)
  }

  // Start a transaction-like operation
  try {
    // 1. Insert daily metadata
    const { error: metadataError } = await supabase
      .from('daily_metadata')
      .upsert({
        date_iso: payload.dateISO,
        version: payload.version,
        generated_by: payload.generatedBy || 'manual',
        seo_title: payload.seo?.title || null,
        seo_description: payload.seo?.description || null,
        tips_count: payload.tips.length,
        safe_tips_count: payload.tips.filter(t => t.risk === 'safe').length,
        medium_tips_count: payload.tips.filter(t => t.risk === 'medium').length,
        high_tips_count: payload.tips.filter(t => t.risk === 'high').length
      })

    if (metadataError) {
      throw new Error(`Error saving metadata: ${metadataError.message}`)
    }

    // 2. Insert tips
    for (const tip of payload.tips) {
      await saveSingleTipToDb(tip, payload.dateISO)
    }

  } catch (error) {
    // Rollback by deleting any created tips
    await supabase
      .from('tips')
      .delete()
      .eq('date_iso', payload.dateISO)
    
    throw error
  }
}

/**
 * Save a single tip with its legs and bookmaker odds
 */
async function saveSingleTipToDb(tip: TipItem, dateISO: string): Promise<void> {
  // 1. Insert the main tip
  const tipInsert: TipInsert = {
    id: tip.id,
    date_iso: dateISO,
    bet_type: tip.betType,
    risk: tip.risk,
    rationale: tip.rationale,
    result: tip.result || 'pending',
    combined_avg_odds: tip.combined?.avgOdds || null,
    combined_bookmakers: tip.combined?.bookmakers ? JSON.stringify(tip.combined.bookmakers) : null
  }

  const { error: tipError } = await supabase
    .from('tips')
    .insert(tipInsert)

  if (tipError) {
    throw new Error(`Error saving tip ${tip.id}: ${tipError.message}`)
  }

  // 2. Insert legs
  for (let i = 0; i < tip.legs.length; i++) {
    const leg = tip.legs[i]
    
    const legInsert: TipLegInsert = {
      tip_id: tip.id,
      leg_index: i,
      sport: leg.sport,
      league: leg.league || null,
      event_name: leg.event.name,
      home_team: leg.event.home || null,
      away_team: leg.event.away || null,
      scheduled_at: leg.event.scheduledAt,
      timezone: leg.event.timezone || null,
      market: leg.market,
      selection: leg.selection,
      avg_odds: leg.avgOdds
    }

    const { data: legData, error: legError } = await supabase
      .from('tip_legs')
      .insert(legInsert)
      .select('id')
      .single()

    if (legError) {
      throw new Error(`Error saving leg for tip ${tip.id}: ${legError.message}`)
    }

    // 3. Insert bookmaker odds for this leg
    for (const bookmaker of leg.bookmakers) {
      const oddsInsert: BookmakerOddsInsert = {
        tip_leg_id: legData.id,
        bookmaker_name: bookmaker.name,
        odds: bookmaker.odds,
        bookmaker_url: bookmaker.url || null
      }

      const { error: oddsError } = await supabase
        .from('bookmaker_odds')
        .insert(oddsInsert)

      if (oddsError) {
        throw new Error(`Error saving odds for tip ${tip.id}: ${oddsError.message}`)
      }
    }
  }
}

/**
 * Load daily tips for a specific date
 */
export async function loadDailyTipsFromDb(dateISO: string): Promise<DailyTipsPayload | null> {
  // Get tips using the complete view
  const { data: tipsData, error: tipsError } = await supabase
    .from('v_tips_complete')
    .select('*')
    .eq('date_iso', dateISO)
    .order('created_at')

  if (tipsError) {
    throw new Error(`Error loading tips for ${dateISO}: ${tipsError.message}`)
  }

  if (!tipsData || tipsData.length === 0) {
    return null
  }

  // Get metadata
  const { data: metaData, error: metaError } = await supabase
    .from('daily_metadata')
    .select('*')
    .eq('date_iso', dateISO)
    .single()

  if (metaError && metaError.code !== 'PGRST116') { // Ignore "not found" errors
    throw new Error(`Error loading metadata for ${dateISO}: ${metaError.message}`)
  }

  // Convert database format to our DailyTipsPayload format
  const tips: TipItem[] = tipsData.map(row => ({
    id: row.id,
    betType: row.bet_type,
    risk: row.risk,
    rationale: row.rationale,
    result: row.result,
    legs: Array.isArray(row.legs) ? row.legs.map((leg: any) => ({
      sport: leg.sport,
      league: leg.league,
      event: {
        name: leg.event.name,
        home: leg.event.home,
        away: leg.event.away,
        scheduledAt: leg.event.scheduledAt,
        timezone: leg.event.timezone
      },
      market: leg.market,
      selection: leg.selection,
      avgOdds: leg.avgOdds,
      bookmakers: leg.bookmakers || []
    })) : [],
    ...(row.combined_avg_odds ? {
      combined: {
        avgOdds: row.combined_avg_odds,
        bookmakers: row.combined_bookmakers ? JSON.parse(row.combined_bookmakers as string) : []
      }
    } : {})
  }))

  return {
    version: 2,
    dateISO,
    generatedAt: metaData?.generated_at || tipsData[0].created_at,
    generatedBy: metaData?.generated_by || 'manual',
    tips,
    seo: metaData ? {
      title: metaData.seo_title || '',
      description: metaData.seo_description || ''
    } : undefined
  }
}

/**
 * Get tips with filters (for history page)
 */
export async function getTipsWithFiltersFromDb(
  filters: TipFilters = {},
  page: number = 1,
  limit: number = 20
): Promise<{ tips: (TipItem & { date: string })[], total: number, totalPages: number }> {
  
  let query = supabase
    .from('v_tips_complete')
    .select('*', { count: 'exact' })

  // Apply filters
  if (filters.sport) {
    // This requires a subquery - simplified for now
    // In a real implementation, you'd need to join with tip_legs
  }
  
  if (filters.risk) {
    query = query.eq('risk', filters.risk)
  }
  
  if (filters.result) {
    query = query.eq('result', filters.result)
  }
  
  if (filters.betType) {
    query = query.eq('bet_type', filters.betType)
  }
  
  if (filters.dateFrom) {
    query = query.gte('date_iso', filters.dateFrom)
  }
  
  if (filters.dateTo) {
    query = query.lte('date_iso', filters.dateTo)
  }

  // Apply pagination
  const from = (page - 1) * limit
  const to = from + limit - 1
  
  query = query
    .order('date_iso', { ascending: false })
    .order('created_at', { ascending: false })
    .range(from, to)

  const { data, error, count } = await query

  if (error) {
    throw new Error(`Error fetching tips: ${error.message}`)
  }

  const tips: (TipItem & { date: string })[] = (data || []).map(row => ({
    id: row.id,
    betType: row.bet_type,
    risk: row.risk,
    rationale: row.rationale,
    result: row.result,
    date: row.date_iso, // Add date property for admin panel compatibility
    legs: Array.isArray(row.legs) ? row.legs.map((leg: any) => ({
      sport: leg.sport,
      league: leg.league,
      event: {
        name: leg.event.name,
        home: leg.event.home,
        away: leg.event.away,
        scheduledAt: leg.event.scheduledAt,
        timezone: leg.event.timezone
      },
      market: leg.market,
      selection: leg.selection,
      avgOdds: leg.avgOdds,
      bookmakers: leg.bookmakers || []
    })) : [],
    ...(row.combined_avg_odds ? {
      combined: {
        avgOdds: row.combined_avg_odds,
        bookmakers: row.combined_bookmakers ? JSON.parse(row.combined_bookmakers as string) : []
      }
    } : {})
  }))

  const total = count || 0
  const totalPages = Math.ceil(total / limit)

  return { tips, total, totalPages }
}

/**
 * Update tip result
 */
export async function updateTipResultInDb(tipId: string, result: Result): Promise<void> {
  const { error } = await supabase
    .from('tips')
    .update({ result })
    .eq('id', tipId)

  if (error) {
    throw new Error(`Error updating tip result: ${error.message}`)
  }
}

/**
 * Delete tip and all related data from database
 */
export async function deleteTipFromDb(tipId: string): Promise<void> {
  // Delete the tip (this will cascade delete tip_legs and bookmaker_odds due to foreign keys)
  const { error } = await supabase
    .from('tips')
    .delete()
    .eq('id', tipId)

  if (error) {
    throw new Error(`Error deleting tip: ${error.message}`)
  }
}

/**
 * Get latest tips (for today page)
 */
export async function getLatestTipsFromDb(): Promise<DailyTipsPayload | null> {
  // Get the most recent date with tips
  const { data: latestDate, error: dateError } = await supabase
    .from('tips')
    .select('date_iso')
    .order('date_iso', { ascending: false })
    .limit(1)
    .single()

  if (dateError || !latestDate) {
    return null
  }

  return await loadDailyTipsFromDb(latestDate.date_iso)
}

/**
 * Get all available dates (for navigation)
 */
export async function getAvailableDatesFromDb(): Promise<string[]> {
  const { data, error } = await supabase
    .from('daily_metadata')
    .select('date_iso')
    .order('date_iso', { ascending: false })

  if (error) {
    throw new Error(`Error fetching available dates: ${error.message}`)
  }

  return (data || []).map(row => row.date_iso)
}
