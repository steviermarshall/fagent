import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface SheetRow {
  id: string;
  sheet_name: string | null;
  sheet_id: string | null;
  type: string | null;
  current_row: number | null;
  total_rows: number | null;
  status: string | null;
  last_run_at: string | null;
  last_run_sent: number | null;
  last_run_failed: number | null;
  last_subject: string | null;
  sequences: Record<string, unknown> | null;
}

const TYPE_CONFIG: Record<string, { icon: string; label: string; bg: string; text: string; border: string }> = {
  email:       { icon: "📧",   label: "Email",     bg: "bg-blue-500/10",   text: "text-blue-400",   border: "border-blue-500/30"   },
  sms:         { icon: "💬",   label: "SMS",       bg: "bg-green-500/10",  text: "text-green-400",  border: "border-green-500/30"  },
  "email+sms": { icon: "📧💬", label: "Email+SMS", bg: "bg-teal-500/10",   text: "text-teal-400",   border: "border-teal-500/30"   },
  crm:         { icon: "👥",   label: "CRM",       bg: "bg-purple-500/10", text: "text-purple-400", border: "border-purple-500/30" },
  pipeline:    { icon: "💰",   label: "Pipeline",  bg: "bg-yellow-500/10", text: "text-yellow-400", border: "border-yellow-500/30" },
};

const STATUS_CONFIG: Record<string, { label: string; dot: string; pill: string }> = {
  idle:   { label: "Idle",   dot: "bg-gray-500",  pill: "bg-gray-800 text-gray-400 border-gray-700"       },
  active: { label: "Active", dot: "bg-green-500", pill: "bg-green-950 text-green-300 border-green-700/60" },
  done:   { label: "Done",   dot: "bg-blue-500",  pill: "bg-blue-950  text-blue-300  border-blue-700/60"  },
};

function fmtTime(iso: string | null): string {
  if (!iso) return "Never";
  const d = new Date(iso);
  const diffMin = Math.floor((Date.now() - d.getTime()) / 60000);
  if (diffMin < 1)  return "just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  const h = Math.floor(diffMin / 60);
  if (h < 24) return `${h}h ago`;
  if (h < 48) return "Yesterday";
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function fmtNum(n: number | null): string {
  if (!n) return "0";
  return n.toLocaleString();
}

function pct(current: number | null, total: number | null): number {
  if (!total || !current) return 0;
  return Math.min(100, Math.round((current / total) * 100));
}

function StatCard({ value, label, color }: { value: string | number; label: string; color: string }) {
  return (
    <div className="rounded-lg border border-white/5 bg-white/[0.02] px-3 py-2.5 flex flex-col">
      <div className={`text-lg font-bold tabular-nums ${color}`}>{value}</div>
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground mt-0.5">{label}</div>
    </div>
  );
}

function TypeBadge({ type }: { type: string | null }) {
  const cfg = TYPE_CONFIG[type ?? ""] ?? TYPE_CONFIG.crm;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium border ${cfg.bg} ${cfg.text} ${cfg.border}`}>
      <span>{cfg.icon}</span><span>{cfg.label}</span>
    </span>
  );
}

function StatusPill({ status }: { status: string | null }) {
  const cfg = STATUS_CONFIG[status ?? "idle"] ?? STATUS_CONFIG.idle;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-medium border ${cfg.pill}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot} ${status === "active" ? "animate-pulse" : ""}`} />
      {cfg.label}
    </span>
  );
}

function ProgressBar({ current, total, color }: { current: number | null; total: number | null; color: string }) {
  const p = pct(current, total);
  return (
    <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
      <div className={`h-full ${color} transition-all duration-500`} style={{ width: `${p}%` }} />
    </div>
  );
}

function SequencePill({ label, sent, lastDate }: { label: string; sent: number; lastDate?: string }) {
  const hasData = sent > 0;
  return (
    <div className={`rounded-md border px-2 py-1.5 flex flex-col gap-0.5 min-w-0 ${hasData ? "border-white/10 bg-white/[0.03]" : "border-white/5 bg-white/[0.01] opacity-60"}`}>
      <div className="text-[9px] uppercase tracking-wider text-muted-foreground truncate">{label}</div>
      <div className="text-xs font-semibold tabular-nums text-foreground">{sent.toLocaleString()}</div>
      {lastDate && hasData && <div className="text-[9px] text-muted-foreground/70 truncate">{lastDate}</div>}
    </div>
  );
}

