Generate today’s betting tips in the agreed leg-based JSON tipday format (version 2).

Rules:
- Return exactly one code block with valid JSON, nothing else.
- Root fields: version=2, dateISO (today in Europe/Lisbon), generatedAt (ISO timestamp), generatedBy="chatgpt".
- Provide exactly three tips in order: safe, medium, high risk.
- Tips may be SINGLE or MULTIPLE (ACCUMULATOR). You may mix sports and leagues; pick the best value.
- Schema:
- TipItem: { id, betType: "single"|"accumulator", risk, legs[], combined?, rationale, result="pending" }
- Leg: { legId, sport, league?, event{home?,away?,name?}, market, selection, avgOdds, bookmakers[] }
- Combined (required if accumulator): { avgOdds, bookmakers[] }
- BookmakerPrice: { name, odds, url }
- IMPORTANT — Bookmakers:
- Use ONLY these names (title case): "Betclic", "Betano", "Bwin", "Pinnacle", "Unibet".
- Provide 3–5 entries per leg and for combined, drawing from that list.
- Include realistic decimal odds and a valid URL for each:
- Betclic → url of the event in the bookmaker or https://www.betclic.com
- Odds must be real, validated at each bookmaker the time the query is made. Rationale in English (2–5 sentences, no profit guarantees).
- Wrap output with:
```json tipday
...JSON...
