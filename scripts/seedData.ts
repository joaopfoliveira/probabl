#!/usr/bin/env tsx
/**
 * Script to generate seed data for testing
 * Creates sample tips for the last 7 days
 */

import { format, subDays } from 'date-fns';
import { saveDailyTipsWithOverwrite, getTodayDateISO } from '../src/lib/data';
import type { DailyTipsPayload, TipItem } from '../src/lib/types';

const SAMPLE_SPORTS = ['Futebol', 'Ténis', 'Basketebol', 'Hockey no Gelo', 'Basebol'];
const SAMPLE_LEAGUES = {
  'Futebol': ['Liga Portugal', 'Premier League', 'La Liga', 'Serie A', 'Bundesliga'],
  'Ténis': ['ATP', 'WTA', 'Challenger', 'ITF'],
  'Basketebol': ['NBA', 'EuroLeague', 'Liga ACB', 'LNB'],
  'Hockey no Gelo': ['NHL', 'KHL', 'SHL'],
  'Basebol': ['MLB', 'NPB', 'KBO'],
};

const SAMPLE_MARKETS = [
  '1X2', 'Over 2.5', 'Under 2.5', 'Over 3.5', 'Under 3.5',
  'Handicap Asiático', 'Handicap Europeu', 'Dupla Hipótese',
  'Total Games', 'Set Correto', 'Pontos Totais', 'Spread',
];

const SAMPLE_TEAMS = {
  'Futebol': [
    ['Benfica', 'Porto'], ['Sporting', 'Braga'], ['Real Madrid', 'Barcelona'],
    ['Manchester City', 'Liverpool'], ['Juventus', 'Milan'], ['Bayern', 'Dortmund']
  ],
  'Ténis': [
    ['Djokovic', 'Nadal'], ['Alcaraz', 'Sinner'], ['Medvedev', 'Zverev'],
    ['Swiatek', 'Sabalenka'], ['Rybakina', 'Gauff'], ['Ostapenko', 'Kvitova']
  ],
  'Basketebol': [
    ['Lakers', 'Celtics'], ['Warriors', 'Heat'], ['Nuggets', 'Suns'],
    ['Real Madrid', 'Barcelona'], ['Panathinaikos', 'Olympiacos']
  ],
  'Hockey no Gelo': [
    ['Rangers', 'Bruins'], ['Oilers', 'Flames'], ['Lightning', 'Panthers']
  ],
  'Basebol': [
    ['Yankees', 'Red Sox'], ['Dodgers', 'Giants'], ['Astros', 'Rangers']
  ],
};

function getRandomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

// Common bookmaker names for synthetic data
const BOOKMAKERS = ['bet365', 'Betfair', 'Betano', 'Pinnacle', 'Betclic', 'Bwin'];

function generateRandomOdds(risk: 'safe' | 'medium' | 'high'): number {
  switch (risk) {
    case 'safe':
      return Math.round((1.20 + Math.random() * 0.60) * 100) / 100; // 1.20-1.80
    case 'medium':
      return Math.round((1.80 + Math.random() * 1.20) * 100) / 100; // 1.80-3.00
    case 'high':
      return Math.round((3.00 + Math.random() * 7.00) * 100) / 100; // 3.00-10.00
  }
}

