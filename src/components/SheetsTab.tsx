import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface SheetRow {
  id: string;
  sheet_name: string;
  sheet_id: string;
  type: "email" | "sms" | "email+sms" | "crm" | "pipeline";
  current_row: number;
  total_rows: number;
  status: "idle" | "active" | "done";
  last_run_at: string | null;
  last_run_sent: number;
  last_run_failed: number;
  sequences: Record<string, unknown>;
}

const TYPE_CONFIG: Record<string, { icon: string; label: string; color: string }> = {
  email:       { icon: "📧",   label: "Email",     color: "text-blue-400"   },
  sms:         { icon: "💬",   label: "SMS",       color: "text-green-400"  },
  "email+sms": { icon: "📧💬", label: "Email+SMS", color: "text-teal-400"   },
  crm:         { icon: "👥",   label: "CRM",       color: "text-purple-400" },
  pipeline:    { icon: "💰",   label: "Pipeline",  color: "text-yellow-400" },
};

const STATUS_CONFIG: Record<string, { label: string; cls: string }> = {
  idle:   { label: "Idle",   cls: "bg-gray-500/20 text-gray-400 border border-gray-600"       },
  active: { label: "Active", cls: "bg-green-500/20 text-green-300 border border-green-500/40" },
  done:   { label: "Done",   cls: "bg-blue-500/20 text-blue-300 border border-blue-500/40"    },
};

function fmtTime(iso: string | null) {
  if (!iso) return "Never";
  const d = new Date(iso);
  const diffMin = Math.floor((Date.now() - d.getTime()) / 60000);
  if (diffMin < 1) return "just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  const h = Math.floor(diffMin / 60);
  if (h < 24) return `${h}h ago`;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
}

function ProgressBar({ current, total }: { current: number; total: number }) {
  if (!total) return null;
  const pct = Math.min(100, Math.round((current / total) * 100));
  return (
    <div className="flex items-center gap-2 mt-1">
      <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
        <div className="h-full bg-gradient-to-r from-cyan-400 to-purple-500" style={{ width: `${pct}%` }} />
      </div>
      <span className="text-[10px] text-muted-foreground tabular-nums">{pct}%</span>
    </div>
  );
}

export default function SheetsTab() {
  const [rows, setRows] = useState<SheetRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from("sheet_status").select("*").order("type")
      .then(({ data }) => {
        setRows((data as unknown as SheetRow[]) ?? []);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    const ch = supabase.channel("sheet_status_rt")
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "sheet_status" },
        (p) => setRows((prev) => prev.map((r) => r.id === (p.new as SheetRow).id ? (p.new as SheetRow) : r)))
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, []);

  return (
    <div className="glass-card p-4 sm:p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-2xl">📊</span>
          <h2 className="text-lg sm:text-xl font-bold tracking-tight">SHEETS</h2>
        </div>
        <span className="text-xs text-muted-foreground">{rows.length} sheets tracked</span>
      </div>

      {/* Column headers — hidden on mobile */}
      <div className="hidden md:grid grid-cols-[2fr_1fr_1fr_2fr_1fr_1.5fr] gap-3 px-3 py-2 text-[10px] uppercase tracking-wider text-muted-foreground border-b border-white/5">
        <div>Sheet</div>
        <div>Type</div>
        <div>Status</div>
        <div>Progress</div>
        <div>Last Run</div>
        <div>Sent / Failed</div>
      </div>

      <div className="divide-y divide-white/5">
        {loading && <p className="text-sm text-muted-foreground p-4">Loading...</p>}
        {!loading && rows.length === 0 && (
          <p className="text-sm text-muted-foreground p-4">No sheets tracked yet.</p>
        )}
        {rows.map((row) => {
          const tc = TYPE_CONFIG[row.type] ?? TYPE_CONFIG.crm;
          const sc = STATUS_CONFIG[row.status] ?? STATUS_CONFIG.idle;
          return (
            <div
              key={row.id}
              className="grid grid-cols-2 md:grid-cols-[2fr_1fr_1fr_2fr_1fr_1.5fr] gap-3 px-3 py-3 text-sm hover:bg-white/5 transition-colors"
            >
              {/* Sheet name */}
              <div className="col-span-2 md:col-span-1">
                <div className="font-medium text-foreground truncate">{row.sheet_name}</div>
                {row.total_rows > 0 && (
                  <div className="text-[11px] text-muted-foreground tabular-nums">
                    Row {(row.current_row || 0).toLocaleString()} of {row.total_rows.toLocaleString()}
                  </div>
                )}
                {row.total_rows > 0 && <ProgressBar current={row.current_row || 0} total={row.total_rows} />}
              </div>

              {/* Type */}
              <div className={`text-xs ${tc.color} flex items-center gap-1`}>
                <span>{tc.icon}</span>
                <span className="hidden sm:inline">{tc.label}</span>
              </div>

              {/* Status */}
              <div>
                <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-medium ${sc.cls}`}>
                  {sc.label}
                </span>
              </div>

              {/* Progress / sequences */}
              <div className="col-span-2 md:col-span-1 text-[11px] text-muted-foreground">
                {row.sequences && Object.keys(row.sequences).length > 0 ? (
                  <div className="flex flex-wrap gap-x-2 gap-y-0.5">
                    {Object.entries(row.sequences)
                      .filter(([k]) => k !== "mobile_tab" && k !== "mobile_rows")
                      .map(([seq, data]) => {
                        const d = (data ?? {}) as { sent?: number; last_date?: string };
                        return (
                          <span key={seq} className="whitespace-nowrap">
                            <span className="text-foreground/70">{seq}:</span>{" "}
                            <span className="tabular-nums">{(d.sent || 0).toLocaleString()}</span>
                            {d.last_date && <span className="opacity-60"> ({d.last_date})</span>}
                          </span>
                        );
                      })}
                  </div>
                ) : (
                  <span className="opacity-60">Awaiting first run</span>
                )}
              </div>

              {/* Last run */}
              <div className="text-[11px] text-muted-foreground">{fmtTime(row.last_run_at)}</div>

              {/* Sent / Failed */}
              <div className="text-[11px]">
                {row.last_run_sent > 0 || row.last_run_failed > 0 ? (
                  <span className="tabular-nums">
                    <span className="text-green-400">{row.last_run_sent.toLocaleString()} sent</span>
                    {row.last_run_failed > 0 && (
                      <span className="text-red-400"> · {row.last_run_failed} failed</span>
                    )}
                  </span>
                ) : (
                  <span className="text-muted-foreground opacity-60">No runs yet</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex items-center justify-between mt-4 pt-3 border-t border-white/5 text-[10px] text-muted-foreground">
        <span>Updates after each email/SMS run</span>
        <span className="flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
          Realtime
        </span>
      </div>
    </div>
  );
}
