import { Zap, Sun, Moon } from "lucide-react";
import { useTheme } from "@/hooks/useTheme";
import { useCommandBarMetrics } from "@/hooks/useCommandBarMetrics";

function compactCurrency(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(1)}K`;
  return `$${n.toLocaleString()}`;
}

function compact(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toLocaleString();
}

export default function CommandBar() {
  const { theme, toggle } = useTheme();
  const m = useCommandBarMetrics();

  const dateLabel = new Date().toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });

  const pct = Math.min(100, Math.max(0, (m.pipelineFunded / m.pipelineGoal) * 100));

  const pills = [
    { label: "Emails Today", value: compact(m.emailsToday), tone: "info" },
    { label: "SMS Today",    value: compact(m.smsToday),    tone: "council" },
    { label: "Active Deals", value: compact(m.activeDeals), tone: "warning" },
    { label: "Funded MTD",   value: compactCurrency(m.fundedMTD), tone: "success" },
  ] as const;

  return (
    <div className="sticky top-0 z-30 bg-surface-1/95 backdrop-blur border-b border-hairline">
      <div className="h-[52px] flex items-center gap-3 px-3 sm:px-5">
        {/* Brand */}
        <div className="flex items-center gap-2 shrink-0">
          <Zap className="w-[18px] h-[18px] text-primary" strokeWidth={2.5} />
          <span className="font-bold text-[13px] sm:text-sm tracking-[0.22em] text-foreground whitespace-nowrap">
            DOGZ&nbsp;TERMINAL
          </span>
        </div>

        {/* Metric pills */}
        <div className="flex-1 hidden md:flex items-center justify-center gap-2 lg:gap-3 overflow-x-auto">
          {pills.map((p) => (
            <MetricPill key={p.label} {...p} />
          ))}
        </div>

        {/* Right cluster */}
        <div className="ml-auto flex items-center gap-3 shrink-0">
          <span className="hidden sm:inline text-[11px] font-mono text-muted-foreground nums">{dateLabel}</span>
          <div className="hidden sm:flex items-center gap-2 pill pill-success">
            <span className="live-dot" />
            <span>SYSTEMS ACTIVE</span>
          </div>
          <button
            onClick={toggle}
            aria-label="Toggle theme"
            className="w-9 h-9 rounded-lg hover:bg-surface-2 flex items-center justify-center text-muted-foreground"
          >
            {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Mobile pills row */}
      <div className="md:hidden flex items-center gap-2 px-3 pb-2 overflow-x-auto">
        {pills.map((p) => (
          <MetricPill key={p.label} {...p} />
        ))}
      </div>

      {/* Pipeline goal bar */}
      <div className="relative h-[6px] bg-surface-2">
        <div
          className="h-full bg-gradient-to-r from-primary/80 to-primary transition-[width] duration-700 ease-out"
          style={{ width: `${pct}%` }}
        />
        <div className="absolute right-3 -top-[2px] translate-y-[-100%] text-[10px] font-mono text-muted-foreground nums whitespace-nowrap pointer-events-none">
          <span className="text-primary font-semibold">{compactCurrency(m.pipelineFunded)}</span>
          <span className="opacity-60"> / {compactCurrency(m.pipelineGoal)}</span>
        </div>
      </div>
    </div>
  );
}

function MetricPill({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: "info" | "council" | "warning" | "success";
}) {
  const toneCls =
    tone === "info"    ? "text-info"    :
    tone === "council" ? "text-council" :
    tone === "warning" ? "text-warning" : "text-primary";

  return (
    <div className="flex items-center gap-2 h-9 px-3 rounded-full bg-surface-2/70 border border-hairline whitespace-nowrap">
      <span className={`text-sm font-semibold font-mono nums ${toneCls}`}>{value}</span>
      <span className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</span>
    </div>
  );
}
