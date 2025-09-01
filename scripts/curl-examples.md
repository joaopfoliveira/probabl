# API Endpoints Testing Examples

## Overview

Two new POST endpoints have been created for managing betting tips:

1. **`POST /api/tips/create`** - Create or update daily tips
2. **`POST /api/tips/update-result`** - Update individual tip results

## 1. Create Daily Tips

Creates a new daily tips file or replaces an existing one.

### Endpoint
```bash
POST http://localhost:3000/api/tips/create
```

### Example Request
```bash
curl -X POST http://localhost:3000/api/tips/create \
  -H "Content-Type: application/json" \
  -d '{
    "version": 2,
    "dateISO": "2025-09-02",
    "generatedAt": "2025-09-02T10:00:00.000Z",
    "generatedBy": "admin",
    "tips": [
      {
        "id": "tip-001",
        "betType": "single",
        "risk": "safe",
        "legs": [
          {
            "sport": "football",
            "league": "Premier League",
            "event": {
              "name": "Arsenal vs Chelsea",
              "home": "Arsenal",
              "away": "Chelsea"
            },
            "market": "Match Result",
            "selection": "Arsenal Win",
            "avgOdds": 2.10,
            "bookmakers": [
              { "name": "Bet365", "odds": 2.10 },
              { "name": "Betfair", "odds": 2.05 },
              { "name": "William Hill", "odds": 2.15 }
            ]
          }
        ],
        "rationale": "Arsenal has strong home form and Chelsea is missing key players.",
        "result": "pending"
      }
    ]
  }'
```

### Success Response (201)
```json
{
  "success": true,
  "message": "Daily tips for 2025-09-02 created successfully",
  "data": {
    "date": "2025-09-02",
    "tipsCount": 1,
    "filePath": "data/daily/2025-09-02.json"
  }
}
```

## 2. Update Tip Result

Updates the result of a specific tip from "pending" to "won" or "loss".

### Endpoint
```bash
POST http://localhost:3000/api/tips/update-result
```

### Example Request (with date)
```bash
curl -X POST http://localhost:3000/api/tips/update-result \
  -H "Content-Type: application/json" \
  -d '{
    "tipId": "tip-001",
    "result": "win",
    "date": "2025-09-02"
  }'
```

### Example Request (search all files)
```bash
curl -X POST http://localhost:3000/api/tips/update-result \
  -H "Content-Type: application/json" \
  -d '{
    "tipId": "tip-001",
    "result": "loss"
  }'
```

### Success Response (200)
```json
{
  "success": true,
  "message": "Tip 'tip-001' result updated to 'win'",
  "data": {
    "tipId": "tip-001",
    "previousResult": "pending",
    "newResult": "win",
    "file": "2025-09-02.json",
    "date": "2025-09-02"
  }
}
```

## 3. Get API Documentation

Both endpoints also support GET requests for documentation.

### Get Create Endpoint Documentation
```bash
curl http://localhost:3000/api/tips/create
```

### Get Update Endpoint Documentation
```bash
curl http://localhost:3000/api/tips/update-result
```

## 4. Complete Example Workflow

### Step 1: Create daily tips
```bash
curl -X POST http://localhost:3000/api/tips/create \
  -H "Content-Type: application/json" \
  -d '{
    "version": 2,
    "dateISO": "2025-09-02",
    "generatedAt": "2025-09-02T10:00:00.000Z",
    "generatedBy": "system",
    "tips": [
      {
        "id": "tip-001",
        "betType": "single",
        "risk": "safe",
        "legs": [
          {
            "sport": "football",
            "league": "Premier League",
            "event": { "name": "Arsenal vs Chelsea", "home": "Arsenal", "away": "Chelsea" },
            "market": "Match Result",
            "selection": "Arsenal Win",
            "avgOdds": 2.10,
            "bookmakers": [
              { "name": "Bet365", "odds": 2.10 }
            ]
          }
        ],
        "rationale": "Arsenal strong at home, Chelsea missing key players.",
        "result": "pending"
      },
      {
        "id": "tip-002",
        "betType": "single",
        "risk": "medium",
        "legs": [
          {
            "sport": "tennis",
            "league": "US Open",
            "event": { "name": "Djokovic vs Federer", "home": "Djokovic", "away": "Federer" },
            "market": "Match Winner",
            "selection": "Djokovic",
            "avgOdds": 1.85,
            "bookmakers": [
              { "name": "Bet365", "odds": 1.85 }
            ]
          }
        ],
        "rationale": "Djokovic in excellent form, Federer struggling with injuries.",
        "result": "pending"
      }
    ]
  }'
```

### Step 2: Update tip results
```bash
# Update first tip to win
curl -X POST http://localhost:3000/api/tips/update-result \
  -H "Content-Type: application/json" \
  -d '{"tipId": "tip-001", "result": "win"}'

# Update second tip to loss  
curl -X POST http://localhost:3000/api/tips/update-result \
  -H "Content-Type: application/json" \
  -d '{"tipId": "tip-002", "result": "loss"}'
```

### Step 3: Check the results
Visit your app at `http://localhost:3000/today` and `http://localhost:3000/history` to see the updated tip results.

## Error Responses

### 400 - Bad Request
```json
{
  "success": false,
  "error": "Validation failed",
  "details": [
    {
      "code": "invalid_type",
      "expected": "string",
      "received": "undefined",
      "path": ["tipId"],
      "message": "Required"
    }
  ]
}
```

### 404 - Not Found (Update endpoint)
```json
{
  "success": false,
  "error": "Tip with ID 'tip-999' not found"
}
```

### 500 - Server Error
```json
{
  "success": false,
  "error": "Internal server error"
}
```

## Notes

- The create endpoint will **overwrite** existing files for the same date
- The update endpoint searches all daily files if no date is provided
- All data is validated against the existing Zod schemas
- Files are created in `data/daily/YYYY-MM-DD.json` format
- Changes are immediately reflected in the frontend (refresh pages to see updates)
