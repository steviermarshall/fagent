import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, Check, Loader2, Clock } from "lucide-react";
import { councilSessions } from "@/data/mockData";

const statusIcons: Record<string, React.ReactNode> = {
  done: <Check className="w-3 h-3 text-primary" />,
  typing: <Loader2 className="w-3 h-3 text-accent animate-spin" />,
  waiting: <Clock className="w-3 h-3 text-muted-foreground" />,
};

const sessionStatusColors: Record<string, string> = {
  active: "bg-accent/15 text-accent border-accent/30",
  concluded: "bg-primary/15 text-primary border-primary/30",
  pending: "bg-warning/15 text-warning border-warning/30",
};

const Council = () => {
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <div className="space-y-4">
      {councilSessions.map((session, i) => (
        <motion.div
          key={session.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
          className="glass-card overflow-hidden"
        >
          <button
            onClick={() => setExpanded(expanded === session.id ? null : session.id)}
            className="w-full p-5 flex items-start gap-4 text-left hover:bg-secondary/30 transition-colors"
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <Badge variant="outline" className={`text-xs border ${sessionStatusColors[session.status]}`}>
                  {session.status}
                </Badge>
              </div>
              <h3 className="text-sm font-semibold text-foreground mb-3">{session.question}</h3>
              <div className="flex flex-wrap gap-2">
                {session.participants.map((p) => (
                  <div key={p.name} className="flex items-center gap-1.5 glass-card px-2 py-1 rounded-full">
                    <span className="text-sm">{p.emoji}</span>
                    <span className="text-xs text-muted-foreground">{p.name}</span>
                    <span className="text-xs font-mono text-muted-foreground">{p.sent}/{p.limit}</span>
                    {statusIcons[p.status]}
                  </div>
                ))}
              </div>
            </div>
            <motion.div animate={{ rotate: expanded === session.id ? 180 : 0 }} transition={{ duration: 0.2 }}>
              <ChevronDown className="w-5 h-5 text-muted-foreground" />
            </motion.div>
          </button>

          <AnimatePresence>
            {expanded === session.id && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="px-5 pb-5 space-y-3 border-t border-border pt-4">
                  {session.messages.map((msg, mi) => (
                    <motion.div
                      key={mi}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: mi * 0.08 }}
                      className="flex items-start gap-3"
                    >
                      <span className="text-lg">{msg.agentEmoji}</span>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-foreground">{msg.agentName}</span>
                          <span className="text-xs font-mono text-muted-foreground">#{msg.messageNumber}</span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{msg.message}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      ))}
    </div>
  );
};

export default Council;
