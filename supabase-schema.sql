-- =====================================================
-- SUPABASE SCHEMA FOR BETTING TIPS SYSTEM V2
-- Execute this in your Supabase SQL Editor
-- =====================================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- 1. TIPS TABLE (Main tips container)
-- =====================================================
CREATE TABLE tips (
    id VARCHAR(100) PRIMARY KEY,
    date_iso DATE NOT NULL,
    bet_type VARCHAR(20) NOT NULL CHECK (bet_type IN ('single', 'accumulator')),
    risk VARCHAR(10) NOT NULL CHECK (risk IN ('safe', 'medium', 'high')),
    rationale TEXT NOT NULL,
    result VARCHAR(10) DEFAULT 'pending' CHECK (result IN ('pending', 'win', 'loss', 'void')),
    
    -- Combined odds (for accumulator bets)
    combined_avg_odds DECIMAL(8,2),
    combined_bookmakers JSONB, -- Store bookmaker odds as JSON
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    generated_by VARCHAR(50) DEFAULT 'manual',
    
    -- Indexes for performance
    CONSTRAINT tips_date_check CHECK (date_iso >= '2024-01-01'),
    CONSTRAINT tips_odds_check CHECK (combined_avg_odds IS NULL OR combined_avg_odds >= 1.01)
);

-- =====================================================
-- 2. TIP LEGS TABLE (Individual bets within tips)
-- =====================================================
CREATE TABLE tip_legs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    tip_id VARCHAR(100) REFERENCES tips(id) ON DELETE CASCADE,
    leg_index INTEGER NOT NULL DEFAULT 0,
    
    -- Sport & League info
    sport VARCHAR(50) NOT NULL,
    league VARCHAR(100),
    
    -- Event details
    event_name VARCHAR(200) NOT NULL,
    home_team VARCHAR(100),
    away_team VARCHAR(100),
    scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
    timezone VARCHAR(50),
    
    -- Betting details
    market VARCHAR(100) NOT NULL,
    selection VARCHAR(200) NOT NULL,
    avg_odds DECIMAL(8,2) NOT NULL,
    
    -- Constraints
    CONSTRAINT tip_legs_odds_check CHECK (avg_odds >= 1.01),
    CONSTRAINT tip_legs_scheduled_check CHECK (scheduled_at > '2024-01-01'::timestamp),
    
    -- Ensure legs are ordered properly
    UNIQUE(tip_id, leg_index)
);

-- =====================================================
-- 3. BOOKMAKER ODDS TABLE (Individual bookmaker prices)
-- =====================================================
CREATE TABLE bookmaker_odds (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    tip_leg_id UUID REFERENCES tip_legs(id) ON DELETE CASCADE,
    bookmaker_name VARCHAR(50) NOT NULL,
    odds DECIMAL(8,2) NOT NULL,
    bookmaker_url VARCHAR(200),
    
    -- Constraints
    CONSTRAINT bookmaker_odds_check CHECK (odds >= 1.01),
    CONSTRAINT bookmaker_name_check CHECK (LENGTH(bookmaker_name) >= 3),
    
    -- Prevent duplicate bookmakers per leg
    UNIQUE(tip_leg_id, bookmaker_name)
);

-- =====================================================
-- 4. DAILY METADATA TABLE (SEO & generation info)
-- =====================================================
CREATE TABLE daily_metadata (
    date_iso DATE PRIMARY KEY,
    version INTEGER DEFAULT 2,
    generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    generated_by VARCHAR(50) DEFAULT 'manual',
    
    -- SEO fields
    seo_title VARCHAR(200),
    seo_description VARCHAR(500),
    
    -- Stats
    tips_count INTEGER DEFAULT 0,
    safe_tips_count INTEGER DEFAULT 0,
    medium_tips_count INTEGER DEFAULT 0,
    high_tips_count INTEGER DEFAULT 0
);

-- =====================================================
-- 5. INDEXES FOR PERFORMANCE
-- =====================================================

-- Tips table indexes
CREATE INDEX idx_tips_date_iso ON tips(date_iso DESC);
CREATE INDEX idx_tips_result ON tips(result);
CREATE INDEX idx_tips_risk ON tips(risk);
CREATE INDEX idx_tips_bet_type ON tips(bet_type);
CREATE INDEX idx_tips_created_at ON tips(created_at DESC);

-- Tip legs indexes
CREATE INDEX idx_tip_legs_tip_id ON tip_legs(tip_id);
CREATE INDEX idx_tip_legs_sport ON tip_legs(sport);
CREATE INDEX idx_tip_legs_scheduled_at ON tip_legs(scheduled_at DESC);
CREATE INDEX idx_tip_legs_league ON tip_legs(league);

-- Bookmaker odds indexes
CREATE INDEX idx_bookmaker_odds_leg_id ON bookmaker_odds(tip_leg_id);
CREATE INDEX idx_bookmaker_odds_bookmaker ON bookmaker_odds(bookmaker_name);

-- Composite indexes for common queries
CREATE INDEX idx_tips_date_result ON tips(date_iso DESC, result);
CREATE INDEX idx_tips_date_risk ON tips(date_iso DESC, risk);

-- =====================================================
-- 6. ROW LEVEL SECURITY (Optional - for multi-user)
-- =====================================================

