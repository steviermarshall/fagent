import { motion } from "framer-motion";
import { Activity, CheckCircle, Zap, Clock } from "lucide-react";
import { useEffect, useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAgents, useLogs } from "@/hooks/useSupabaseData";
import { formatDistanceToNow } from "date-fns";

const MetricCard = ({ icon: Icon, label, value, trend, delay }: { icon: any; label: string; value: number; trend: string; delay: number }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const duration = 1200;
    const step = Math.ceil(value / (duration / 16));
    const timer = setInterval(() => {
      start += step;
      if (start >= value) {
        setCount(value);
        clearInterval(timer);
      } else {
        setCount(start);
      }
    }, 16);
    return () => clearInterval(timer);
  }, [value]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      className="glass-card-hover p-5"
    >
      <div className="flex items-start justify-between">
        <div className="p-2 rounded-lg bg-primary/10 glow-emerald">
          <Icon className="w-5 h-5 text-primary" />
        </div>
        <span className="text-xs font-mono text-primary">{trend}</span>
      </div>
      <p className="mt-4 text-3xl font-bold font-heading text-foreground">{count.toLocaleString()}</p>
      <p className="text-sm text-muted-foreground mt-1">{label}</p>
    </motion.div>
  );
};

const statusColors: Record<string, string> = {
  active: "bg-primary",
  idle: "bg-warning",
  error: "bg-destructive",
  offline: "bg-muted-foreground",
};

const CommandDeck = () => {
  const { agents, loading: agentsLoading } = useAgents();
  const { logs, loading: logsLoading } = useLogs();

  const activeCount = agents.filter((a) => a.status === "active").length;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard icon={Zap} label="Log Entries" value={logs.length} trend="Live" delay={0} />
        <MetricCard icon={Activity} label="Active Agents" value={activeCount} trend={`${agents.length} total`} delay={0.05} />
        <MetricCard icon={CheckCircle} label="Total Agents" value={agents.length} trend="Polling 30s" delay={0.1} />
        <MetricCard icon={Clock} label="Recent Logs" value={Math.min(logs.length, 100)} trend="Last 100" delay={0.15} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          className="lg:col-span-3 glass-card p-5"
        >
          <h3 className="text-sm font-semibold text-foreground mb-4">Recent Activity</h3>
          {logsLoading ? (
            <p className="text-sm text-muted-foreground">Loading...</p>
          ) : logs.length === 0 ? (
            <p className="text-sm text-muted-foreground">No activity logs yet.</p>
          ) : (
            <ScrollArea className="h-[320px]">
              <div className="space-y-3 pr-4">
                {logs.slice(0, 20).map((log, i) => (
                  <motion.div
                    key={log.id}
                    initial={{ opacity: 0, x: -15 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + i * 0.05 }}
                    className="flex items-start gap-3 p-3 rounded-lg hover:bg-secondary/50 transition-colors"
                  >
                    <span className="text-lg">{log.agent_emoji || "🤖"}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-foreground">{log.message}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {log.agent_name} · {log.timestamp ? formatDistanceToNow(new Date(log.timestamp), { addSuffix: true }) : ""}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </ScrollArea>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.25, duration: 0.4 }}
          className="lg:col-span-2 glass-card p-5"
        >
          <h3 className="text-sm font-semibold text-foreground mb-4">Agent Status</h3>
          {agentsLoading ? (
            <p className="text-sm text-muted-foreground">Loading...</p>
          ) : agents.length === 0 ? (
            <p className="text-sm text-muted-foreground">No agents found.</p>
          ) : (
            <div className="space-y-3">
              {agents.map((agent, i) => (
                <motion.div
                  key={agent.agent_id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 + i * 0.08 }}
                  className="glass-card p-4"
                >
                  <div className="flex items-center gap-3">
                    <span className="relative flex h-2.5 w-2.5">
                      {agent.status === "active" && (
                        <span className="animate-pulse-dot absolute inline-flex h-full w-full rounded-full opacity-75"
                          style={{ backgroundColor: agent.ring_color || "#10b981" }} />
                      )}
                      <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${statusColors[agent.status] || "bg-muted-foreground"}`} />
                    </span>
                    <span className="text-lg">{agent.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground">{agent.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{agent.current_activity || "No activity"}</p>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2 ml-8">
                    Last seen: {agent.last_seen ? formatDistanceToNow(new Date(agent.last_seen), { addSuffix: true }) : "never"}
                  </p>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default CommandDeck;
