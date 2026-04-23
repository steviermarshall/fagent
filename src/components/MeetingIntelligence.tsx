import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useEmailMetrics, useSmsMetrics, useDealPipeline } from "@/hooks/useSupabaseData";
import { format } from "date-fns";

interface AdvisorBrief {
  generated_at?: string;
  priorities?: string[];
  industry_intel?: { headline: string; bullets: string[] };
  origination?: { headline: string; actions: string[] };
  closing?: { headline: string; actions: string[] };
  book_of_business?: { headline: string; actions: string[] };
  terminal_roadmap?: { headline: string; items: string[] };
}

const STATIC: AdvisorBrief = {
  priorities: [
    "Call every email reply within 1 hour — reply velocity is the #1 close predictor",
    "Push any deal stalled 48h+ with a direct call, not another email",
    "Ask every first-call prospect for their MTD bank statement before hanging up",
  ],
  industry_intel: {
    headline: "MCA Market Pulse — Spring 2026",
    bullets: [
      "Merchants funded 12–18 months ago are prime refinance targets — their UCC positions are approaching payoff window",
      "LSA/contractor vertical is strongest for summer capital demand — ramp outreach now before July slowdown",
      "Bank rejection rates are up; merchants can't get traditional loans → MCA demand at a 3-year high",
      "Funders are tightening on stacked positions — get clean first position where possible",
      "Texas, Florida, Georgia leading volume — prioritize those time zones in your call window",
    ],
  },
  origination: {
    headline: "Fill the Pipeline",
    actions: [
      "UCC leads with $100k+ revenue are pre-qualified — move these to the front of the SMS queue",
      "Every email bounce should trigger a direct SMS within 24 hours — don't let the lead go cold",
      "After every funding, ask: 'Who else in your industry could use working capital?' — referrals close 3× faster",
      "Day 7 follow-up is your highest reply-rate touch — make sure those are firing on schedule",
      "Add a LinkedIn connection request to any prospect who opened your email 3+ times but didn't reply",
    ],
  },
  closing: {
    headline: "Move Deals Forward",
    actions: [
      "Never answer 'what's the factor rate?' directly — reframe: 'Based on your statements we can structure $X at $Y per day'",
      "Bank statements = deal. If you don't have them, you don't have a deal. Ask on every first call",
      "Stage stalls kill deals — if a deal hasn't moved in 48h, pick up the phone. Email doesn't create urgency",
      "Use Kai's council score to stack-rank your pipeline — work the WHALEs and MIDs first",
      "Create urgency without lying: 'I have a funder window closing Thursday — let's get your docs in today'",
    ],
  },
  book_of_business: {
    headline: "Protect & Grow Funded Merchants",
    actions: [
      "Check funded merchants at 40% payoff — that's the refinance sweet spot before they go elsewhere",
      "Send a personalized performance recap at 90 days post-funding — it builds trust and opens renewal",
      "If a merchant is late on payments, call within 24h — silent delinquency turns into default fast",
      "Your funded merchants are 3× more likely to renew than a cold lead is to fund — treat them like gold",
      "Add a 'protection clause' conversation early: 'Don't sign anything else without calling me first'",
    ],
  },
  terminal_roadmap: {
    headline: "What to Build Next in Fagent",
    items: [
      "📬 Email reply tracker — flag inbound responses, route to approval queue, trigger Telegram alert",
      "💬 Two-way SMS — when a UCC lead texts back, auto-create a deal in the pipeline and alert you",
      "🏦 Deal enrichment — auto-pull revenue, industry, and owner name from UCC data before council runs",
      "📋 Funder matrix — track which funders are buying what risk tiers, factor rates, and deal sizes",
      "⏰ Pre-call brief — 30 min before any call in Google Calendar, send a one-pager: revenue, stage, Kai score, Jane opening line",
      "📊 Morning digest — SMS to you at 7am: yesterday's sent/replied/funded + today's top 3 priorities",
      "🔄 Stale deal alerts — if a deal hasn't updated in 48h, fire a Telegram prompt to take action",
      "📈 Revenue attribution — track which email/SMS sequence led to each funding so you know what's working",
    ],
  },
};

function PulseCard({ icon, label, value, sub, color }: { icon: string; label: string; value: string; sub?: string; color: string }) {
  return (
    <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-4 hover:bg-white/[0.04] transition-colors">
      <div className="flex items-center gap-2 text-[11px] text-muted-foreground uppercase tracking-wider mb-2">
        <span>{icon}</span>
        <span>{label}</span>
      </div>
      <div className={`text-2xl font-semibold ${color} tabular-nums`}>{value}</div>
      {sub && <div className="text-xs text-muted-foreground mt-1">{sub}</div>}
    </div>
  );
}

