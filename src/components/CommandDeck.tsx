import { motion } from "framer-motion";
import { Activity, CheckCircle, Zap, Clock } from "lucide-react";
import { useEffect, useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { agents, activityFeed } from "@/data/mockData";

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
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard icon={Zap} label="Tasks Completed" value={2612} trend="+12%" delay={0} />
        <MetricCard icon={Activity} label="Active Agents" value={3} trend="All Online" delay={0.05} />
        <MetricCard icon={CheckCircle} label="Success Rate" value={98} trend="+2.1%" delay={0.1} />
        <MetricCard icon={Clock} label="Avg Response Time" value={142} trend="-8ms" delay={0.15} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          className="lg:col-span-3 glass-card p-5"
        >
          <h3 className="text-sm font-semibold text-foreground mb-4">Recent Activity</h3>
          <ScrollArea className="h-[320px]">
            <div className="space-y-3 pr-4">
              {activityFeed.map((event, i) => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, x: -15 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + i * 0.05 }}
                  className="flex items-start gap-3 p-3 rounded-lg hover:bg-secondary/50 transition-colors"
                >
                  <span className="text-lg">{event.agentEmoji}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground">{event.action}</p>
                    <p className="text-xs text-muted-foreground mt-1">{event.timestamp}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </ScrollArea>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.25, duration: 0.4 }}
          className="lg:col-span-2 glass-card p-5"
        >
          <h3 className="text-sm font-semibold text-foreground mb-4">Agent Status</h3>
          <div className="space-y-3">
            {agents.map((agent, i) => (
              <motion.div
                key={agent.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 + i * 0.08 }}
                className="glass-card p-4"
              >
                <div className="flex items-center gap-3">
                  <span className="relative flex h-2.5 w-2.5">
                    {agent.status === "active" && (
                      <span className="animate-pulse-dot absolute inline-flex h-full w-full rounded-full opacity-75"
                        style={{ backgroundColor: agent.accentColor }} />
                    )}
                    <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${statusColors[agent.status]}`} />
                  </span>
                  <span className="text-lg">{agent.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">{agent.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{agent.currentActivity}</p>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-2 ml-8">Last seen: {agent.lastSeen}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default CommandDeck;