-- Enable RLS (comment out if not needed)
-- ALTER TABLE tips ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE tip_legs ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE bookmaker_odds ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE daily_metadata ENABLE ROW LEVEL SECURITY;

-- Allow public read access (uncomment if needed)
-- CREATE POLICY "Allow public read access" ON tips FOR SELECT USING (true);
-- CREATE POLICY "Allow public read access" ON tip_legs FOR SELECT USING (true);
-- CREATE POLICY "Allow public read access" ON bookmaker_odds FOR SELECT USING (true);
-- CREATE POLICY "Allow public read access" ON daily_metadata FOR SELECT USING (true);

-- =====================================================
-- 7. TRIGGERS FOR AUTOMATIC UPDATES
-- =====================================================

-- Update updated_at timestamp automatically
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_tips_updated_at 
    BEFORE UPDATE ON tips 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Update daily metadata counts when tips change
CREATE OR REPLACE FUNCTION update_daily_metadata_counts()
RETURNS TRIGGER AS $$
BEGIN
    -- Update or insert daily metadata
    INSERT INTO daily_metadata (
        date_iso, 
        tips_count,
        safe_tips_count,
        medium_tips_count,
        high_tips_count
    )
    SELECT 
        date_iso,
        COUNT(*) as tips_count,
        COUNT(*) FILTER (WHERE risk = 'safe') as safe_tips_count,
        COUNT(*) FILTER (WHERE risk = 'medium') as medium_tips_count,
        COUNT(*) FILTER (WHERE risk = 'high') as high_tips_count
    FROM tips 
    WHERE date_iso = COALESCE(NEW.date_iso, OLD.date_iso)
    GROUP BY date_iso
    ON CONFLICT (date_iso) 
    DO UPDATE SET
        tips_count = EXCLUDED.tips_count,
        safe_tips_count = EXCLUDED.safe_tips_count,
        medium_tips_count = EXCLUDED.medium_tips_count,
        high_tips_count = EXCLUDED.high_tips_count;
        
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_daily_counts_on_insert
    AFTER INSERT ON tips
    FOR EACH ROW EXECUTE FUNCTION update_daily_metadata_counts();

CREATE TRIGGER update_daily_counts_on_update
    AFTER UPDATE ON tips
    FOR EACH ROW EXECUTE FUNCTION update_daily_metadata_counts();

CREATE TRIGGER update_daily_counts_on_delete
    AFTER DELETE ON tips
    FOR EACH ROW EXECUTE FUNCTION update_daily_metadata_counts();

-- =====================================================
-- 8. VIEWS FOR COMMON QUERIES
-- =====================================================

-- Complete tips with legs (most common query)
CREATE VIEW v_tips_complete AS
SELECT 
    t.*,
    COALESCE(
        json_agg(
            json_build_object(
                'id', tl.id,
                'leg_index', tl.leg_index,
                'sport', tl.sport,
                'league', tl.league,
                'event', json_build_object(
                    'name', tl.event_name,
                    'home', tl.home_team,
                    'away', tl.away_team,
                    'scheduledAt', tl.scheduled_at,
                    'timezone', tl.timezone
                ),
                'market', tl.market,
                'selection', tl.selection,
                'avgOdds', tl.avg_odds,
                'bookmakers', COALESCE(
                    (SELECT json_agg(
                        json_build_object(
                            'name', bo.bookmaker_name,
                            'odds', bo.odds,
                            'url', bo.bookmaker_url
                        )
                    )
                    FROM bookmaker_odds bo 
                    WHERE bo.tip_leg_id = tl.id),
                    '[]'::json
                )
            )
            ORDER BY tl.leg_index
        ), 
        '[]'::json
    ) as legs
FROM tips t
LEFT JOIN tip_legs tl ON t.id = tl.tip_id
GROUP BY t.id, t.date_iso, t.bet_type, t.risk, t.rationale, t.result, 
         t.combined_avg_odds, t.combined_bookmakers, t.created_at, 
         t.updated_at, t.generated_by;

-- Daily summary view
CREATE VIEW v_daily_summary AS
SELECT 
    dm.*,
    COUNT(t.id) as actual_tips_count,
    COUNT(t.id) FILTER (WHERE t.result = 'win') as wins,
    COUNT(t.id) FILTER (WHERE t.result = 'loss') as losses,
    COUNT(t.id) FILTER (WHERE t.result = 'pending') as pending,
    COUNT(t.id) FILTER (WHERE t.result = 'void') as voids,
    ROUND(
        COUNT(t.id) FILTER (WHERE t.result = 'win')::decimal / 
        NULLIF(COUNT(t.id) FILTER (WHERE t.result IN ('win', 'loss')), 0) * 100, 
        2
    ) as win_rate_percentage
FROM daily_metadata dm
LEFT JOIN tips t ON dm.date_iso = t.date_iso
GROUP BY dm.date_iso, dm.version, dm.generated_at, dm.generated_by, 
         dm.seo_title, dm.seo_description, dm.tips_count, 
         dm.safe_tips_count, dm.medium_tips_count, dm.high_tips_count;

-- =====================================================
-- SCHEMA COMPLETE! 
-- Execute this in your Supabase SQL Editor
-- =====================================================