function SheetCard({ row }: { row: SheetRow }) {
  const [open, setOpen] = useState(false);
  const p = pct(row.current_row, row.total_rows);
  const seqEntries = Object.entries(row.sequences ?? {}).filter(([k]) => k !== "mobile_tab" && k !== "mobile_rows");
  const barColor =
    row.type === "sms"   ? "bg-gradient-to-r from-green-500 to-emerald-400" :
    row.type === "email" ? "bg-gradient-to-r from-blue-500 to-cyan-400" :
                           "bg-gradient-to-r from-purple-500 to-pink-400";
  const remaining = (row.total_rows ?? 0) - (row.current_row ?? 0);
  const isActive = row.status === "active";

  return (
    <div className={`rounded-xl border bg-white/[0.02] overflow-hidden transition-all hover:bg-white/[0.04] ${isActive ? "border-green-500/30 shadow-[0_0_20px_rgba(34,197,94,0.08)]" : "border-white/8"}`}>
      <div className="px-4 sm:px-5 pt-4 pb-3 flex flex-col sm:flex-row items-start justify-between gap-3">
        <div className="flex items-center flex-wrap gap-2.5 min-w-0 flex-1">
          <TypeBadge type={row.type} />
          <StatusPill status={row.status} />
          <h3 className="text-sm font-semibold text-foreground truncate flex items-center gap-1.5">
            <span className="truncate">{row.sheet_name}</span>
            <span className="text-muted-foreground/40 text-xs">↗</span>
          </h3>
        </div>
        {(row.total_rows ?? 0) > 0 && (
          <div className="shrink-0 flex flex-col items-end">
            <div className={`text-xl font-bold tabular-nums ${p >= 80 ? "text-green-400" : p >= 40 ? "text-blue-400" : "text-muted-foreground"}`}>{p}%</div>
            <div className="text-[9px] uppercase tracking-wider text-muted-foreground">done</div>
          </div>
        )}
      </div>

      <div className="px-4 sm:px-5 pb-3 space-y-2">
        <div className="flex items-baseline justify-between text-xs">
          <div className="text-muted-foreground">
            <span className="font-semibold text-foreground tabular-nums">{fmtNum(row.current_row)}</span>
            <span className="text-muted-foreground/60"> / {fmtNum(row.total_rows)} contacts</span>
          </div>
          {remaining > 0 && <div className="text-[10px] text-muted-foreground tabular-nums">{remaining.toLocaleString()} left</div>}
        </div>
        <ProgressBar current={row.current_row} total={row.total_rows} color={barColor} />
      </div>

      {seqEntries.length > 0 && (
        <div className="px-4 sm:px-5 pb-3">
          <div className="text-[9px] uppercase tracking-wider text-muted-foreground mb-1.5">Sequences</div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-1.5">
            {seqEntries.map(([seq, data]) => {
              const d = (data ?? {}) as { sent?: number; last_date?: string };
              return <SequencePill key={seq} label={seq} sent={d.sent || 0} lastDate={d.last_date} />;
            })}
          </div>
        </div>
      )}

      <div className="px-4 sm:px-5 py-2.5 border-t border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-[11px] bg-white/[0.01]">
        <span className="text-muted-foreground">Last run: <span className="text-foreground/70">{fmtTime(row.last_run_at)}</span></span>
        <div className="flex items-center gap-2.5">
          {(row.last_run_sent ?? 0) > 0 && <span className="text-green-400 tabular-nums">✓ {fmtNum(row.last_run_sent)} sent</span>}
          {(row.last_run_failed ?? 0) > 0 && <span className="text-red-400 tabular-nums">✕ {fmtNum(row.last_run_failed)} failed</span>}
          {!(row.last_run_sent) && !(row.last_run_failed) && <span className="text-muted-foreground/50">No runs yet</span>}
        </div>
      </div>

      {row.last_subject && (
        <button
          onClick={() => setOpen(!open)}
          className="w-full flex items-center justify-between px-4 sm:px-5 py-2 border-t border-white/5 text-[11px] text-muted-foreground hover:text-foreground/70 transition-colors bg-white/[0.02] hover:bg-white/5"
        >
          <span className={`text-left ${open ? "" : "truncate"} flex-1 mr-2`}>
            {open ? row.last_subject : `Subject: ${row.last_subject}`}
          </span>
          <span className="shrink-0">{open ? "▲" : "▼"}</span>
        </button>
      )}
    </div>
  );
}

