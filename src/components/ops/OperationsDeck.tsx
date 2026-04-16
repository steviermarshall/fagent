import { motion } from "framer-motion";
import { Mail, MessageSquare, TrendingUp, DollarSign, Database, Cpu, Clock, Zap } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import ProgressRing from "@/components/ProgressRing";
import Sparkline from "@/components/Sparkline";
import { useEmailMetrics, useSmsMetrics, useSheetSync, useEngagementRates, useLogs, useGithubDeploys, useDealPipeline, useMerchantCount } from "@/hooks/useSupabaseData";
import { formatDistanceToNow } from "date-fns";

const sectionTitle = "text-[11px] uppercase tracking-[2px] text-muted-foreground font-mono mb-3";
const fadeUp = (i: number) => ({ initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { delay: i * 0.06 } });

const Beacon = ({ color = "#34d399" }: { color?: string }) => (
  <span className="relative flex h-2 w-2">
    <span className="animate-beacon absolute inline-flex h-full w-full rounded-full opacity-75" style={{ backgroundColor: color }} />
    <span className="relative inline-flex rounded-full h-2 w-2" style={{ backgroundColor: color }} />
  </span>
);

const sourceColors: Record<string, string> = {
  RESEND: "#34d399",
  SINCH: "#a78bfa",
  SHEETS: "#38bdf8",
  GITHUB: "#22d3ee",
  CRON: "#fbbf24",
  ERROR: "#f87171",
};

