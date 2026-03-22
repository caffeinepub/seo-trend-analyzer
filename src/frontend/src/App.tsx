import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Toaster } from "@/components/ui/sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { exportCsv, runAnalysis } from "@/lib/seoAnalyzer";
import type { AnalysisProgress, KeywordResult } from "@/lib/seoAnalyzer";
import {
  AlertCircle,
  BarChart2,
  BookMarked,
  CheckCircle2,
  ChevronRight,
  Download,
  Loader2,
  Search,
  Settings,
  TrendingUp,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";

// ─────────────────────────────────────────────────────────────
// Sidebar
// ─────────────────────────────────────────────────────────────
const NAV_ITEMS = [
  { icon: BarChart2, label: "Dashboard", id: "dashboard" },
  { icon: BookMarked, label: "My Analyses", id: "analyses" },
  { icon: Search, label: "Keyword Tracker", id: "tracker" },
  { icon: Settings, label: "Settings", id: "settings" },
];

function Sidebar({ active }: { active: string }) {
  return (
    <aside
      className="fixed inset-y-0 left-0 z-30 flex w-60 flex-col"
      style={{ background: "oklch(0.21 0.048 243)" }}
    >
      <div className="flex items-center gap-3 px-6 py-6">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
          <TrendingUp className="h-4 w-4 text-primary-foreground" />
        </div>
        <span className="text-sm font-bold leading-tight text-sidebar-foreground">
          SEO Trend
          <br />
          <span className="font-semibold opacity-70">Analyzer</span>
        </span>
      </div>

      <div
        className="mx-4 mb-4 h-px"
        style={{ background: "oklch(0.3 0.04 243)" }}
      />

      <nav className="flex flex-col gap-1 px-3">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = active === item.id;
          return (
            <button
              type="button"
              key={item.id}
              data-ocid={`nav.${item.id}.link`}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-primary/20 text-sidebar-foreground"
                  : "text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-foreground"
              }`}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {item.label}
              {isActive && (
                <ChevronRight className="ml-auto h-3.5 w-3.5 opacity-60" />
              )}
            </button>
          );
        })}
      </nav>

      <div
        className="mt-auto px-6 pb-6 text-xs"
        style={{ color: "oklch(0.6 0.02 243)" }}
      >
        <p>© {new Date().getFullYear()}</p>
        <a
          href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="transition-colors hover:text-sidebar-foreground"
        >
          Built with ❤️ caffeine.ai
        </a>
      </div>
    </aside>
  );
}

// ─────────────────────────────────────────────────────────────
// Score Badge
// ─────────────────────────────────────────────────────────────
function ScoreBadge({ score }: { score: number }) {
  if (score > 50) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-semibold text-green-800">
        <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
        {score.toFixed(1)}
      </span>
    );
  }
  if (score >= 10) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-800">
        <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
        {score.toFixed(1)}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-semibold text-gray-500">
      <span className="h-1.5 w-1.5 rounded-full bg-gray-400" />
      {score.toFixed(1)}
    </span>
  );
}

// ─────────────────────────────────────────────────────────────
// Progress Steps
// ─────────────────────────────────────────────────────────────
const STEPS = [
  { id: "expanding", label: "Expanding Keywords" },
  { id: "fetching", label: "Fetching Trends" },
  { id: "finalizing", label: "Finalizing" },
];

function ProgressCard({ progress }: { progress: AnalysisProgress }) {
  const stepIndex = STEPS.findIndex((s) => s.id === progress.phase);
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="border-border shadow-card">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Loader2 className="h-4 w-4 animate-spin text-primary" />
            Analysis in Progress
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2">
            {STEPS.map((step, i) => {
              const done = i < stepIndex;
              const active = i === stepIndex;
              return (
                <div
                  key={step.id}
                  className="flex flex-1 flex-col items-center gap-1.5"
                >
                  <div
                    className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold transition-colors ${
                      done
                        ? "bg-green-500 text-white"
                        : active
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {done ? <CheckCircle2 className="h-4 w-4" /> : i + 1}
                  </div>
                  <span
                    className={`text-center text-[11px] leading-tight ${
                      active
                        ? "font-semibold text-foreground"
                        : "text-muted-foreground"
                    }`}
                  >
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>

          <div data-ocid="analysis.loading_state" className="space-y-1.5">
            <Progress value={progress.percent} className="h-2" />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>
                {progress.currentKeyword
                  ? `Processing: ${progress.currentKeyword}`
                  : "Working…"}
              </span>
              <span>{progress.percent}%</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────
// Main App
// ─────────────────────────────────────────────────────────────
export default function App() {
  const [keywords, setKeywords] = useState(
    "umrlice\npogrebne usluge\nsahrana\numrlice sombor",
  );
  const [geo, setGeo] = useState("RS");
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState<AnalysisProgress | null>(null);
  const [results, setResults] = useState<KeywordResult[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleRun = async () => {
    const seeds = keywords
      .split("\n")
      .map((k) => k.trim())
      .filter(Boolean);

    if (seeds.length === 0) {
      toast.error("Please enter at least one keyword.");
      return;
    }

    setIsRunning(true);
    setError(null);
    setResults(null);
    setProgress({ phase: "expanding", percent: 0 });

    try {
      const data = await runAnalysis(seeds, geo.trim() || "RS", (p) =>
        setProgress(p),
      );
      setResults(data);
      toast.success(`Analysis complete — ${data.length} keywords processed.`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      setError(msg);
      toast.error(`Analysis failed: ${msg}`);
    } finally {
      setIsRunning(false);
      setProgress(null);
    }
  };

  const handleExport = () => {
    if (!results) return;
    exportCsv(results);
    toast.success("CSV exported successfully.");
  };

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar active="dashboard" />
      <Toaster position="top-right" />

      <div className="ml-60 flex flex-1 flex-col">
        {/* Header */}
        <header className="sticky top-0 z-20 flex items-center justify-between border-b border-border bg-card px-8 py-4">
          <div>
            <h1 className="text-xl font-bold text-foreground">
              Keyword Trend Analyzer
            </h1>
            <p className="text-xs text-muted-foreground">
              Serbia &amp; beyond · powered by Google Trends
            </p>
          </div>
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
            U
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 space-y-5 p-8">
          {/* Welcome */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <Card className="border-border bg-gradient-to-r from-primary/10 to-transparent shadow-card">
              <CardContent className="flex items-center gap-4 py-5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/20">
                  <TrendingUp className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">Welcome!</p>
                  <p className="text-sm text-muted-foreground">
                    Analyze keyword trends for Serbia and beyond. Enter your
                    seed keywords, choose a region, and let the analyzer expand
                    and score them automatically.
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Form */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.08 }}
          >
            <Card className="border-border shadow-card">
              <CardHeader className="pb-4">
                <CardTitle className="text-base">
                  New Keyword Trend Analysis
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="keywords">
                    Seed Keywords{" "}
                    <span className="font-normal text-muted-foreground">
                      (one per line)
                    </span>
                  </Label>
                  <Textarea
                    id="keywords"
                    data-ocid="analysis.textarea"
                    className="min-h-[120px] font-mono text-sm"
                    placeholder={"umrlice\npogrebne usluge\nsahrana"}
                    value={keywords}
                    onChange={(e) => setKeywords(e.target.value)}
                    disabled={isRunning}
                  />
                </div>

                <div className="flex flex-wrap items-end gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="geo">Region (ISO code)</Label>
                    <Input
                      id="geo"
                      data-ocid="analysis.input"
                      className="w-28 uppercase"
                      value={geo}
                      onChange={(e) => setGeo(e.target.value.toUpperCase())}
                      maxLength={2}
                      disabled={isRunning}
                      placeholder="RS"
                    />
                  </div>

                  <Button
                    type="button"
                    data-ocid="analysis.submit_button"
                    onClick={handleRun}
                    disabled={isRunning}
                    className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
                  >
                    {isRunning ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Running…
                      </>
                    ) : (
                      <>
                        <Search className="h-4 w-4" />
                        Run Analysis
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Progress */}
          <AnimatePresence>
            {isRunning && progress && <ProgressCard progress={progress} />}
          </AnimatePresence>

          {/* Error */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
              >
                <Card
                  data-ocid="analysis.error_state"
                  className="border-destructive/40 shadow-card"
                >
                  <CardContent className="flex items-start gap-3 py-5">
                    <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-destructive" />
                    <div>
                      <p className="font-semibold text-destructive">
                        Analysis failed
                      </p>
                      <p className="text-sm text-muted-foreground">{error}</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Results */}
          <AnimatePresence>
            {results && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35 }}
                data-ocid="results.card"
              >
                <Card className="border-border shadow-card">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-base">
                          Analysis Results
                        </CardTitle>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {results.length} keywords · sorted by trend score
                        </p>
                      </div>
                      <Button
                        type="button"
                        data-ocid="results.export_button"
                        variant="outline"
                        size="sm"
                        onClick={handleExport}
                        className="gap-2"
                      >
                        <Download className="h-3.5 w-3.5" />
                        Export CSV
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div
                      data-ocid="results.table"
                      className="overflow-hidden rounded-b-lg"
                    >
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-muted/40 hover:bg-muted/40">
                            <TableHead className="w-14 pl-6 text-xs font-semibold text-muted-foreground">
                              Rank
                            </TableHead>
                            <TableHead className="text-xs font-semibold text-muted-foreground">
                              Keyword
                            </TableHead>
                            <TableHead className="text-xs font-semibold text-muted-foreground">
                              Traffic
                            </TableHead>
                            <TableHead className="pr-6 text-right text-xs font-semibold text-muted-foreground">
                              Trend Score
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {results.slice(0, 100).map((row, i) => (
                            <TableRow
                              key={row.keyword}
                              data-ocid={`results.item.${i + 1}`}
                              className="transition-colors hover:bg-muted/30"
                            >
                              <TableCell className="pl-6 text-sm font-medium text-muted-foreground">
                                {i + 1}
                              </TableCell>
                              <TableCell className="font-medium text-foreground">
                                {row.keyword}
                              </TableCell>
                              <TableCell className="text-sm text-muted-foreground">
                                {row.traffic}
                              </TableCell>
                              <TableCell className="pr-6 text-right">
                                <ScoreBadge score={row.trendScore} />
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>

                      {results.length === 0 && (
                        <div
                          data-ocid="results.empty_state"
                          className="py-16 text-center"
                        >
                          <p className="text-muted-foreground">
                            No results found for the given keywords and region.
                          </p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <div className="mt-3 flex flex-wrap gap-2">
                  <Badge variant="outline" className="gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                    High ({results.filter((r) => r.trendScore > 50).length})
                  </Badge>
                  <Badge variant="outline" className="gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                    Medium (
                    {
                      results.filter(
                        (r) => r.trendScore >= 10 && r.trendScore <= 50,
                      ).length
                    }
                    )
                  </Badge>
                  <Badge variant="outline" className="gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-gray-400" />
                    Low ({results.filter((r) => r.trendScore < 10).length})
                  </Badge>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
