import { motion } from "framer-motion";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useLogs } from "@/hooks/useSupabaseData";
import { format } from "date-fns";

const categoryColors: Record<string, string> = {
  observation: "bg-primary/15 text-primary border-primary/30",
  general: "bg-muted text-muted-foreground border-border",
  reminder: "bg-warning/15 text-warning border-warning/30",
  fyi: "bg-accent/15 text-accent border-accent/30",
};

const AILog = () => {
  const [filter, setFilter] = useState("all");
  const { logs, loading } = useLogs();

  const filtered = filter === "all" ? logs : logs.filter((e) => e.category === filter);

  if (loading) return <p className="text-sm text-muted-foreground">Loading logs...</p>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">Agent Logs</h3>
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-40 glass-card border-border text-foreground">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="glass-card border-border">
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="observation">Observation</SelectItem>
            <SelectItem value="general">General</SelectItem>
            <SelectItem value="reminder">Reminder</SelectItem>
            <SelectItem value="fyi">FYI</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {filtered.length === 0 ? (
        <p className="text-sm text-muted-foreground">No log entries found.</p>
      ) : (
        <ScrollArea className="h-[500px]">
          <div className="space-y-3 pr-4">
            {filtered.map((entry, i) => (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="glass-card-hover p-4"
              >
                <div className="flex items-start gap-3">
                  <span className="text-lg mt-0.5">{entry.agent_emoji || "🤖"}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="text-sm font-medium text-foreground">{entry.agent_name}</span>
                      <Badge variant="outline" className={`text-xs border ${categoryColors[entry.category] || categoryColors.general}`}>
                        {entry.category || "general"}
                      </Badge>
                      <span className="text-xs text-muted-foreground font-mono ml-auto">
                        {entry.timestamp ? format(new Date(entry.timestamp), "HH:mm") : ""}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">{entry.message}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </ScrollArea>
      )}
    </div>
  );
};

export default AILog;
