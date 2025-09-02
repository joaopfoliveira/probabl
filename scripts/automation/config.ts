/**
 * Configuration for automated tips generation system
 */

export const AUTOMATION_CONFIG = {
  // LLM Configuration
  llm: {
    provider: 'openai', // or 'anthropic', 'google'
    model: 'gpt-4o-mini', // cost-effective model for daily generation
    maxTokens: 4000,
    temperature: 0.1, // Low temperature for consistent, reliable outputs
  },

  // Research Sources for LLM (no scraping - LLM does online research)
  researchSources: [
    'OddsPortal.com - for odds comparison and tip analysis',
    'ESPN.com - for sports news and match previews', 
    'BBC Sport - for match analysis and team news',
    'BettingExpert.com - for community tips and expert predictions',
    'Tipster.com - for professional tipster recommendations',
    'Sky Sports - for injury news and form analysis',
    'Official team websites and social media - for lineup confirmations',
  ],

  // Generation Rules
  generation: {
    tipsPerDay: 3, // Exactly 3 tips per day
    riskDistribution: ['safe', 'medium', 'high'], // One of each
    sportsVariety: true, // Try to include different sports
    minOdds: 1.05,
    maxOdds: 10.0,
    requireBookmakers: 3, // Minimum bookmakers per leg
  },

  // Scheduling
  schedule: {
    timezone: 'Europe/Lisbon',
    dailyRunTime: '09:00', // 9 AM Lisbon time
    retryAttempts: 3,
    retryDelayMinutes: 30,
  },

  // Output Configuration  
  output: {
    directory: 'data/daily',
    backupDirectory: 'data/backups',
    logDirectory: 'logs/automation',
  }
};

export const SCRAPING_SELECTORS = {
  oddsportal: {
    tipContainer: '.tip-item',
    sport: '.sport-name',
    event: '.match-name', 
    selection: '.tip-selection',
    odds: '.odds-value',
    confidence: '.confidence-level',
  },
  // Add more selectors as needed
};

export const LLM_PROMPTS = {
  systemPrompt: `You are an expert sports betting analyst with access to current sports information. Your task is to research current sporting events online and generate exactly 3 high-quality betting tips for today following a specific JSON schema.

CRITICAL REQUIREMENTS:
1. Generate exactly 3 tips: 1 safe (low risk), 1 medium risk, 1 high risk
2. Include variety in sports (tennis, football, basketball, etc.)
3. Each tip must include realistic bookmaker odds from 3+ bookmakers
4. ALL EVENTS must include accurate scheduled start times (scheduledAt field)
5. Accumulator tips should have 2-3 legs maximum
6. All events must be scheduled for today or within the next 7 days
7. Rationale must be 1-3 sentences explaining the logic based on research
8. Use real teams/players and realistic current odds
9. Follow the exact JSON schema provided including event scheduling

RESEARCH PROCESS:
- Research current sports fixtures and events
- Check team/player form, injuries, and news
- Find realistic current odds from major bookmakers
- Ensure event times are accurate and in the future
- Base predictions on actual sporting analysis`,

  generationPrompt: (researchSources: string[]) => `Research current sporting events online and generate exactly 3 betting tips for today/this week following the V2 schema.

RESEARCH THESE SOURCES FOR CURRENT EVENTS AND ODDS:
${researchSources.map(source => `• ${source}`).join('\n')}

RESEARCH REQUIREMENTS:
1. Find REAL sporting events scheduled for today or next 7 days
2. Get accurate event start times and dates
3. Research current bookmaker odds from major sites
4. Check team/player form, injuries, and recent news
5. Identify value betting opportunities

TIP REQUIREMENTS:
- 1 SAFE tip (accumulator, odds ~1.30-1.50) - 2 heavy favorites
- 1 MEDIUM tip (single, odds ~1.80-2.50) - well-researched selection  
- 1 HIGH tip (single, odds ~3.00-6.00) - value opportunity
- Include realistic bookmaker odds (Unibet, Betclic, Bwin, Betano, etc.)
- Each bookmaker should have slightly different odds
- ALL events must have accurate scheduledAt times (ISO format)
- Mix sports when possible (tennis, football, basketball)

IMPORTANT: 
- Event dates/times must be realistic and in the future
- Base selections on actual current sporting knowledge
- Provide genuine analysis in rationales
- Ensure all data matches real-world information

Generate valid JSON matching the DailyTipsPayload schema exactly, with accurate event scheduling.`
};
