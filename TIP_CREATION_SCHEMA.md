# 📋 Tip Creation Schema Guide

## 🎯 Overview

Your betting tips system uses a **V2 Leg-based Contract** for creating tips. Here's everything you need to know to create tips manually.

## 🚀 API Endpoints

### Create Tips
```
POST /api/tips/create
Content-Type: application/json
```

### Update Results
```
POST /api/tips/update-result
Content-Type: application/json
```

## 📊 Complete Schema Structure

### DailyTipsPayload (Main Container)

```typescript
{
  "version": 2,                    // Always 2 for V2 format
  "dateISO": "2025-09-04",        // YYYY-MM-DD format
  "generatedAt": "2025-09-04T14:30:00.000Z", // ISO timestamp
  "generatedBy": "manual",        // Your identifier
  "tips": [                       // Array of 1-10 tips
    // ... tip objects (see below)
  ],
  "seo": {                        // Optional SEO metadata
    "title": "Daily Betting Tips for September 4, 2025",
    "description": "Expert betting tips with detailed analysis"
  }
}
```

### TipItem Structure

#### Single Bet Example
```json
{
  "id": "safe-manchester-united-001",
  "betType": "single",
  "risk": "safe",
  "legs": [
    {
      "sport": "Football",
      "league": "Premier League",
      "event": {
        "home": "Manchester United",
        "away": "Liverpool",
        "name": "Manchester United vs Liverpool",
        "scheduledAt": "2025-09-07T15:00:00.000Z",
        "timezone": "Europe/London"
      },
      "market": "Match Result",
      "selection": "Manchester United to Win",
      "avgOdds": 2.10,
      "bookmakers": [
        {
          "name": "bet365",
          "odds": 2.05
        },
        {
          "name": "Betfair", 
          "odds": 2.15
        },
        {
          "name": "Unibet",
          "odds": 2.10
        }
      ]
    }
  ],
  "rationale": "Manchester United has been in excellent form at home, winning their last 5 matches. Liverpool is missing key players due to injuries.",
  "result": "pending"
}
```

#### Accumulator Bet Example
```json
{
  "id": "medium-football-acca-001",
  "betType": "accumulator",
  "risk": "medium",
  "legs": [
    {
      "sport": "Football",
      "league": "Premier League",
      "event": {
        "home": "Arsenal",
        "away": "Chelsea", 
        "name": "Arsenal vs Chelsea",
        "scheduledAt": "2025-09-07T17:30:00.000Z",
        "timezone": "Europe/London"
      },
      "market": "Match Result",
      "selection": "Arsenal to Win",
      "avgOdds": 1.75,
      "bookmakers": [
        {
          "name": "bet365",
          "odds": 1.73
        },
        {
          "name": "Betfair",
          "odds": 1.77
        }
      ]
    },
    {
      "sport": "Football", 
      "league": "La Liga",
      "event": {
        "home": "Real Madrid",
        "away": "Barcelona",
        "name": "Real Madrid vs Barcelona",
        "scheduledAt": "2025-09-07T20:00:00.000Z",
        "timezone": "Europe/Madrid"
      },
      "market": "Match Result",
      "selection": "Real Madrid to Win",
      "avgOdds": 1.90,
      "bookmakers": [
        {
          "name": "bet365",
          "odds": 1.85
        },
        {
          "name": "Betfair",
          "odds": 1.95
        }
      ]
    }
  ],
  "combined": {
    "avgOdds": 3.33,
    "bookmakers": [
      {
        "name": "bet365",
        "odds": 3.20
      },
      {
        "name": "Betfair",
        "odds": 3.45
      }
    ]
  },
  "rationale": "Both teams are strong at home. Arsenal has been defensively solid while Real Madrid has dominated El Clasico recently.",
  "result": "pending"
}
```

## 📝 Field Requirements

### Required Fields

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Unique kebab-case identifier |
| `betType` | "single" \| "accumulator" | Type of bet |
| `risk` | "safe" \| "medium" \| "high" | Risk level |
| `legs` | array | At least 1 leg (single) or 2+ (accumulator) |
| `rationale` | string | 1-1000 characters explaining the tip |

### Event Fields

| Field | Type | Description |
|-------|------|-------------|
| `name` | string | Event name (e.g., "Arsenal vs Chelsea") |
| `scheduledAt` | string | ISO datetime (must be future, max 30 days) |
| `home` | string? | Home team (optional for 1v1 sports) |
| `away` | string? | Away team (optional) |
| `timezone` | string? | Event timezone (e.g., "Europe/London") |

### Validation Rules

- **Event Date**: Must be between now and 30 days in the future
- **Odds Range**: Between 1.01 and 1000
- **Bookmakers**: 1-6 bookmakers per leg/combined
- **ID Format**: Must be kebab-case (lowercase, hyphens only)
- **Accumulator**: Must have `combined` odds object
- **Single**: Must NOT have `combined` odds

## 🎯 Risk Level Guidelines

- **Safe**: Low-risk bets (odds typically 1.2-1.8)
- **Medium**: Moderate risk (odds typically 1.8-3.0)  
- **High**: Higher risk, higher reward (odds typically 3.0+)

## 🏆 Popular Sports & Markets

### Football
- Markets: "Match Result", "Over/Under 2.5", "Both Teams to Score"
- Leagues: "Premier League", "La Liga", "Serie A", "Bundesliga"

### Tennis  
- Markets: "Match Winner", "Set Betting", "Total Games"
- Tournaments: "ATP", "WTA", "Grand Slam"

### Basketball
- Markets: "Match Winner", "Point Spread", "Total Points"
- Leagues: "NBA", "EuroLeague"

## 🔧 Admin Panel Usage

1. **Access**: http://localhost:3000/admin (password protected)
2. **Upload JSON**: Drag & drop your JSON file
3. **Manual Form**: Fill out the form fields
4. **Update Results**: Change pending tips to win/loss/void

## 🚀 API Usage Examples

### Create Tips via API
```bash
curl -X POST http://localhost:3000/api/tips/create \
  -H "Content-Type: application/json" \
  -d @your-tips.json
```

### Update Result
```bash
curl -X POST http://localhost:3000/api/tips/update-result \
  -H "Content-Type: application/json" \
  -d '{
    "dateISO": "2025-09-04",
    "tipId": "safe-manchester-united-001", 
    "result": "win"
  }'
```

## ✅ Best Practices

1. **Use realistic odds** from actual bookmakers
2. **Schedule events properly** (check real fixture dates)
3. **Write clear rationales** explaining your reasoning
4. **Mix sports and markets** for variety
5. **Update results promptly** after events conclude
6. **Use consistent naming** for teams and leagues

## 🎉 You're All Set!

Your manual tip creation system is ready to use. You can create tips through the admin panel at http://localhost:3000/admin or via the API endpoints.
