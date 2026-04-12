import { motion } from "framer-motion";
import { Database, GitMerge } from "lucide-react";
import { useSheetSync, useCrossRef } from "@/hooks/useSupabaseData";
import { formatDistanceToNow } from "date-fns";

const sectionTitle = "text-[11px] uppercase tracking-[2px] text-muted-foreground font-mono mb-3";
const fadeUp = (i: number) => ({ initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { delay: i * 0.06 } });

const Beacon = ({ color = "#34d399" }: { color?: string }) => (
  <span className="relative flex h-2 w-2">
    <span className="animate-beacon absolute inline-flex h-full w-full rounded-full opacity-75" style={{ backgroundColor: color }} />
    <span className="relative inline-flex rounded-full h-2 w-2" style={{ backgroundColor: color }} />
  </span>
);

const sheetColors: Record<string, string> = { ZEUS: "#38bdf8", MARSHALL: "#34d399", MONEY: "#fbbf24", MATSUMOTO: "#a78bfa" };

const DataFeedsDeck = () => {
  const { sheets } = useSheetSync();
  const { matches } = useCrossRef();

  const totalMatches = matches.reduce((sum: number, m: any) => sum + (m.match_count || 0), 0);
  const lastScan = matches.length ? matches.reduce((latest: string, m: any) => m.last_scan > latest ? m.last_scan : latest, matches[0].last_scan) : null;

  const feedSources = [
    { name: "Resend", color: "#34d399" },
    { name: "Sinch", color: "#a78bfa" },
    { name: "Sheets API", color: "#38bdf8" },
    { name: "Telegram", color: "#22d3ee" },
    { name: "GitHub", color: "#fbbf24" },
    { name: "OpenClaw", color: "#f87171" },
  ];

  return (
    <div className="space-y-6">
      <p className={sectionTitle}>DATA FEEDS</p>

      {/* Row 1 — Sheet Detail Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {(sheets.length ? sheets : [
          { sheet_name: "ZEUS", row_count: 0, delta: 0, last_sync: new Date().toISOString(), status: "live" },
          { sheet_name: "MARSHALL", row_count: 0, delta: 0, last_sync: new Date().toISOString(), status: "live" },
          { sheet_name: "MONEY", row_count: 0, delta: 0, last_sync: new Date().toISOString(), status: "live" },
        ]).map((s: any, i: number) => (
          <motion.div key={s.sheet_name} {...fadeUp(i)} className="glass-card p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4" style={{ color: sheetColors[s.sheet_name] || "#6b7280" }} />
                <span className="text-xs font-mono font-bold" style={{ color: sheetColors[s.sheet_name] }}>{s.sheet_name}</span>
              </div>
              <Beacon color={s.status === "live" ? sheetColors[s.sheet_name] : "#f87171"} />
            </div>
            <p className="text-3xl font-bold font-mono text-foreground">{s.row_count.toLocaleString()}</p>
            <p className="text-[10px] text-muted-foreground font-mono mt-1">+{s.delta} new records</p>
            <div className="flex justify-between mt-3 text-[9px] text-muted-foreground font-mono">
              <span>Last sync: {formatDistanceToNow(new Date(s.last_sync), { addSuffix: true })}</span>
              <span>⏱ 15 min</span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Row 2 — Cross-Reference Engine */}
      <motion.div {...fadeUp(3)} className="glass-card p-5">
        <div className="flex items-center gap-2 mb-2">
          <GitMerge className="w-4 h-4 text-purple-400" />
          <span className={sectionTitle + " !mb-0"}>CROSS-REFERENCE ENGINE</span>
        </div>
        <p className="text-[10px] text-muted-foreground font-mono mb-4">Deduplicating and matching records across sheets</p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
          {matches.map((m: any) => (
            <div key={m.id} className="rounded-lg border border-white/[0.04] bg-white/[0.02] p-3 text-center">
              <p className="text-xs font-mono text-muted-foreground">
                <span style={{ color: sheetColors[m.sheet_a] }}>{m.sheet_a}</span>
                {" ↔ "}
                <span style={{ color: sheetColors[m.sheet_b] }}>{m.sheet_b}</span>
              </p>
              <p className="text-xl font-bold font-mono text-foreground mt-1">{m.match_count}</p>
              <p className="text-[9px] text-muted-foreground font-mono">matches</p>
            </div>
          ))}
          {!matches.length && (
            <p className="text-xs text-muted-foreground col-span-3">No cross-reference data yet</p>
          )}
        </div>

        <div className="flex justify-between text-[10px] text-muted-foreground font-mono">
          <span>Total matches: {totalMatches}</span>
          <span>Last scan: {lastScan ? formatDistanceToNow(new Date(lastScan), { addSuffix: true }) : "N/A"}</span>
        </div>
      </motion.div>

      {/* Row 3 — Feed Health Matrix */}
      <motion.div {...fadeUp(4)} className="glass-card p-5">
        <p className={sectionTitle}>FEED HEALTH MATRIX</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {feedSources.map((src) => (
            <div key={src.name} className="flex items-center gap-2 rounded-lg border border-white/[0.04] bg-white/[0.02] p-3">
              <Beacon color={src.color} />
              <span className="text-xs font-mono text-foreground">{src.name}</span>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default DataFeedsDeck;
