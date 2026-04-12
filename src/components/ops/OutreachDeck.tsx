import { motion } from "framer-motion";
import { Mail, MessageSquare, TrendingDown, Eye, MousePointer } from "lucide-react";
import ProgressRing from "@/components/ProgressRing";
import Sparkline from "@/components/Sparkline";
import { useEmailMetrics, useSmsMetrics, useEngagementRates } from "@/hooks/useSupabaseData";

const sectionTitle = "text-[11px] uppercase tracking-[2px] text-muted-foreground font-mono mb-3";
const fadeUp = (i: number) => ({ initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { delay: i * 0.06 } });

const Beacon = ({ color = "#34d399" }: { color?: string }) => (
  <span className="relative flex h-2 w-2">
    <span className="animate-beacon absolute inline-flex h-full w-full rounded-full opacity-75" style={{ backgroundColor: color }} />
    <span className="relative inline-flex rounded-full h-2 w-2" style={{ backgroundColor: color }} />
  </span>
);

const OutreachDeck = () => {
  const { metrics: email } = useEmailMetrics();
  const { metrics: sms } = useSmsMetrics();
  const { rates } = useEngagementRates();

  const smsSent = sms?.sent ?? 0;
  const smsTarget = sms?.weekly_target ?? 50;

  const openData = rates.map((r: any) => Number(r.open_rate));
  const clickData = rates.map((r: any) => Number(r.click_rate));
  const dropData = rates.map((r: any) => Number(r.drop_rate));
  const lastRate = rates.length ? rates[rates.length - 1] : null;

  return (
    <div className="space-y-6">
      <p className={sectionTitle}>OUTREACH OPERATIONS</p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left — Email Cadence Engine */}
        <div className="lg:col-span-2 space-y-4">
          <motion.div {...fadeUp(0)} className="glass-card p-5">
            <div className="flex items-center gap-2 mb-4">
              <Mail className="w-4 h-4 text-primary" />
              <span className={sectionTitle + " !mb-0"}>EMAIL CADENCE ENGINE</span>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {[
                { day: "DAY 1", label: "Initial Touch", count: email?.day1_count ?? 100, color: "#34d399" },
                { day: "DAY 3", label: "Follow-Up", count: email?.day3_count ?? 100, color: "#38bdf8" },
                { day: "DAY 7", label: "Final Push", count: email?.day7_count ?? 100, color: "#fbbf24" },
              ].map((item) => (
                <div key={item.day} className="rounded-lg border border-white/[0.04] bg-white/[0.02] p-4 text-center">
                  <p className="text-xs font-mono font-bold" style={{ color: item.color }}>{item.day}</p>
                  <p className="text-2xl font-bold font-mono text-foreground mt-1">{item.count}</p>
                  <p className="text-[9px] text-muted-foreground font-mono">{item.label}</p>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div {...fadeUp(1)} className="glass-card p-5 border-l-2 border-l-amber-500/50">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-[11px] uppercase tracking-[2px] text-amber-400 font-mono">SPAM SHIELD PROTOCOL</span>
            </div>
            <div className="grid grid-cols-2 gap-3 text-xs">
              {[
                { label: "Warmup Schedule", value: `50→100→200→300/day (D${email?.warmup_day ?? 1}/14)` },
                { label: "Domain Rotation", value: "Active — 3 domains" },
                { label: "SPF / DKIM / DMARC", value: "✓ ✓ ✓" },
                { label: "Sending Window", value: "8:00 AM – 2:00 PM EST" },
                { label: "Rate Limit", value: "12/min" },
                { label: "Auto-Pause", value: "If reply rate < 2%" },
              ].map((item) => (
                <div key={item.label} className="flex justify-between border-b border-white/[0.04] pb-1.5">
                  <span className="text-muted-foreground font-mono">{item.label}</span>
                  <span className="text-foreground font-mono">{item.value}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Right — SMS */}
        <motion.div {...fadeUp(2)} className="glass-card p-5">
          <div className="flex items-center gap-2 mb-4">
            <MessageSquare className="w-4 h-4 text-purple-400" />
            <span className={sectionTitle + " !mb-0"}>SMS VIA SINCH</span>
          </div>
          <div className="flex justify-center mb-4">
            <div className="relative">
              <ProgressRing value={smsSent} max={smsTarget} color="#a78bfa" size={100} thickness={6} />
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <p className="text-xl font-bold font-mono text-foreground">{smsSent}</p>
                <p className="text-[9px] text-muted-foreground font-mono">/{smsTarget}</p>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 justify-center">
            {[
              { label: `A2P: ${sms?.a2p_status ?? "pending"}`, ok: sms?.a2p_status === "verified" },
              { label: sms?.compliance_ok ? "Compliant" : "Non-compliant", ok: sms?.compliance_ok !== false },
              { label: "Cap: 10/day", ok: true },
              { label: "Opt-out: ON", ok: true },
            ].map((pill) => (
              <span key={pill.label} className={`text-[9px] font-mono px-2 py-1 rounded-full ${pill.ok ? "bg-primary/15 text-primary" : "bg-amber-500/15 text-amber-400"}`}>
                {pill.label}
              </span>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Bottom — Rate Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <motion.div {...fadeUp(3)} className="glass-card p-5">
          <div className="flex items-center gap-2 mb-2">
            <TrendingDown className="w-4 h-4 text-red-400" />
            <span className="text-xs font-mono uppercase tracking-wider text-muted-foreground">Drop Rate</span>
          </div>
          <p className="text-2xl font-bold font-mono text-foreground">{lastRate ? Number(lastRate.drop_rate).toFixed(1) : "0.0"}%</p>
          <Sparkline data={dropData.length ? dropData : [3, 2, 4, 2]} color="#f87171" width={160} height={28} />
        </motion.div>

        <motion.div {...fadeUp(4)} className="glass-card p-5">
          <div className="flex items-center gap-2 mb-2">
            <Eye className="w-4 h-4 text-amber-400" />
            <span className="text-xs font-mono uppercase tracking-wider text-muted-foreground">Open Rate</span>
          </div>
          <p className="text-2xl font-bold font-mono text-foreground">{lastRate ? Number(lastRate.open_rate).toFixed(1) : "0.0"}%</p>
          <p className="text-[9px] text-muted-foreground font-mono mb-1">Industry: 21%</p>
          <Sparkline data={openData.length ? openData : [15, 18, 22, 20]} color="#fbbf24" width={160} height={28} />
        </motion.div>

        <motion.div {...fadeUp(5)} className="glass-card p-5">
          <div className="flex items-center gap-2 mb-2">
            <MousePointer className="w-4 h-4 text-sky-400" />
            <span className="text-xs font-mono uppercase tracking-wider text-muted-foreground">Click + Engage</span>
          </div>
          <p className="text-2xl font-bold font-mono text-foreground">{lastRate ? Number(lastRate.click_rate).toFixed(1) : "0.0"}%</p>
          <p className="text-[9px] text-muted-foreground font-mono mb-1">Reply: {lastRate ? Number(lastRate.reply_rate).toFixed(1) : "0.0"}%</p>
          <Sparkline data={clickData.length ? clickData : [2, 3, 5, 4]} color="#38bdf8" width={160} height={28} />
        </motion.div>
      </div>
    </div>
  );
};

export default OutreachDeck;
