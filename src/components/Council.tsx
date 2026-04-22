import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useCallback } from "react";
import { Check, Loader2, Clock, Copy, ChevronDown, Search, ArrowLeft } from "lucide-react";
import { useCouncilSessions } from "@/hooks/useSupabaseData";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// ─── Constants ────────────────────────────────────────────────
const STAGE_OPTIONS = [
  { value: "lead",      label: "New Lead"   },
  { value: "contacted", label: "Contacted"  },
  { value: "vc_id",     label: "VC & ID"    },
  { value: "documents", label: "Documents"  },
  { value: "signed",    label: "Signed"     },
  { value: "funded",    label: "Funded"     },
  { value: "dead",      label: "Dead"       },
];

// ─── Helpers ──────────────────────────────────────────────────
function parseDeal(question: string) {
  const m = question.match(/Deal review:\s*(.+?)\s*[—–-]\s*\$?([\d.?]+)?\s*\|\s*Stage:\s*(.+)/);
  if (m) return {
    business: m[1].trim(),
    amount:   m[2] && m[2] !== "?" ? `$${Number(m[2]).toLocaleString()}` : null,
    stage:    m[3].replace(/[\u{1F000}-\u{1FFFF}]/gu, "").trim(),
  };
  return { business: question, amount: null, stage: "" };
}

function getAgent(messages: any[], name: string) {
  return messages.find((m: any) => m.agentName === name) ?? null;
}

function classColors(c: string) {
  const map: Record<string, { accent: string; badge: string; bar: string; text: string }> = {
    WHALE:          { accent: "border-l-blue-500",   badge: "bg-blue-950 text-blue-300 border-blue-700",     bar: "bg-blue-500",    text: "text-blue-400"   },
    MID:            { accent: "border-l-emerald-500", badge: "bg-emerald-950 text-emerald-300 border-emerald-700", bar: "bg-emerald-500", text: "text-emerald-400" },
    CONTROLLED_RISK:{ accent: "border-l-amber-500",  badge: "bg-amber-950 text-amber-300 border-amber-700",   bar: "bg-amber-500",   text: "text-amber-400"  },
    TRASH:          { accent: "border-l-red-500",     badge: "bg-red-950 text-red-300 border-red-700",         bar: "bg-red-500",     text: "text-red-400"    },
  };
  return map[c] ?? { accent: "border-l-border", badge: "bg-secondary text-muted-foreground border-border", bar: "bg-muted", text: "text-muted-foreground" };
}

function classEmoji(c: string) {
  return ({ WHALE: "🐋", MID: "💙", CONTROLLED_RISK: "🟠", TRASH: "🗑️" } as Record<string,string>)[c] ?? "📊";
}

function stageStyle(s: string) {
  const l = s.toLowerCase();
  if (l.includes("vc") || l.includes("id"))  return "bg-indigo-950 text-indigo-300";
  if (l.includes("doc"))                      return "bg-violet-950 text-violet-300";
  if (l.includes("sign"))                     return "bg-teal-950 text-teal-300";
  if (l.includes("fund"))                     return "bg-emerald-950 text-emerald-300";
  if (l.includes("dead"))                     return "bg-red-950 text-red-400";
  return "bg-secondary text-muted-foreground";
}

function timeAgo(d: string) {
  const h = Math.floor((Date.now() - new Date(d).getTime()) / 3600000);
  if (h < 1)  return "just now";
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function isDead(s: any) {
  const { stage } = parseDeal(s.question);
  const kaiMsg = getAgent(Array.isArray(s.messages) ? s.messages : [], "Kai");
  const cls: string = (kaiMsg?.perspective as any)?.classification ?? "";
  return cls === "TRASH" || stage.toLowerCase().includes("dead");
}

// ─── Micro components ─────────────────────────────────────────

function ScoreMeter({ value, barClass }: { value: number; barClass: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1 bg-secondary rounded-full overflow-hidden">
        <motion.div
          className={`h-full rounded-full ${barClass}`}
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 0.7, ease: "easeOut" }}
        />
      </div>
      <span className="text-xs text-muted-foreground w-7 text-right tabular-nums">{value}%</span>
    </div>
  );
}

