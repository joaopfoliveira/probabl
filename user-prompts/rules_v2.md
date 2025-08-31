Por favor, gera 3 sugestões de apostas para hoje seguindo EXATAMENTE esta estrutura JSON V2:

**REGRAS OBRIGATÓRIAS:**
- Versão 2 com estrutura leg-based
- 3 tips: 1 safe (single), 1 medium (single OU accumulator), 1 high (accumulator)
- Single bet: betType="single", legs.length=1, combined=undefined
- Accumulator: betType="accumulator", legs.length>=2, combined obrigatório
- Cada leg deve ter apenas odds da betclic
- Rationale: máximo 5 frases (cuidado com números decimais como 1.90)
- IDs em kebab-case (ex: "arsenal-vs-liverpool-1x2")
- generatedBy deve ser exatamente "chatgpt"
- tudo em ingles
- apenas as principais ligas/competiçoes de cada desporto
- apenas equipas da europa ou estados unidos 
- femininos apenas em tenis
- minimo de odd deverá ser 1.20 exceto se for em accumulators, ai o minimo pode ser 1.10.

**ESTRUTURA JSON:**

{
"version": 2,
"dateISO": "2025-01-XX",
"generatedAt": "2025-01-XXTXX:XX:XX.000Z",
"generatedBy": "chatgpt",
"tips": [
{
"id": "exemplo-single-safe",
"betType": "single",
"risk": "safe",
"legs": [
{
"legId": "opcional-id",
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
{ "name": "betclic", "odds": 2.25, "url": "https://www.bet365.com" }
]
}
],
"rationale": "Análise curta em inglês. Máximo 3 frases.",
"result": "pending"
},
{
"id": "exemplo-accumulator-high",
"betType": "accumulator",
"risk": "high",
"legs": [
{
"legId": "leg-1",
"sport": "Football",
"league": "Premier League",
"event": { "home": "Team A", "away": "Team B", "name": "Team A vs Team B" },
"market": "Both Teams To Score",
"selection": "Yes",
"avgOdds": 1.75,
"bookmakers": [
{ "name": "betclic", "odds": 1.72 }
]
},
{
"legId": "leg-2",
"sport": "Football",
"league": "Championship",
"event": { "home": "Team C", "away": "Team D", "name": "Team C vs Team D" },
"market": "Over/Under Goals",
"selection": "Over 2.5",
"avgOdds": 1.90,
"bookmakers": [
{ "name": "betclic", "odds": 1.88 }
]
}
],
"combined": {
"avgOdds": 3.33,
"bookmakers": [
{ "name": "betclic", "odds": 3.23 }
]
},
"rationale": "Análise do accumulator em inglês. Máximo 3 frases.",
"result": "pending"
}
],
"seo": {
"title": "Today's AI Betting Picks — Singles & Accas",
"description": "Daily AI-generated betting tips with analysis and odds."
}
}

Gera dados reais para apostas de hoje seguindo esta estrutura EXATA.