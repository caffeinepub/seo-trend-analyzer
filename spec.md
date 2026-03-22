# SEO Keyword Trend Analyzer

## Current State
New project. No existing code.

## Requested Changes (Diff)

### Add
- App that lets users enter a list of seed keywords and a geo code (default: RS)
- Keyword expansion: for each seed keyword, fetch Google Autocomplete suggestions and merge into full list
- Trend analysis: for each expanded keyword, fetch Google Trends interest score (7-day window) via HTTP outcall
- Results displayed in a sortable table: keyword, trend score, sorted descending
- Download/export results as CSV
- Progress indicator while fetching (can take time)

### Modify
N/A

### Remove
N/A

## Implementation Plan
1. Backend (Motoko + http-outcalls):
   - `getAutocompleteSuggestions(keyword: Text, geo: Text) -> async [Text]`: calls https://suggestqueries.google.com/complete/search?client=firefox&q={keyword}&hl={geo}
   - `getTrendScore(keyword: Text, geo: Text) -> async Float`: calls Google Trends API (https://trends.google.com/trends/api/explore and widgetdata endpoint) to get 7-day interest score, returns mean
   - `expandAndAnalyze(keywords: [Text], geo: Text) -> async [{ keyword: Text; trendScore: Float }]`: orchestrates expansion + scoring, returns sorted results

2. Frontend:
   - Keyword input: textarea for seed keywords (one per line)
   - Geo input: text field (default RS)
   - Run button that calls expandAndAnalyze
   - Progress/loading state during fetch
   - Results table sorted by trend score desc
   - CSV export button