function PriorityBanner({ items }: { items: string[] }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-amber-500/20 bg-gradient-to-br from-amber-500/[0.08] to-orange-500/[0.04] p-5"
    >
      <div className="flex items-center gap-2 mb-3">
        <span className="text-lg">⚡</span>
        <h3 className="text-sm font-semibold text-amber-300 uppercase tracking-wider">Today's Top 3</h3>
      </div>
      <div className="space-y-2.5">
        {items.map((item, i) => (
          <div key={i} className="flex items-start gap-3">
            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold flex items-center justify-center mt-0.5">
              {i + 1}
            </span>
            <p className="text-sm text-foreground/90 leading-relaxed">{item}</p>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

function AdvisoryCard({ icon, title, headline, items, accentColor }: { icon: string; title: string; headline: string; items: string[]; accentColor: string }) {
  const [expanded, setExpanded] = useState(true);
  return (
    <div className="rounded-2xl border border-white/5 bg-white/[0.02] overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-5 py-4 border-b border-white/5 text-left hover:bg-white/[0.02] transition-colors"
      >
        <div className="flex items-center gap-3 min-w-0">
          <span className="text-2xl flex-shrink-0">{icon}</span>
          <div className="min-w-0">
            <h3 className={`text-xs font-semibold uppercase tracking-wider ${accentColor}`}>{title}</h3>
            <p className="text-sm text-foreground/90 truncate">{headline}</p>
          </div>
        </div>
        <span className="text-xs text-muted-foreground ml-2">{expanded ? "▲" : "▼"}</span>
      </button>
      {expanded && (
        <div className="px-5 py-4 space-y-2.5">
          {items.map((item, i) => (
            <div key={i} className="flex items-start gap-3">
              <span className={`flex-shrink-0 mt-1.5 w-1.5 h-1.5 rounded-full ${accentColor.replace("text-", "bg-")}`} />
              <p className="text-sm text-foreground/80 leading-relaxed">{item}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function RoadmapCard({ items }: { items: string[] }) {
  return (
    <div className="rounded-2xl border border-cyan-500/20 bg-gradient-to-br from-cyan-500/[0.05] to-blue-500/[0.03] p-5">
      <div className="flex items-center gap-3 mb-4">
        <span className="text-2xl">🛠</span>
        <div>
          <h3 className="text-sm font-semibold text-cyan-300 uppercase tracking-wider">Terminal Roadmap</h3>
          <p className="text-xs text-muted-foreground">What to Build Next in Fagent</p>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
        {items.map((item, i) => (
          <div key={i} className="flex items-start gap-2 px-3 py-2.5 rounded-lg bg-white/[0.02] border border-white/5">
            <p className="text-sm text-foreground/85 leading-relaxed">{item}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

const MeetingIntelligence = () => {
  const [brief, setBrief] = useState<AdvisorBrief | null>(null);
  const [briefTime, setBriefTime] = useState<string | null>(null);
  const [briefLoading, setBriefLoading] = useState(true);
  const { metrics: emailMetrics } = useEmailMetrics();
  const { metrics: smsMetrics } = useSmsMetrics();
  const { pipeline } = useDealPipeline();

  const today = format(new Date(), "yyyy-MM-dd");
  const todayDisplay = format(new Date(), "EEEE, MMMM d, yyyy");

  useEffect(() => {
    supabase
      .from("daily_reports")
      .select("data, created_at")
      .eq("report_type", "daily_advisor")
      .eq("report_date", today)
      .order("created_at", { ascending: false })
      .limit(1)
      .then(({ data }) => {
        if (data && data.length > 0) {
          setBrief(data[0].data as AdvisorBrief);
          setBriefTime(data[0].created_at);
        }
        setBriefLoading(false);
      });
  }, [today]);

  const advice = brief ?? STATIC;
  const isAI = !!brief;

  const activeStages = Object.entries(pipeline.stages ?? {})
    .filter(([s]) => !["funded", "canceled", "declined"].includes(s.toLowerCase()))
    .reduce((sum, [, v]) => sum + v.count, 0);
  const activeValue = Object.entries(pipeline.stages ?? {})
    .filter(([s]) => !["funded", "canceled", "declined"].includes(s.toLowerCase()))
    .reduce((sum, [, v]) => sum + v.amount, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-2xl">🧠</span>
            <h2 className="text-lg font-semibold tracking-wider">DAILY ADVISOR</h2>
            {isAI && (
              <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                AI Brief
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-1">{todayDisplay}</p>
        </div>
        <div className="text-xs">
          {briefLoading ? (
            <span className="text-muted-foreground">Loading...</span>
          ) : isAI ? (
            <div className="text-right">
              <div className="flex items-center gap-1.5 text-emerald-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>Brief ready</span>
              </div>
              {briefTime && (
                <div className="text-muted-foreground mt-0.5">Generated {format(new Date(briefTime), "h:mm a")}</div>
              )}
            </div>
          ) : (
            <div className="text-right">
              <div className="flex items-center gap-1.5 text-amber-400">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                <span>Static playbook</span>
              </div>
              <div className="text-muted-foreground mt-0.5">No AI brief yet today</div>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <PulseCard
          icon="🎯"
          label="Active Pipeline"
          value={activeStages > 0 ? `${activeStages} deals` : "—"}
          sub={activeValue > 0 ? `$${(activeValue / 1000).toFixed(0)}k in play` : "No active deals"}
          color="text-emerald-400"
        />
        <PulseCard
          icon="📧"
          label="Emails Sent"
          value={emailMetrics?.sent > 0 ? emailMetrics.sent.toLocaleString() : "—"}
          sub={emailMetrics?.replied > 0 ? `${emailMetrics.replied} replied` : emailMetrics?.opened > 0 ? `${emailMetrics.opened} opened` : "No data yet"}
          color="text-blue-400"
        />
        <PulseCard
          icon="💬"
          label="SMS Sent"
          value={smsMetrics?.sent > 0 ? smsMetrics.sent.toLocaleString() : "—"}
          sub={smsMetrics?.replied > 0 ? `${smsMetrics.replied} replies` : "No replies yet"}
          color="text-green-400"
        />
        <PulseCard
          icon="💰"
          label="Funded"
          value={pipeline.totalAmount > 0 ? `$${(pipeline.totalAmount / 1000000).toFixed(2)}M` : "—"}
          sub={`Goal: $${(pipeline.targetAmount / 1000000).toFixed(0)}M by ${pipeline.deadlineYear}`}
          color="text-purple-400"
        />
      </div>

      {advice.priorities && <PriorityBanner items={advice.priorities} />}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {advice.industry_intel && (
          <AdvisoryCard icon="📡" title="Industry Intel" headline={advice.industry_intel.headline} items={advice.industry_intel.bullets} accentColor="text-violet-400" />
        )}
        {advice.origination && (
          <AdvisoryCard icon="🎣" title="Origination" headline={advice.origination.headline} items={advice.origination.actions} accentColor="text-blue-400" />
        )}
        {advice.closing && (
          <AdvisoryCard icon="🔒" title="Closing" headline={advice.closing.headline} items={advice.closing.actions} accentColor="text-emerald-400" />
        )}
        {advice.book_of_business && (
          <AdvisoryCard icon="📚" title="Book of Business" headline={advice.book_of_business.headline} items={advice.book_of_business.actions} accentColor="text-amber-400" />
        )}
      </div>

      {advice.terminal_roadmap && <RoadmapCard items={advice.terminal_roadmap.items} />}

      {!isAI && !briefLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="rounded-2xl border border-white/5 bg-white/[0.02] p-5"
        >
          <div className="flex items-start gap-3">
            <span className="text-2xl">⚡</span>
            <div className="min-w-0 flex-1">
              <h3 className="text-sm font-semibold mb-1">Activate daily AI briefs</h3>
              <p className="text-xs text-muted-foreground leading-relaxed mb-2">
                Run the daily advisor script each morning to get a personalized brief generated from your live pipeline, email stats, and deal council data — stored in <code className="px-1 py-0.5 rounded bg-white/5 text-foreground/80">daily_reports</code> and displayed here automatically.
              </p>
              <code className="inline-block px-2 py-1 rounded bg-white/5 text-xs font-mono text-cyan-300">node daily-advisor.js</code>
            </div>
          </div>
        </motion.div>
      )}

      {Object.keys(pipeline.stages ?? {}).length > 0 && (
        <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-5">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-lg">📊</span>
            <h3 className="text-sm font-semibold uppercase tracking-wider">Pipeline Breakdown</h3>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5">
            {Object.entries(pipeline.stages).map(([stage, data]) => (
              <div key={stage} className="rounded-lg bg-white/[0.02] border border-white/5 px-3 py-2.5">
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">{stage}</div>
                <div className="text-lg font-semibold tabular-nums">{data.count}</div>
                {data.amount > 0 && (
                  <div className="text-xs text-muted-foreground mt-0.5">${(data.amount / 1000).toFixed(0)}k</div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MeetingIntelligence;
