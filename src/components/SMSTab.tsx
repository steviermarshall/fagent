import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface SmsRow {
  id: string;
  received_at: string;
  from_number: string;
  message_body: string;
  ai_response: string | null;
  status: "pending" | "responded" | "error";
  conversation_id: string | null;
  hot_lead?: boolean | null;
  reply_sent?: boolean | null;
  reply_text?: string | null;
}

const FN_BASE = "https://gdbprswowbqndmcunbyj.supabase.co/functions/v1";
const FN_KEY = "sb_publishable_ojDXPF3aH162F74FjaPJDA_Cf0dT_zf";

function StatusBadge({ status }: { status: SmsRow["status"] }) {
  const map = {
    pending: { label: "Pending", cls: "bg-yellow-500/20 text-yellow-300 border border-yellow-500/40" },
    responded: { label: "Responded", cls: "bg-green-500/20 text-green-300 border border-green-500/40" },
    error: { label: "Error", cls: "bg-red-500/20 text-red-300 border border-red-500/40" },
  };
  const { label, cls } = map[status] ?? map.pending;
  return <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${cls}`}>{label}</span>;
}

function fmtPhone(raw: string) {
  const d = raw?.replace(/\D/g, "") ?? "";
  if (d.length === 11 && d[0] === "1") return `+1 (${d.slice(1, 4)}) ${d.slice(4, 7)}-${d.slice(7)}`;
  if (d.length === 10) return `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}`;
  return raw || "Unknown";
}

function fmtTime(iso: string) {
  if (!iso) return "";
  const d = new Date(iso);
  const diffMin = Math.floor((Date.now() - d.getTime()) / 60000);
  if (diffMin < 1) return "just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return `${diffH}h ago`;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default function SMSTab() {
  const [rows, setRows] = useState<SmsRow[]>([]);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("sms_inbound")
      .select("id, received_at, from_number, message_body, ai_response, status, conversation_id")
      .order("received_at", { ascending: false })
      .limit(100)
      .then(({ data, error }) => {
        if (error) console.error("SMSTab fetch error:", error);
        setRows((data as SmsRow[]) ?? []);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    const channel = supabase
      .channel("sms_inbound_realtime")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "sms_inbound" }, (payload) =>
        setRows((prev) => [payload.new as SmsRow, ...prev])
      )
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "sms_inbound" }, (payload) =>
        setRows((prev) => prev.map((r) => (r.id === (payload.new as SmsRow).id ? (payload.new as SmsRow) : r)))
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const total = rows.length;
  const pending = rows.filter((r) => r.status === "pending").length;
  const responded = rows.filter((r) => r.status === "responded").length;

  return (
    <div className="glass-card p-4 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <span className="text-2xl">💬</span>
          <h2 className="text-lg sm:text-xl font-semibold tracking-tight">SMS INBOX</h2>
          <span className="text-xs text-muted-foreground hidden sm:inline">— Sinch → Claude AI</span>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span className="px-2 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">
            {total} total
          </span>
          {pending > 0 && (
            <span className="px-2 py-1 rounded-full bg-yellow-500/20 text-yellow-300 border border-yellow-500/40">
              {pending} pending
            </span>
          )}
          {responded > 0 && (
            <span className="px-2 py-1 rounded-full bg-green-500/20 text-green-300 border border-green-500/40">
              {responded} responded
            </span>
          )}
        </div>
      </div>

      <div className="space-y-2">
        {loading && <p className="text-sm text-muted-foreground p-4 text-center">Loading...</p>}
        {!loading && rows.length === 0 && (
          <div className="p-8 text-center">
            <p className="text-sm text-muted-foreground">No inbound SMS yet.</p>
            <p className="text-xs text-muted-foreground/70 mt-1">Waiting for Sinch webhooks...</p>
          </div>
        )}
        {rows.map((row) => {
          const isOpen = expanded === row.id;
          return (
            <div key={row.id} className="rounded-lg border border-border/50 bg-card/40 overflow-hidden">
              <button
                className="w-full p-3 flex items-start gap-3 hover:bg-accent/30 transition-colors text-left"
                onClick={() => setExpanded(isOpen ? null : row.id)}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="font-mono text-xs sm:text-sm font-medium">{fmtPhone(row.from_number)}</span>
                    <StatusBadge status={row.status} />
                  </div>
                  <p className="text-sm text-foreground/80 truncate">{row.message_body}</p>
                </div>
                <div className="flex flex-col items-end gap-1 shrink-0">
                  <span className="text-[10px] text-muted-foreground whitespace-nowrap">{fmtTime(row.received_at)}</span>
                  <span className={`text-xs transition-transform ${isOpen ? "rotate-180" : ""}`}>▼</span>
                </div>
              </button>

              {isOpen && (
                <div className="border-t border-border/50 p-4 space-y-4 bg-background/30">
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground mb-1">
                      📥 Inbound — {fmtPhone(row.from_number)}
                    </p>
                    <p className="text-sm whitespace-pre-wrap">{row.message_body}</p>
                    <p className="text-[10px] text-muted-foreground mt-1">
                      {row.received_at
                        ? new Date(row.received_at).toLocaleString("en-US", {
                            month: "short",
                            day: "numeric",
                            hour: "numeric",
                            minute: "2-digit",
                          })
                        : ""}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-semibold text-muted-foreground mb-1">
                      🤖 AI Draft — Marshall, Tip Top Capital
                    </p>
                    {row.status === "pending" ? (
                      <p className="text-sm text-yellow-300/80 italic">Generating response…</p>
                    ) : row.status === "error" ? (
                      <p className="text-sm text-red-300 whitespace-pre-wrap">{row.ai_response}</p>
                    ) : (
                      <p className="text-sm whitespace-pre-wrap">{row.ai_response}</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-4 pt-3 border-t border-border/30 flex items-center justify-between text-[10px] text-muted-foreground">
        <span className="font-mono truncate">Webhook: .../functions/v1/sinch-webhook</span>
        <span className="flex items-center gap-1">
          Realtime <span className="text-green-400">●</span>
        </span>
      </div>
    </div>
  );
}
