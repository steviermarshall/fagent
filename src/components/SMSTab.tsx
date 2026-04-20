import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Flame, Send, Pencil, ChevronDown } from "lucide-react";

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
}

const SUPABASE_FN_URL = "https://gdbprswowbqndmcunbyj.supabase.co/functions/v1";
const ANON_KEY = "sb_publishable_ojDXPF3aH162F74FjaPJDA_Cf0dT_zf";

function StatusBadge({ status }: { status: SmsRow["status"] }) {
  const map = {
    pending:   { label: "Pending",   cls: "pill pill-warning" },
    responded: { label: "Responded", cls: "pill pill-success" },
    error:     { label: "Error",     cls: "pill pill-danger" },
  } as const;
  const { label, cls } = map[status] ?? map.pending;
  return <span className={`${cls} animate-badge-fade`}>{label}</span>;
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

function rowAccent(row: SmsRow): string {
  if (row.hot_lead) return "accent-l-danger";
  if (row.reply_sent || row.status === "responded") return "accent-l-success";
  if (row.status === "pending") return "accent-l-warning";
  return "accent-l-info";
}

export default function SMSTab() {
  const [rows, setRows] = useState<SmsRow[]>([]);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Record<string, string>>({});
  const [sending, setSending] = useState<Record<string, boolean>>({});
  const [flagging, setFlagging] = useState<Record<string, boolean>>({});
  const newIds = useRef<Set<string>>(new Set());

  useEffect(() => {
    supabase
      .from("sms_inbound")
      .select("id, received_at, from_number, message_body, ai_response, status, conversation_id, hot_lead, reply_sent")
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
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "sms_inbound" }, (payload) => {
        const row = payload.new as SmsRow;
        newIds.current.add(row.id);
        setRows((prev) => [row, ...prev]);
      })
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "sms_inbound" }, (payload) =>
        setRows((prev) => prev.map((r) => (r.id === (payload.new as SmsRow).id ? (payload.new as SmsRow) : r)))
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  async function flagHotLead(rowId: string) {
    setFlagging((p) => ({ ...p, [rowId]: true }));
    try {
      const res = await fetch(`${SUPABASE_FN_URL}/flag-hot-lead`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${ANON_KEY}`, apikey: ANON_KEY },
        body: JSON.stringify({ row_id: rowId }),
      });
      if (!res.ok) throw new Error(await res.text());
      setRows((prev) => prev.map((r) => (r.id === rowId ? { ...r, hot_lead: true } : r)));
      toast.success("🔥 Marked as hot lead");
    } catch (e) {
      console.error(e);
      toast.error("Failed to flag hot lead");
    } finally {
      setFlagging((p) => ({ ...p, [rowId]: false }));
    }
  }

  async function sendReply(row: SmsRow) {
    const message = editing[row.id];
    if (!message?.trim()) {
      toast.error("Message is empty");
      return;
    }
    setSending((p) => ({ ...p, [row.id]: true }));
    try {
      const res = await fetch(`${SUPABASE_FN_URL}/sms-reply`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${ANON_KEY}`, apikey: ANON_KEY },
        body: JSON.stringify({ row_id: row.id, to_number: row.from_number, message }),
      });
      if (!res.ok) throw new Error(await res.text());
      setRows((prev) => prev.map((r) => (r.id === row.id ? { ...r, reply_sent: true, ai_response: message } : r)));
      toast.success("✅ Reply sent");
    } catch (e) {
      console.error(e);
      toast.error("Failed to send reply");
    } finally {
      setSending((p) => ({ ...p, [row.id]: false }));
    }
  }

  const total = rows.length;
  const pending = rows.filter((r) => r.status === "pending").length;
  const responded = rows.filter((r) => r.status === "responded").length;
  const hot = rows.filter((r) => r.hot_lead).length;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">SMS Inbox</h2>
          <p className="text-xs text-muted-foreground mt-0.5">Sinch → Claude · live replies</p>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span className="pill pill-info nums">{total} total</span>
          {pending > 0   && <span className="pill pill-warning nums">{pending} pending</span>}
          {responded > 0 && <span className="pill pill-success nums">{responded} responded</span>}
          {hot > 0       && <span className="pill pill-danger nums">{hot} hot</span>}
        </div>
      </div>

      {/* Cards */}
      <div className="space-y-2.5">
        {loading && <p className="text-sm text-muted-foreground p-4 text-center">Loading…</p>}

        {!loading && rows.length === 0 && (
          <div className="empty-state-border rounded-2xl p-10 text-center">
            <div className="w-12 h-12 mx-auto rounded-xl bg-gradient-to-br from-primary to-council flex items-center justify-center text-white font-extrabold text-lg mb-4">
              D
            </div>
            <p className="text-sm font-semibold text-foreground">Waiting for replies.</p>
            <p className="text-xs text-muted-foreground mt-1">Your outreach is running.</p>
          </div>
        )}

        {rows.map((row) => {
          const isOpen = expanded === row.id;
          const isEditing = editing[row.id] !== undefined;
          const replied = !!row.reply_sent;
          const isNew = newIds.current.has(row.id);

          return (
            <div
              key={row.id}
              className={`glass-card-hover ${rowAccent(row)} ${isNew ? "animate-slide-in-down" : "animate-fade-in"}`}
            >
              <button
                className="w-full p-4 flex items-start gap-3 text-left"
                onClick={() => setExpanded(isOpen ? null : row.id)}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                    <span className="font-mono text-xs sm:text-sm font-semibold nums">{fmtPhone(row.from_number)}</span>
                    <StatusBadge status={row.status} />
                    {row.hot_lead && (
                      <span className="pill pill-danger animate-badge-fade">
                        <Flame className="w-3 h-3" /> HOT
                      </span>
                    )}
                    {replied && (
                      <span className="pill pill-success animate-badge-fade">Replied</span>
                    )}
                  </div>
                  <p className="text-sm text-foreground/85 truncate font-mono">{row.message_body}</p>
                </div>
                <div className="flex flex-col items-end gap-1.5 shrink-0">
                  <span className="text-[10px] font-mono text-muted-foreground whitespace-nowrap nums">
                    {fmtTime(row.received_at)}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-muted-foreground transition-transform ${isOpen ? "rotate-180" : ""}`}
                  />
                </div>
              </button>

              {isOpen && (
                <div className="border-t border-hairline p-4 space-y-4 bg-surface-1/40 animate-fade-in">
                  <div>
                    <p className="text-[10px] font-semibold tracking-wider uppercase text-muted-foreground mb-1.5">
                      Inbound · {fmtPhone(row.from_number)}
                    </p>
                    <p className="text-sm font-mono whitespace-pre-wrap text-foreground/90">{row.message_body}</p>
                    <p className="text-[10px] font-mono text-muted-foreground mt-2 nums">
                      {row.received_at
                        ? new Date(row.received_at).toLocaleString("en-US", {
                            month: "short", day: "numeric", hour: "numeric", minute: "2-digit",
                          })
                        : ""}
                    </p>
                  </div>

                  <div>
                    <p className="text-[10px] font-semibold tracking-wider uppercase text-council mb-1.5">
                      AI Draft · Marshall, Tip Top Capital
                    </p>
                    {row.status === "pending" ? (
                      <p className="text-sm text-warning italic font-mono">Generating response…</p>
                    ) : isEditing ? (
                      <textarea
                        value={editing[row.id]}
                        onChange={(e) => setEditing((p) => ({ ...p, [row.id]: e.target.value }))}
                        disabled={replied}
                        className="w-full min-h-[100px] rounded-md border border-hairline bg-surface-1 p-3 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/40 disabled:opacity-60"
                      />
                    ) : (
                      <p className={`text-sm font-mono whitespace-pre-wrap ${row.status === "error" ? "text-destructive" : "text-foreground/90"}`}>
                        {row.ai_response}
                      </p>
                    )}

                    <div className="flex flex-wrap gap-2 mt-3">
                      {!row.hot_lead && (
                        <button
                          onClick={() => flagHotLead(row.id)}
                          disabled={flagging[row.id]}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md bg-destructive/10 text-destructive border border-destructive/40 hover:bg-destructive/20 transition-colors disabled:opacity-50"
                        >
                          <Flame className="w-3.5 h-3.5" />
                          {flagging[row.id] ? "Flagging…" : "Hot Lead"}
                        </button>
                      )}

                      {!isEditing && !replied && row.status !== "pending" && (
                        <button
                          onClick={() => setEditing((p) => ({ ...p, [row.id]: row.ai_response ?? "" }))}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md bg-info/10 text-info border border-info/40 hover:bg-info/20 transition-colors"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                          Edit & Send
                        </button>
                      )}

                      {isEditing && !replied && (
                        <button
                          onClick={() => sendReply(row)}
                          disabled={sending[row.id]}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md bg-primary/15 text-primary border border-primary/40 hover:bg-primary/25 transition-colors disabled:opacity-50"
                        >
                          <Send className="w-3.5 h-3.5" />
                          {sending[row.id] ? "Sending…" : "Send"}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="flex items-center justify-between text-[10px] font-mono text-muted-foreground px-1">
        <span className="truncate">Webhook: …/functions/v1/sinch-webhook</span>
        <span className="flex items-center gap-1.5">
          Realtime <span className="live-dot" />
        </span>
      </div>
    </div>
  );
}