function CopyBtn({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
      className="flex items-center gap-1 text-xs px-2 py-0.5 rounded bg-secondary hover:bg-secondary/70 text-muted-foreground hover:text-foreground transition-colors"
    >
      {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
      {copied ? "Copied" : "Copy"}
    </button>
  );
}

function ScriptBlock({ label, text }: { label: string; text: string }) {
  if (!text) return null;
  return (
    <div className="glass-card rounded-lg p-3">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">{label}</span>
        <CopyBtn text={text} />
      </div>
      <p className="text-sm text-foreground/90 leading-relaxed italic">"{text}"</p>
    </div>
  );
}

function FlagPill({ text, type }: { text: string; type: "risk" | "green" }) {
  return (
    <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border font-medium ${
      type === "risk"
        ? "bg-red-950/60 text-red-300 border-red-800/50"
        : "bg-emerald-950/60 text-emerald-300 border-emerald-800/50"
    }`}>
      {type === "risk" ? "⚠" : "✓"} {text}
    </span>
  );
}

function ObjCard({ objection, response }: { objection: string; response: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between p-3 bg-secondary/30 hover:bg-secondary/50 text-left transition-colors"
      >
        <span className="text-sm text-foreground/80 truncate pr-2">💬 "{objection}"</span>
        <ChevronDown className={`w-4 h-4 text-muted-foreground shrink-0 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} className="overflow-hidden">
            <div className="p-3 border-t border-border">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] uppercase tracking-widest text-emerald-400 font-semibold">Your Response</span>
                <CopyBtn text={response} />
              </div>
              <p className="text-sm text-foreground/90 leading-relaxed">"{response}"</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function TodayMove({ text, color }: { text: string; color: string }) {
  if (!text) return null;
  const styles: Record<string, string> = {
    amber:  "bg-amber-950/30 border-amber-800/30 text-amber-100/90",
    indigo: "bg-primary/10 border-primary/20 text-foreground/90",
    purple: "bg-accent/10 border-accent/20 text-foreground/90",
  };
  const labelStyles: Record<string, string> = {
    amber: "text-amber-400", indigo: "text-primary", purple: "text-accent",
  };
  return (
    <div className="mt-auto pt-3">
      <div className="flex items-center justify-between mb-2">
        <p className={`text-[10px] uppercase tracking-widest font-semibold ${labelStyles[color]}`}>Today's Move</p>
        <CopyBtn text={text} />
      </div>
      <div className={`border rounded-lg p-3 ${styles[color]}`}>
        <p className="text-sm leading-relaxed">{text}</p>
      </div>
    </div>
  );
}

// ─── Agent Cards ──────────────────────────────────────────────

function KaiCard({ msg }: { msg: any }) {
  const p: any = msg?.perspective ?? {};
  const verdict:     string   = p.verdict         ?? "FLAG";
  const cls:         string   = p.classification  ?? "MID";
  const confidence:  number   = p.confidence      ?? 0;
  const reasoning:   string   = p.reasoning       ?? "";
  const advice:      string   = p.active_advice   ?? p.recommended_action ?? "";
  const risks:       string[] = p.risk_flags       ?? [];
  const greens:      string[] = p.green_flags      ?? [];
  const col = classColors(cls);

  const vStyle: Record<string, string> = {
    APPROVE: "bg-emerald-950 text-emerald-300 border-emerald-700",
    REJECT:  "bg-red-950 text-red-300 border-red-700",
    FLAG:    "bg-amber-950 text-amber-300 border-amber-700",
  };

  return (
    <div className="glass-card rounded-xl overflow-hidden flex flex-col">
      <div className="flex items-center gap-3 p-4 border-b border-border/50">
        <span className="text-xl">🎯</span>
        <div className="flex-1">
          <p className="text-sm font-semibold text-foreground">Kai</p>
          <p className="text-xs text-muted-foreground">Qualifier</p>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-xs font-bold px-1.5 py-0.5 rounded border ${col.badge}`}>{classEmoji(cls)} {cls.replace("_"," ")}</span>
          <span className={`text-xs px-2 py-0.5 rounded-full border font-bold ${vStyle[verdict] ?? vStyle.FLAG}`}>{verdict}</span>
        </div>
      </div>

      <div className="p-4 flex flex-col gap-4 flex-1">
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">Confidence</span>
          </div>
          <ScoreMeter value={confidence} barClass={col.bar} />
        </div>

        {reasoning && (
          <div>
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold mb-1.5">Assessment</p>
            <p className="text-sm text-foreground/80 leading-relaxed">{reasoning}</p>
          </div>
        )}

        {(risks.length > 0 || greens.length > 0) && (
          <div className="flex flex-wrap gap-1.5">
            {risks.map((f, i)  => <FlagPill key={`r${i}`} text={f} type="risk"  />)}
            {greens.map((f, i) => <FlagPill key={`g${i}`} text={f} type="green" />)}
          </div>
        )}

        <TodayMove text={advice} color="amber" />
      </div>
    </div>
  );
}

function MarshallCard({ msg }: { msg: any }) {
  const p: any = msg?.perspective ?? {};
  const strategy:   string = p.close_strategy  ?? "";
  const opening:    string = p.opening_frame   ?? "";
  const advice:     string = p.active_advice   ?? "";
  const urgency:    string = p.urgency_lever   ?? "";
  const next:       string = p.next_touchpoint ?? "";
  const confidence: number = p.confidence      ?? 0;
  const objections: { objection: string; handler: string }[] = p.objections ?? [];
  const struct: any = p.recommended_structure ?? {};
  const [tab, setTab] = useState<"strategy" | "objections">("strategy");

  return (
    <div className="glass-card rounded-xl overflow-hidden flex flex-col">
      <div className="flex items-center gap-3 p-4 border-b border-border/50">
        <span className="text-xl">💼</span>
        <div className="flex-1">
          <p className="text-sm font-semibold text-foreground">Marshall</p>
          <p className="text-xs text-muted-foreground">Closer</p>
        </div>
        <div className="text-right">
          <p className="text-[10px] text-muted-foreground">Close prob</p>
          <p className="text-sm font-bold text-foreground">{confidence}%</p>
        </div>
      </div>

      <div className="flex border-b border-border/50">
        {(["strategy", "objections"] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`flex-1 py-2 text-xs font-medium capitalize transition-colors ${tab === t ? "text-primary border-b-2 border-primary" : "text-muted-foreground hover:text-foreground"}`}>
            {t}
          </button>
        ))}
      </div>

      <div className="p-4 flex flex-col gap-4 flex-1">
        {tab === "strategy" && (
          <>
            <ScoreMeter value={confidence} barClass="bg-primary" />

            {strategy && (
              <div>
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold mb-1.5">Strategy</p>
                <p className="text-sm text-foreground/80 leading-relaxed">{strategy}</p>
              </div>
            )}

            {(struct.suggested_amount || struct.term_months) && (
              <div className="grid grid-cols-2 gap-2">
                {struct.suggested_amount && (
                  <div className="glass-card rounded-lg p-2.5 text-center">
                    <p className="text-[10px] text-muted-foreground mb-0.5">Suggested</p>
                    <p className="text-sm font-bold text-foreground">${Number(struct.suggested_amount).toLocaleString()}</p>
                  </div>
                )}
                {struct.term_months && (
                  <div className="glass-card rounded-lg p-2.5 text-center">
                    <p className="text-[10px] text-muted-foreground mb-0.5">Term</p>
                    <p className="text-sm font-bold text-foreground">{String(struct.term_months)}</p>
                  </div>
                )}
              </div>
            )}

            {opening && <ScriptBlock label="Open With"     text={opening} />}
            {urgency  && <ScriptBlock label="Urgency Lever" text={urgency} />}

            {next && (
              <div>
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold mb-1">Next Touchpoint</p>
                <p className="text-sm text-foreground/80">{next}</p>
              </div>
            )}

            <TodayMove text={advice} color="indigo" />
          </>
        )}

        {tab === "objections" && (
          <div className="flex flex-col gap-2">
            {objections.length > 0
              ? objections.map((o, i) => <ObjCard key={i} objection={o.objection} response={o.handler} />)
              : <p className="text-sm text-muted-foreground text-center py-6">No objections mapped</p>}
          </div>
        )}
      </div>
    </div>
  );
}

function JaneCard({ msg }: { msg: any }) {
  const p: any = msg?.perspective ?? {};
  const industry:  string = p.industry              ?? "Unknown";
  const risk:      string = p.industry_risk_rating  ?? "MEDIUM";
  const opening:   string = p.opening_line          ?? "";
  const pitch:     string = p.elevator_pitch        ?? "";
  const urgency:   string = p.urgency_line          ?? "";
  const close:     string = p.close_line            ?? "";
  const followUp:  string = p.follow_up_text        ?? "";
  const advice:    string = p.active_advice         ?? "";
  const confidence:number = p.confidence            ?? 0;
  const objections: { objection: string; response: string }[] = p.objection_scripts ?? [];
  const [tab, setTab] = useState<"scripts" | "objections">("scripts");

  const riskStyle: Record<string, string> = {
    LOW:       "bg-emerald-950 text-emerald-300 border-emerald-700",
    MEDIUM:    "bg-amber-950 text-amber-300 border-amber-700",
    HIGH:      "bg-red-950 text-red-300 border-red-700",
    VERY_HIGH: "bg-red-950 text-red-200 border-red-600",
  };

  return (
    <div className="glass-card rounded-xl overflow-hidden flex flex-col">
      <div className="flex items-center gap-3 p-4 border-b border-border/50">
        <span className="text-xl">🧠</span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-foreground">Jane</p>
          <p className="text-xs text-muted-foreground truncate">{industry}</p>
        </div>
        <span className={`text-xs px-2 py-0.5 rounded-full border font-bold shrink-0 ${riskStyle[risk] ?? riskStyle.MEDIUM}`}>
          {risk}
        </span>
      </div>

      <div className="flex border-b border-border/50">
        {(["scripts", "objections"] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`flex-1 py-2 text-xs font-medium capitalize transition-colors ${tab === t ? "text-accent border-b-2 border-accent" : "text-muted-foreground hover:text-foreground"}`}>
            {t}
          </button>
        ))}
      </div>

      <div className="p-4 flex flex-col gap-3 flex-1">
        {tab === "scripts" && (
          <>
            <ScoreMeter value={confidence} barClass="bg-accent" />
            {opening  && <ScriptBlock label="Open With"       text={opening}  />}
            {pitch && (
              <div>
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold mb-1.5">Elevator Pitch</p>
                <p className="text-sm text-foreground/80 leading-relaxed">{pitch}</p>
              </div>
            )}
            {urgency  && <ScriptBlock label="Create Urgency"  text={urgency}  />}
            {close    && <ScriptBlock label="Close Line"      text={close}    />}
            {followUp && <ScriptBlock label="If They Go Silent" text={followUp} />}
            <TodayMove text={advice} color="purple" />
          </>
        )}

        {tab === "objections" && (
          <div className="flex flex-col gap-2">
            {objections.length > 0
              ? objections.map((o, i) => <ObjCard key={i} objection={o.objection} response={o.response} />)
              : <p className="text-sm text-muted-foreground text-center py-6">No scripts generated</p>}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Deal Header ──────────────────────────────────────────────

function DealHeader({
  session, onStageChange, updating, onClose,
}: {
  session: any; onStageChange: (s: string) => void; updating: boolean; onClose: () => void;
}) {
  const { business, amount, stage } = parseDeal(session.question);
  const messages     = Array.isArray(session.messages)     ? session.messages     : [];
  const participants = Array.isArray(session.participants) ? session.participants : [];
  const kaiMsg   = getAgent(messages, "Kai");
  const kaiP: any= kaiMsg?.perspective ?? {};
  const cls: string  = kaiP.classification ?? "";
  const confidence   = kaiP.confidence     ?? 0;
  const col          = classColors(cls);

  const aiDone = participants.filter((p: any) => ["Kai","Marshall","Jane"].includes(p.name)).every((p: any) => p.status === "done");

  return (
    <div className={`glass-card rounded-xl border-l-4 overflow-hidden ${col.accent}`}>
      <div className="p-4 sm:p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-2">
              {cls && <span className="text-xl">{classEmoji(cls)}</span>}
              <h2 className="text-base sm:text-lg font-bold text-foreground truncate">{business}</h2>
              {!aiDone && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-amber-950 text-amber-300 border border-amber-700 animate-pulse">Analyzing...</span>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {cls    && <span className={`text-xs px-2 py-0.5 rounded-full border font-semibold ${col.badge}`}>{cls.replace("_"," ")}</span>}
              {stage  && <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${stageStyle(stage)}`}>{stage}</span>}
              {amount && <span className="text-xs px-2 py-0.5 rounded-full bg-secondary text-muted-foreground">{amount}</span>}
              <span className="text-xs text-muted-foreground">{timeAgo(session.updated_at)}</span>
            </div>
          </div>

          <div className="flex flex-col items-end gap-2 shrink-0">
            <button onClick={onClose} className="text-xs text-muted-foreground hover:text-foreground px-2 py-1 rounded hover:bg-secondary transition-colors">✕</button>
            {confidence > 0 && (
              <div className="text-right">
                <p className="text-2xl font-black text-foreground leading-none">{confidence}</p>
                <p className="text-[10px] text-muted-foreground">/ 100</p>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between mt-4 flex-wrap gap-3">
          <div className="flex flex-wrap gap-1.5">
            {participants.map((p: any, i: number) => (
              <div key={i} className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border ${p.status === "done" ? "border-border bg-secondary text-foreground" : "border-border/40 bg-secondary/20 text-muted-foreground"}`}>
                <span>{p.emoji}</span>
                <span>{p.name}</span>
                {p.status === "done"   && <Check className="w-3 h-3 text-emerald-400" />}
                {p.status === "typing" && <Loader2 className="w-3 h-3 text-accent animate-spin" />}
                {p.status === "waiting"&& <Clock className="w-3 h-3 text-muted-foreground" />}
              </div>
            ))}
          </div>

          <select
            value="" disabled={updating}
            onChange={e => { if (e.target.value) { onStageChange(e.target.value); (e.target as HTMLSelectElement).value = ""; }}}
            className="text-xs bg-secondary border border-border rounded px-2 py-1.5 text-foreground focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-50 cursor-pointer"
          >
            <option value="">{updating ? "Updating..." : "Move stage..."}</option>
            {STAGE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
      </div>
    </div>
  );
}

// ─── Session Row ──────────────────────────────────────────────

function SessionRow({ session, active, onClick }: { session: any; active: boolean; onClick: () => void }) {
  const { business, amount, stage } = parseDeal(session.question);
  const messages     = Array.isArray(session.messages)     ? session.messages     : [];
  const participants = Array.isArray(session.participants) ? session.participants : [];
  const kaiMsg   = getAgent(messages, "Kai");
  const kaiP: any= kaiMsg?.perspective ?? {};
  const cls:string = kaiP.classification ?? "";
  const confidence  = kaiP.confidence    ?? 0;
  const col = classColors(cls);
  const aiDone = participants.filter((p: any) => ["Kai","Marshall","Jane"].includes(p.name)).every((p: any) => p.status === "done");

  return (
    <button
      onClick={onClick}
      className={`w-full text-left p-3 rounded-lg border transition-all ${
        active ? "border-border bg-secondary" : "border-border/40 hover:border-border hover:bg-secondary/50"
      }`}
    >
      <div className="flex items-center gap-2">
        {cls && (
          <span className={`text-[10px] font-bold px-1 py-0.5 rounded border shrink-0 ${col.badge}`}>
            {classEmoji(cls)}
          </span>
        )}
        <span className="text-sm font-medium text-foreground truncate flex-1">{business}</span>
        <div className="flex items-center gap-1.5 shrink-0">
          {!aiDone && <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />}
          {confidence > 0 && <span className="text-xs text-muted-foreground tabular-nums">{confidence}%</span>}
        </div>
      </div>
      <div className="flex items-center gap-2 mt-1.5">
        {stage  && <span className={`text-[10px] px-1.5 py-0.5 rounded ${stageStyle(stage)}`}>{stage}</span>}
        {amount && <span className="text-[10px] text-muted-foreground">{amount}</span>}
        <span className="text-[10px] text-muted-foreground ml-auto">{timeAgo(session.updated_at)}</span>
      </div>
    </button>
  );
}

// ─── Main Component ───────────────────────────────────────────

const Council = () => {
  const { sessions, loading } = useCouncilSessions();
  const [selected, setSelected]   = useState<any>(null);
  const [updating, setUpdating]   = useState(false);
  const [search,   setSearch]     = useState("");
  const [filter,   setFilter]     = useState("ALL");
  const [showDead, setShowDead]   = useState(false);

  // Keep selected fresh when sessions update (realtime)
  const selectedId = selected?.id;
  useEffect(() => {
    if (!selectedId) return;
    const live = sessions.find((s: any) => s.id === selectedId);
    if (live) setSelected(live);
  }, [sessions, selectedId]);

  const handleStageChange = useCallback(async (stage: string) => {
    if (!selected) return;
    const m = selected.question.match(/^Deal review:\s*(.+?)\s*[—–-]/);
    const business = m ? m[1].trim() : null;
    if (!business) { toast.error("Could not identify deal"); return; }
    setUpdating(true);
    const { error } = await supabase
      .from("deals")
      .update({ pending_stage: stage, pending_stage_at: new Date().toISOString() })
      .eq("business_name", business);
    setUpdating(false);
    if (error) { toast.error(`Update failed: ${error.message}`); return; }
    toast.success(`Stage set to "${stage}" — syncing to sheet...`);
  }, [selected]);

  // Count by classification
  const counts: Record<string, number> = {};
  for (const s of sessions) {
    const kaiMsg = getAgent(Array.isArray(s.messages) ? s.messages : [], "Kai");
    const cls: string = (kaiMsg?.perspective as any)?.classification ?? "UNKNOWN";
    counts[cls] = (counts[cls] ?? 0) + 1;
  }

  const deadCount = sessions.filter(isDead).length;

  // Active first (sorted by confidence desc), dead pushed to bottom
  const sorted = [...sessions].sort((a, b) => {
    const aD = isDead(a), bD = isDead(b);
    if (aD && !bD) return 1;
    if (!aD && bD) return -1;
    const aK = getAgent(Array.isArray(a.messages) ? a.messages : [], "Kai");
    const bK = getAgent(Array.isArray(b.messages) ? b.messages : [], "Kai");
    return ((bK?.perspective as any)?.confidence ?? 0) - ((aK?.perspective as any)?.confidence ?? 0);
  });

  const filtered = sorted.filter((s: any) => {
    const { business } = parseDeal(s.question);
    const matchSearch = business.toLowerCase().includes(search.toLowerCase());
    const dead = isDead(s);
    if (filter === "TRASH") return matchSearch && dead;
    if (filter !== "ALL") {
      const kaiMsg = getAgent(Array.isArray(s.messages) ? s.messages : [], "Kai");
      const cls: string = (kaiMsg?.perspective as any)?.classification ?? "";
      return matchSearch && cls === filter && !dead;
    }
    // ALL: hide dead unless user explicitly reveals them
    if (!showDead && dead) return false;
    return matchSearch;
  });

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="text-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto mb-3" />
        <p className="text-sm text-muted-foreground">Loading council sessions...</p>
      </div>
    </div>
  );

  if (sessions.length === 0) return (
    <div className="flex items-center justify-center h-64">
      <p className="text-sm text-muted-foreground">No council sessions found.</p>
    </div>
  );

  return (
    <div className="flex flex-col lg:flex-row gap-4 items-start">

      {/* ── Sidebar ── (hidden on mobile when a deal is selected) */}
      <div className={`w-full lg:w-60 lg:shrink-0 flex flex-col gap-3 lg:sticky lg:top-24 ${selected ? "hidden lg:flex" : "flex"}`}>

        {/* Classification filter chips */}
        <div className="grid grid-cols-4 gap-1">
          {(["WHALE","MID","CONTROLLED_RISK","TRASH"] as const).map(c => {
            const col = classColors(c);
            const active = filter === c;
            return (
              <button key={c} onClick={() => setFilter(active ? "ALL" : c)}
                className={`flex flex-col items-center py-2 rounded-lg border transition-all ${active ? `border-border bg-secondary` : "border-border/40 hover:bg-secondary/50"}`}>
                <span className="text-sm">{classEmoji(c)}</span>
                <span className={`text-sm font-bold ${active ? col.text : "text-foreground"}`}>{counts[c] ?? 0}</span>
              </button>
            );
          })}
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
          <input
            type="text" placeholder="Search deals..." value={search} onChange={e => setSearch(e.target.value)}
            className="w-full bg-secondary border border-border rounded-lg pl-8 pr-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>

        {/* Deal list */}
        <div className="flex flex-col gap-1.5 max-h-[70vh] lg:max-h-[65vh] overflow-y-auto pr-0.5">
          {filtered.length === 0
            ? <p className="text-sm text-muted-foreground text-center py-8">No deals found</p>
            : filtered.map((s: any) => (
                <SessionRow key={s.id} session={s} active={selected?.id === s.id} onClick={() => setSelected(s)} />
              ))
          }
          {filter === "ALL" && deadCount > 0 && (
            <button
              onClick={() => setShowDead(d => !d)}
              className="w-full text-center text-xs text-muted-foreground hover:text-foreground py-2 border-t border-border/30 mt-1 transition-colors"
            >
              {showDead ? "Hide dead deals" : `+ ${deadCount} dead deal${deadCount !== 1 ? "s" : ""}`}
            </button>
          )}
        </div>
      </div>

      {/* ── Main Panel ── (hidden on mobile when no deal selected) */}
      <div className={`flex-1 min-w-0 w-full flex-col gap-4 ${selected ? "flex" : "hidden lg:flex"}`}>
        {selected ? (
          <>
            {/* Mobile back button */}
            <button
              onClick={() => setSelected(null)}
              className="lg:hidden flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground px-2 py-1.5 rounded hover:bg-secondary transition-colors self-start"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to deals
            </button>

            <DealHeader session={selected} onStageChange={handleStageChange} updating={updating} onClose={() => setSelected(null)} />

            {(() => {
              const messages = Array.isArray(selected.messages) ? selected.messages : [];
              const kaiMsg      = getAgent(messages, "Kai");
              const marshallMsg = getAgent(messages, "Marshall");
              const janeMsg     = getAgent(messages, "Jane");

              if (!kaiMsg?.perspective && !marshallMsg?.perspective && !janeMsg?.perspective) return (
                <div className="flex items-center justify-center h-40 glass-card rounded-xl">
                  <div className="text-center">
                    <Loader2 className="w-6 h-6 text-primary animate-spin mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">Council is analyzing this deal...</p>
                    <p className="text-xs text-muted-foreground/60 mt-1">Kai, Marshall, and Jane are reviewing</p>
                  </div>
                </div>
              );

              return (
                <motion.div
                  className="grid grid-cols-1 lg:grid-cols-3 gap-4"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25 }}
                >
                  {kaiMsg      && <KaiCard      msg={kaiMsg}      />}
                  {marshallMsg && <MarshallCard msg={marshallMsg} />}
                  {janeMsg     && <JaneCard     msg={janeMsg}     />}
                </motion.div>
              );
            })()}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center min-h-[400px] glass-card rounded-xl">
            <span className="text-4xl mb-4">⚖️</span>
            <h3 className="text-base font-semibold text-foreground mb-2">Select a Deal</h3>
            <p className="text-sm text-muted-foreground text-center max-w-xs">
              Pick a deal from the sidebar to see Kai's qualification, Marshall's close strategy, and Jane's word-for-word scripts.
            </p>
          </div>
        )}
      </div>

    </div>
  );
};

export default Council;

