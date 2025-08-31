# Probabl - AI-Powered Betting Tips Platform (V2)

A modern Next.js application for displaying AI-generated betting tips with a leg-based data structure supporting both single bets and accumulators.

## Features

- **V2 Leg-Based Architecture**: Support for single bets and multi-leg accumulators
- **Responsive Design**: Built with Tailwind CSS and Radix UI components  
- **Dark/Light Theme**: Toggle between themes with persistent preference
- **Real-time Odds**: Display average odds and multiple bookmaker prices
- **Export Functionality**: CSV and JSON export with flattened data structure
- **SEO Optimized**: Sitemap, robots.txt, and meta tags
- **TypeScript**: Fully typed with Zod validation

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Components**: Radix UI
- **Validation**: Zod schemas
- **Date Handling**: date-fns
- **Theme**: next-themes

## Getting Started

### Prerequisites

- Node.js 18+
- npm/yarn/pnpm

### Installation

```bash
# Clone the repository
git clone <repo-url>
cd betting-tips-ai

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## Data Structure (V2)

### Daily Tips Format

```json
{
  "version": 2,
  "dateISO": "2025-08-31",
  "generatedAt": "2025-08-31T10:00:00.000Z",
  "generatedBy": "chatgpt",
  "tips": [
    {
      "id": "tip-id-safe",
      "betType": "single|accumulator",
      "risk": "safe|medium|high", 
      "legs": [
        {
          "sport": "Football",
          "league": "Premier League",
          "event": {
            "home": "Arsenal",
            "away": "Liverpool", 
            "name": "Arsenal vs Liverpool"
          },
          "market": "1X2",
          "selection": "Arsenal to win",
          "avgOdds": 2.30,
          "bookmakers": [
            { "name": "bet365", "odds": 2.25 },
            { "name": "Betfair", "odds": 2.30 }
          ]
        }
      ],
      "combined": {
        "avgOdds": 11.20,
        "bookmakers": [...]
      },
      "rationale": "Analysis and reasoning...",
      "result": "pending|win|loss|void"
    }
  ],
  "seo": {
    "title": "SEO title",
    "description": "SEO description"
  }
}
```

### Validation Rules

- `betType === "single"` → `legs.length === 1` and `combined` must be `undefined`
- `betType === "accumulator"` → `legs.length >= 2` and `combined` required
- Each leg needs `avgOdds` and 3-6 bookmakers
- Combined needs avgOdds and 3-6 bookmakers for accumulators
- Rationale must be 1-3 sentences (English)

## Scripts

### Data Management

```bash
# Ingest daily tips from file
npm run ingest data/daily/2025-08-31.json
npm run ingest -- --overwrite data/daily/2025-08-31.json

# Generate seed data
npm run seed -- --days=7
npm run seed -- --days=30 --overwrite

# Migrate v1 to v2 format  
npm run migrate:v2
npm run migrate:v2 -- --overwrite
```

### Development

```bash
# Start dev server
npm run dev

# Build for production
npm run build

# Type checking
npm run type-check

# Linting
npm run lint
```

## API Endpoints

### GET /api/tips/latest
Returns the latest daily tips in v2 format.

### GET /api/tips/by-date?date=YYYY-MM-DD
Returns tips for a specific date.

### GET /api/tips/export?format=csv
Exports tips in flattened CSV format:
- One row per leg
- Additional summary row for accumulators with combined odds
- Columns: `dateISO`, `tipId`, `betType`, `risk`, `legIndex`, `sport`, `league`, `eventName`, `market`, `selection`, `legAvgOdds`, `legBookmakersJSON`, `combinedAvgOdds`, `combinedBookmakersJSON`, `result`

### GET /api/tips/export?format=json
Returns filtered tips in JSON format.

## File Structure

```
src/
├── app/                    # Next.js app router
├── components/             # React components
├── lib/                   # Utilities and data layer
│   ├── types.ts          # TypeScript definitions
│   ├── schemas.ts        # Zod validation schemas
│   └── data.ts           # Data access layer
├── scripts/               # CLI utilities
│   ├── addDailyTips.ts   # Data ingestion
│   ├── seedData.ts       # Generate sample data
│   └── migrateV1toV2.ts  # Migration script
data/daily/                # Tips data storage
samples/                   # Example data files
```

## Migration from V1

Use the migration script to convert existing v1 data:

```bash
npm run migrate:v2
```

This will:
- Convert single selections to legs array
- Move odds to leg.avgOdds
- Generate synthetic bookmaker prices
- Set betType="single" for old tips
- Create backups with .v1.json extension

## Contributing

1. Follow TypeScript strict mode
2. Use Zod schemas for validation
3. Maintain the v2 leg-based data structure
4. Test with both single bets and accumulators
5. Ensure CSV export flattening works correctly

## License

MIT License