function generateSyntheticBookmakers(baseOdds: number, count: number = 4): Array<{name: string, odds: number}> {
  const bookmakers: Array<{name: string, odds: number}> = [];
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

function generateTip(risk: 'safe' | 'medium' | 'high', index: number): TipItem {
  const sport = getRandomElement(SAMPLE_SPORTS);
  const league = getRandomElement(SAMPLE_LEAGUES[sport as keyof typeof SAMPLE_LEAGUES] || ['Liga Geral']);
  const teams = getRandomElement(SAMPLE_TEAMS[sport as keyof typeof SAMPLE_TEAMS] || [['Team A', 'Team B']]);
  const market = getRandomElement(SAMPLE_MARKETS);
  
  const selections = {
    '1X2': [teams[0], 'Empate', teams[1]],
    'Over 2.5': ['Over 2.5'],
    'Under 2.5': ['Under 2.5'],
    'Over 3.5': ['Over 3.5'],
    'Under 3.5': ['Under 3.5'],
    'Handicap Asiático': [`${teams[0]} -1`, `${teams[1]} +1`],
    'Total Games': ['Over 21.5', 'Under 21.5'],
    'Pontos Totais': ['Over 205.5', 'Under 205.5'],
  };
  
  const possibleSelections = selections[market as keyof typeof selections] || [teams[0]];
  const selection = getRandomElement(possibleSelections);
  
  const rationales = {
    safe: [
      'Consistent home team form over the last 5 matches.',
      'Superior defensive stats and home advantage factor.',
      'Favorable head-to-head record and balanced squad rotation.',
      'Recent offensive trend and extra motivation for the match.',
    ],
    medium: [
      'Balance between teams suggests a competitive match.',
      'Both teams need points at this stage of the season.',
      'Recent goal pattern points to a high-scoring game.',
      'Individual quality could decide in key moments.',
    ],
    high: [
      'Speculative value based on specific context analysis.',
      'Interesting odds for low probability scenario.',
      'Particular tactical situation may favor unexpected result.',
      'High-risk bet with potential high return.',
    ]
  };
  
  const eventName = sport === 'Ténis' ? teams.join(' vs ') : `${teams[0]} vs ${teams[1]}`;
  const eventObject = sport === 'Ténis' 
    ? { name: eventName }
    : { home: teams[0], away: teams[1], name: eventName };
  
  // Determine if this should be an accumulator (medium risk has 50% chance)
  const isAccumulator = risk === 'medium' && Math.random() > 0.5;
  
  if (isAccumulator) {
    // Generate accumulator with 2-3 legs
    const numLegs = 2 + Math.floor(Math.random() * 2); // 2 or 3 legs
    const legs: Array<{
      sport: string;
      league?: string;
      event: { home?: string; away?: string; name?: string };
      market: string;
      selection: string;
      avgOdds: number;
      bookmakers: Array<{name: string, odds: number}>;
    }> = [];
    
    const combinedOdds = generateRandomOdds(risk);
    const legOdds = Math.pow(combinedOdds, 1/numLegs); // Approximate individual leg odds
    
    for (let i = 0; i < numLegs; i++) {
      const legSport = getRandomElement(SAMPLE_SPORTS);
      const legLeague = getRandomElement(SAMPLE_LEAGUES[legSport as keyof typeof SAMPLE_LEAGUES] || ['Liga Geral']);
      const legTeams = getRandomElement(SAMPLE_TEAMS[legSport as keyof typeof SAMPLE_TEAMS] || [['Team A', 'Team B']]);
      const legMarket = getRandomElement(SAMPLE_MARKETS);
      const legSelections = selections[legMarket as keyof typeof selections] || [legTeams[0]];
      const legSelection = getRandomElement(legSelections);
      
      const legEventName = legSport === 'Ténis' ? legTeams.join(' vs ') : `${legTeams[0]} vs ${legTeams[1]}`;
      const legEventObject = legSport === 'Ténis' 
        ? { name: legEventName }
        : { home: legTeams[0], away: legTeams[1], name: legEventName };
      
      const actualLegOdds = Math.round(legOdds * 100) / 100;
      
      legs.push({
        sport: legSport,
        league: legLeague,
        event: legEventObject,
        market: legMarket,
        selection: legSelection,
        avgOdds: actualLegOdds,
        bookmakers: generateSyntheticBookmakers(actualLegOdds),
      });
    }
    
    return {
      id: `tip-${Date.now()}-${Math.random().toString(36).substr(2, 9)}-${index}`,
      betType: 'accumulator',
      risk,
      legs,
      combined: {
        avgOdds: combinedOdds,
        bookmakers: generateSyntheticBookmakers(combinedOdds),
      },
      rationale: getRandomElement(rationales[risk]),
      result: 'pending',
    };
  } else {
    // Generate single bet
    const singleOdds = generateRandomOdds(risk);
    
    return {
      id: `tip-${Date.now()}-${Math.random().toString(36).substr(2, 9)}-${index}`,
      betType: 'single',
      risk,
      legs: [{
        sport,
        league,
        event: eventObject,
        market,
        selection,
        avgOdds: singleOdds,
        bookmakers: generateSyntheticBookmakers(singleOdds),
      }],
      // No combined for single bets
      rationale: getRandomElement(rationales[risk]),
      result: 'pending',
    };
  }
}

function generateRandomResult(): 'win' | 'loss' | 'void' {
  const rand = Math.random();
  if (rand < 0.45) return 'win';   // 45% win rate
  if (rand < 0.90) return 'loss';  // 45% loss rate  
  return 'void';                   // 10% void rate
}

async function generateDayTips(date: string, isToday = false): Promise<DailyTipsPayload> {
  const tips: [TipItem, TipItem, TipItem] = [
    generateTip('safe', 1),
    generateTip('medium', 2), 
    generateTip('high', 3),
  ];
  
  // Set results for past days
  if (!isToday) {
    tips.forEach(tip => {
      tip.result = generateRandomResult();
      // Note: In v2, we don't have closingOdds at tip level - could be added to legs if needed
    });
  }
  
  return {
    version: 2,
    dateISO: date,
    generatedAt: new Date().toISOString(),
    generatedBy: 'chatgpt',
    tips,
    seo: {
      title: `Betting tips for ${date} — safe, medium and high risk`,
      description: 'Three AI-generated suggestions with analysis and odds for different risk profiles.',
    },
  };
}

async function main() {
  const args = process.argv.slice(2);
  const overwrite = args.includes('--overwrite');
  const days = parseInt(args.find(arg => arg.startsWith('--days='))?.split('=')[1] || '7', 10);
  
  console.log(`🌱 Generating seed data for ${days} days...`);
  
  const today = getTodayDateISO();
  const dates: string[] = [];
  
  // Generate dates (today + last N-1 days)
  for (let i = 0; i < days; i++) {
    const date = format(subDays(new Date(today), i), 'yyyy-MM-dd');
    dates.push(date);
  }
  
  dates.sort(); // Sort chronologically
  
  for (const date of dates) {
    try {
      const isToday = date === today;
      const dailyTips = await generateDayTips(date, isToday);
      
      await saveDailyTipsWithOverwrite(dailyTips, overwrite);
      
      const statusEmoji = isToday ? '📅' : '✅';
      const resultSummary = isToday 
        ? 'pending' 
        : dailyTips.tips.map(t => t.result).join(', ');
        
      console.log(`${statusEmoji} ${date}: ${dailyTips.tips.map(t => `${t.risk} (${t.betType}, ${t.legs.length} leg${t.legs.length > 1 ? 's' : ''})`).join(', ')} - ${resultSummary}`);
      
    } catch (error) {
      if (error instanceof Error && error.message.includes('already exist')) {
        console.log(`⏭️  ${date}: Tips already exist (use --overwrite to replace)`);
      } else {
        console.error(`❌ ${date}: Error -`, error);
      }
    }
  }
  
  console.log(`🎉 Seed data generation complete!`);
  console.log(`💡 To regenerate with overwrite: npm run seed -- --overwrite`);
  console.log(`💡 To change number of days: npm run seed -- --days=14`);
}

if (require.main === module) {
  main();
}