const OperationsDeck = () => {
  const { metrics: email, loading: el } = useEmailMetrics();
  const { metrics: sms, loading: sl } = useSmsMetrics();
  const { sheets, loading: shl } = useSheetSync();
  const { rates } = useEngagementRates();
  const { logs } = useLogs();
  const { deploys } = useGithubDeploys();
  const { pipeline } = useDealPipeline();
  const { count: merchantCount } = useMerchantCount();

  const emailSent = email?.sent ?? 0;
  const emailTarget = email?.daily_target ?? 300;
  const smsSent = sms?.sent ?? 0;
  const smsTarget = sms?.weekly_target ?? 50;
  const openRate = rates.length ? rates[rates.length - 1].open_rate : 0;
  const clickRate = rates.length ? rates[rates.length - 1].click_rate : 0;
  const replyRate = rates.length ? rates[rates.length - 1].reply_rate : 0;
  const dropRate = rates.length ? rates[rates.length - 1].drop_rate : 0;

  const sparkData = rates.map((r: any) => Number(r.open_rate));
  const clickData = rates.map((r: any) => Number(r.click_rate));

  const lastDeploy = deploys[0];

  return (
    <div className="space-y-3 sm:space-y-6">
      <p className={sectionTitle}>OPERATIONS OVERVIEW</p>

      {/* Row 1 — KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
        <motion.div {...fadeUp(0)} className="glass-card p-3 sm:p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-primary" />
              <span className="text-xs font-mono uppercase tracking-wider text-muted-foreground">Emails Today</span>
            </div>
            <Beacon />
          </div>
          <div className="flex items-center gap-4">
            <ProgressRing value={emailSent} max={emailTarget} color="#34d399" size={56} thickness={4} />
            <div>
              <p className="text-2xl font-bold font-mono text-foreground">{emailSent}</p>
              <p className="text-[10px] text-muted-foreground font-mono">/{emailTarget} target</p>
            </div>
          </div>
          <p className="text-[10px] text-muted-foreground font-mono mt-2">
            D1:{email?.day1_count ?? 100} · D3:{email?.day3_count ?? 100} · D7:{email?.day7_count ?? 100}
          </p>
          <div className="mt-2">
            <Sparkline data={sparkData.length ? sparkData : [0, 5, 10, 8, 15]} color="#34d399" width={160} height={24} />
          </div>
        </motion.div>

        <motion.div {...fadeUp(1)} className="glass-card p-3 sm:p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-purple-400" />
              <span className="text-xs font-mono uppercase tracking-wider text-muted-foreground">SMS Weekly</span>
            </div>
            <Beacon color={sms?.a2p_status === "verified" ? "#34d399" : "#fbbf24"} />
          </div>
          <div className="flex items-center gap-4">
            <ProgressRing value={smsSent} max={smsTarget} color="#a78bfa" size={56} thickness={4} />
            <div>
              <p className="text-2xl font-bold font-mono text-foreground">{smsSent}</p>
              <p className="text-[10px] text-muted-foreground font-mono">/{smsTarget} target</p>
            </div>
          </div>
          <div className="flex gap-2 mt-3">
            <span className={`text-[9px] font-mono px-2 py-0.5 rounded-full ${sms?.a2p_status === "verified" ? "bg-primary/15 text-primary" : "bg-amber-500/15 text-amber-400"}`}>
              A2P: {sms?.a2p_status ?? "pending"}
            </span>
            <span className={`text-[9px] font-mono px-2 py-0.5 rounded-full ${sms?.compliance_ok ? "bg-primary/15 text-primary" : "bg-red-500/15 text-red-400"}`}>
              {sms?.compliance_ok ? "Compliant" : "Non-compliant"}
            </span>
          </div>
        </motion.div>

        <motion.div {...fadeUp(2)} className="glass-card p-3 sm:p-5">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="w-4 h-4 text-amber-400" />
            <span className="text-xs font-mono uppercase tracking-wider text-muted-foreground">Engagement</span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-lg font-bold font-mono text-foreground">{Number(openRate).toFixed(1)}%</p>
              <p className="text-[9px] text-muted-foreground font-mono">Open Rate</p>
              <Sparkline data={sparkData.length ? sparkData : [10, 12, 15]} color="#fbbf24" width={70} height={18} />
            </div>
            <div>
              <p className="text-lg font-bold font-mono text-foreground">{Number(clickRate).toFixed(1)}%</p>
              <p className="text-[9px] text-muted-foreground font-mono">Click Rate</p>
              <Sparkline data={clickData.length ? clickData : [2, 3, 4]} color="#38bdf8" width={70} height={18} />
            </div>
          </div>
          <div className="flex gap-2 mt-3">
            <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-primary/15 text-primary">Reply: {Number(replyRate).toFixed(1)}%</span>
            <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-red-500/15 text-red-400">Drop: {Number(dropRate).toFixed(1)}%</span>
          </div>
        </motion.div>

        <motion.div {...fadeUp(3)} className="glass-card p-3 sm:p-5">
          <div className="flex items-center gap-2 mb-3">
            <DollarSign className="w-4 h-4 text-primary" />
            <span className="text-xs font-mono uppercase tracking-wider text-muted-foreground">Deal Pipeline</span>
          </div>
          <p className="text-2xl font-bold font-mono text-foreground">{`$${pipeline.totalAmount.toLocaleString()}`}</p>
          <p className="text-[10px] text-muted-foreground font-mono">{`/$${pipeline.targetAmount.toLocaleString()} target · ${pipeline.dealCount} deals`}</p>
          <div className="w-full h-1.5 bg-muted rounded-full mt-3 overflow-hidden">
            <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${Math.min((pipeline.totalAmount / pipeline.targetAmount) * 100, 100)}%` }} />
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-[9px] text-muted-foreground font-mono">{`${((pipeline.totalAmount / pipeline.targetAmount) * 100).toFixed(1)}%`}</span>
            <span className="text-[9px] text-muted-foreground font-mono">{pipeline.deadlineYear} goal</span>
          </div>
        </motion.div>
      </div>

      {/* Row 2 — Wide cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <motion.div {...fadeUp(4)} className="glass-card p-3 sm:p-5">
          <div className="flex items-center gap-2 mb-4">
            <Database className="w-4 h-4 text-sky-400" />
            <span className={sectionTitle + " !mb-0"}>GOOGLE SHEETS LIVE</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {(() => {
              const defaultSheets = ["ZEUS", "MARSHALL", "MONEY", "MATSUMOTO"].map(name => ({ sheet_name: name, row_count: 0, delta: 0, last_sync: new Date().toISOString() }));
              const merged = defaultSheets.map(d => sheets.find((s: any) => s.sheet_name === d.sheet_name) || d);
              return merged;
            })().map((s: any, i: number) => {
              const colors: Record<string, string> = { ZEUS: "#38bdf8", MARSHALL: "#34d399", MONEY: "#fbbf24", MATSUMOTO: "#a78bfa" };
              const color = colors[s.sheet_name] || "#6b7280";
              return (
                <div key={s.sheet_name} className="rounded-lg border border-white/[0.04] bg-white/[0.02] p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold" style={{ color }}>{s.sheet_name}</span>
                    <Beacon color={color} />
                  </div>
                  <p className="text-xl font-bold font-mono text-foreground mt-1">{s.row_count.toLocaleString()}</p>
                  <p className="text-[9px] text-muted-foreground font-mono">+{s.delta} new · {formatDistanceToNow(new Date(s.last_sync), { addSuffix: true })}</p>
                </div>
              );
            })}
          </div>
        </motion.div>

        <motion.div {...fadeUp(5)} className="glass-card p-3 sm:p-5">
          <div className="flex items-center gap-2 mb-4">
            <Cpu className="w-4 h-4 text-cyan-400" />
            <span className={sectionTitle + " !mb-0"}>SYSTEM HEALTH</span>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "CPU", value: "12%", color: "#34d399" },
              { label: "Memory", value: "34%", color: "#38bdf8" },
              { label: "Uptime", value: "99.9%", color: "#34d399" },
              { label: "Merchants", value: merchantCount.toString(), color: "#fbbf24" },
              { label: "Deals", value: pipeline.dealCount.toString(), color: "#22d3ee" },
              { label: "Last Deploy", value: lastDeploy ? formatDistanceToNow(new Date(lastDeploy.deployed_at), { addSuffix: true }) : "N/A", color: "#a78bfa" },
            ].map((item) => (
              <div key={item.label} className="text-center">
                <p className="text-lg font-bold font-mono text-foreground">{item.value}</p>
                <p className="text-[9px] text-muted-foreground font-mono uppercase">{item.label}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Row 3 — Agent Feed */}
      <motion.div {...fadeUp(6)} className="glass-card p-3 sm:p-5">
        <div className="flex items-center gap-2 mb-3">
          <Zap className="w-4 h-4 text-primary" />
          <span className={sectionTitle + " !mb-0"}>AGENT FEED — LIVE</span>
          <Beacon />
        </div>
        <ScrollArea className="h-48">
          <div className="space-y-2">
            {logs.slice(0, 20).map((log: any) => {
              const src = (log.category || "general").toUpperCase();
              const color = sourceColors[src] || "#6b7280";
              return (
                <div key={log.id} className="flex items-start gap-2 text-xs">
                  <span className="text-[9px] font-mono px-1.5 py-0.5 rounded" style={{ backgroundColor: `${color}20`, color }}>
                    {log.agent_emoji || "📡"} {src}
                  </span>
                  <span className="text-foreground/80 flex-1">{log.message}</span>
                  <span className="text-[9px] text-muted-foreground font-mono whitespace-nowrap">
                    {log.timestamp ? formatDistanceToNow(new Date(log.timestamp), { addSuffix: true }) : ""}
                  </span>
                </div>
              );
            })}
            {!logs.length && <p className="text-xs text-muted-foreground">No logs yet</p>}
          </div>
        </ScrollArea>
      </motion.div>
    </div>
  );
};

export default OperationsDeck;