type FilterType = "all" | "email" | "sms" | "crm" | "pipeline";

export default function SheetsTab() {
  const [rows, setRows] = useState<SheetRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>("all");

  useEffect(() => {
    supabase.from("sheet_status").select("*").order("status")
      .then(({ data, error }) => {
        if (error) console.error("SheetsTab error:", error);
        setRows((data as unknown as SheetRow[]) ?? []);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    const ch = supabase.channel("sheet_status_rt_v2")
      .on("postgres_changes", { event: "*", schema: "public", table: "sheet_status" }, (p) => {
        if (p.eventType === "INSERT") setRows(prev => [...prev, p.new as unknown as SheetRow]);
        else if (p.eventType === "UPDATE") setRows(prev => prev.map(r => r.id === (p.new as SheetRow).id ? (p.new as unknown as SheetRow) : r));
        else if (p.eventType === "DELETE") setRows(prev => prev.filter(r => r.id !== (p.old as SheetRow).id));
      })
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, []);

  const filtered = filter === "all" ? rows : rows.filter(r => r.type === filter);
  const totalContacts = rows.reduce((s, r) => s + (r.total_rows ?? 0), 0);
  const totalSent     = rows.reduce((s, r) => s + (r.last_run_sent ?? 0), 0);
  const activeCount   = rows.filter(r => r.status === "active").length;

  const allTabs: { key: FilterType; label: string; count: number }[] = [
    { key: "all",      label: "All",      count: rows.length },
    { key: "email",    label: "Email",    count: rows.filter(r => r.type === "email").length },
    { key: "sms",      label: "SMS",      count: rows.filter(r => r.type === "sms").length },
    { key: "crm",      label: "CRM",      count: rows.filter(r => r.type === "crm").length },
    { key: "pipeline", label: "Pipeline", count: rows.filter(r => r.type === "pipeline").length },
  ];
  const filterTabs = allTabs.filter(t => t.key === "all" || t.count > 0);

  return (
    <div className="glass-card p-4 sm:p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-2xl">📊</span>
          <h2 className="text-lg sm:text-xl font-bold tracking-tight">SHEETS</h2>
        </div>
        <span className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
          <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
          Realtime
        </span>
      </div>

      <div className="grid grid-cols-3 gap-2 mb-4">
        <StatCard value={rows.length} label="Sheets" color="text-foreground" />
        <StatCard value={activeCount} label="Active" color="text-green-400" />
        <StatCard value={totalSent.toLocaleString()} label="Sent" color="text-blue-400" />
      </div>

      {filterTabs.length > 2 && (
        <div className="flex gap-1.5 mb-4 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-hide">
          {filterTabs.map(t => (
            <button
              key={t.key}
              onClick={() => setFilter(t.key)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
                filter === t.key ? "bg-white/10 text-foreground" : "text-muted-foreground hover:text-foreground hover:bg-white/5"
              }`}
            >
              {t.label}
              <span className={`tabular-nums text-[10px] px-1.5 py-0.5 rounded ${filter === t.key ? "bg-white/10" : "bg-white/5"}`}>{t.count}</span>
            </button>
          ))}
        </div>
      )}

      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="w-3 h-3 rounded-full border-2 border-muted-foreground/30 border-t-foreground animate-spin" />
            Loading sheets...
          </div>
        </div>
      )}

      {!loading && filtered.length === 0 && (
        <div className="text-center py-12 text-sm text-muted-foreground">
          No sheets tracked yet.
        </div>
      )}

      <div className="flex flex-col gap-3">
        {filtered.map(row => <SheetCard key={row.id} row={row} />)}
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mt-4 pt-3 border-t border-white/5 text-[10px] text-muted-foreground">
        <span>Updates after each email/SMS run</span>
        <span className="tabular-nums">{rows.length} sheets · {totalContacts.toLocaleString()} total contacts</span>
      </div>
    </div>
  );
}
