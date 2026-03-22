// ============================================================
// SEO Keyword Trend Analyzer — core logic (browser-side)
// ============================================================

export interface KeywordResult {
  keyword: string;
  trendScore: number;
  traffic: string;
}

// ---- Google Autocomplete ----------------------------------------
export async function getSuggestions(keyword: string): Promise<string[]> {
  try {
    const url = `https://suggestqueries.google.com/complete/search?client=firefox&q=${encodeURIComponent(keyword)}`;
    const res = await fetch(url);
    if (!res.ok) return [];
    const data = await res.json();
    return (data[1] as string[]) ?? [];
  } catch {
    return [];
  }
}

// ---- Google Trends daily trends ---------------------------------
function parseTraffic(raw: string): number {
  if (!raw) return 0;
  const cleaned = raw.replace(/[+,]/g, "").trim();
  const num = Number.parseFloat(cleaned);
  if (Number.isNaN(num)) return 0;
  if (cleaned.endsWith("M")) return num * 1000;
  if (cleaned.endsWith("K")) return num;
  return num / 1000;
}

export async function getTrendScore(
  keyword: string,
  geo: string,
): Promise<{ score: number; traffic: string }> {
  try {
    const url = `https://trends.google.com/trends/api/dailytrends?hl=en-US&tz=360&geo=${encodeURIComponent(geo)}&ns=15`;
    const res = await fetch(url);
    if (!res.ok) return { score: 0, traffic: "—" };
    const text = await res.text();
    const jsonStr = text.replace(/^\)\]\}'\n/, "");
    const data = JSON.parse(jsonStr);
    const days: any[] = data?.default?.trendingSearchesDays ?? [];
    const searches: any[] = days[0]?.trendingSearches ?? [];

    const kwLower = keyword.toLowerCase();
    for (const s of searches) {
      const title: string = (s?.title?.query ?? "").toLowerCase();
      if (title.includes(kwLower) || kwLower.includes(title)) {
        const raw: string = s?.formattedTraffic ?? "0";
        return { score: parseTraffic(raw), traffic: raw };
      }
    }
    return { score: 0, traffic: "—" };
  } catch {
    return { score: 0, traffic: "—" };
  }
}

// ---- sleep helper -----------------------------------------------
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

// ---- Expand keywords via autocomplete ---------------------------
export async function expandKeywords(
  seeds: string[],
  onProgress: (done: number, total: number) => void,
): Promise<string[]> {
  const all = new Set<string>(seeds);
  for (let i = 0; i < seeds.length; i++) {
    const suggestions = await getSuggestions(seeds[i]);
    for (const s of suggestions) {
      all.add(s);
    }
    onProgress(i + 1, seeds.length);
    await sleep(500);
  }
  return Array.from(all);
}

// ---- Full analysis pipeline ------------------------------------
export interface AnalysisProgress {
  phase: "expanding" | "fetching" | "finalizing" | "done";
  percent: number;
  currentKeyword?: string;
}

export async function runAnalysis(
  seeds: string[],
  geo: string,
  onProgress: (p: AnalysisProgress) => void,
): Promise<KeywordResult[]> {
  onProgress({ phase: "expanding", percent: 5 });
  const expanded = await expandKeywords(seeds, (done, total) => {
    onProgress({
      phase: "expanding",
      percent: Math.round(5 + (done / total) * 30),
    });
  });

  const results: KeywordResult[] = [];
  for (let i = 0; i < expanded.length; i++) {
    const kw = expanded[i];
    onProgress({
      phase: "fetching",
      percent: Math.round(35 + (i / expanded.length) * 55),
      currentKeyword: kw,
    });
    const { score, traffic } = await getTrendScore(kw, geo);
    results.push({ keyword: kw, trendScore: score, traffic });
    await sleep(300);
  }

  onProgress({ phase: "finalizing", percent: 95 });
  await sleep(300);

  results.sort((a, b) => b.trendScore - a.trendScore);
  onProgress({ phase: "done", percent: 100 });
  return results;
}

// ---- CSV export -------------------------------------------------
export function exportCsv(results: KeywordResult[]) {
  const header = "rank,keyword,trend_score,traffic";
  const rows = results.map(
    (r, i) =>
      `${i + 1},"${r.keyword.replace(/"/g, '""')}",${r.trendScore},"${r.traffic}"`,
  );
  const csv = [header, ...rows].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "seo_trends.csv";
  a.click();
  URL.revokeObjectURL(url);
}
