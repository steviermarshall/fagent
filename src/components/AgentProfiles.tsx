import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAgents } from "@/hooks/useSupabaseData";

const statusColors: Record<string, string> = {
  active: "bg-primary text-primary-foreground",
  idle: "bg-warning text-warning-foreground",
  error: "bg-destructive text-destructive-foreground",
  offline: "bg-muted text-muted-foreground",
};

const AgentProfiles = () => {
  const { agents, loading } = useAgents();

  if (loading) return <p className="text-sm text-muted-foreground">Loading agents...</p>;
  if (agents.length === 0) return <p className="text-sm text-muted-foreground">No agents found.</p>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      {agents.map((agent, i) => (
        <motion.div
          key={agent.agent_id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1, duration: 0.4 }}
          className="glass-card-hover p-6"
        >
          <div className="flex items-center gap-4 mb-4">
            <div
              className="w-14 h-14 rounded-xl flex items-center justify-center text-3xl"
              style={{ backgroundColor: `${agent.ring_color || "#10b981"}15`, boxShadow: `0 0 20px ${agent.ring_color || "#10b981"}30` }}
            >
              {agent.emoji}
            </div>
            <div>
              <h3 className="text-lg font-bold font-heading text-foreground">{agent.name}</h3>
              <p className="text-sm text-muted-foreground">{agent.type || "Agent"}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 mb-4">
            <Badge variant="outline" className="text-xs border-border text-muted-foreground">{agent.type || "Agent"}</Badge>
            <Badge className={`text-xs ${statusColors[agent.status] || statusColors.offline}`}>{agent.status || "offline"}</Badge>
          </div>

          {agent.current_activity && (
            <p className="text-sm text-muted-foreground mb-4">{agent.current_activity}</p>
          )}

          {agent.skills && agent.skills.length > 0 && (
            <div className="mb-4">
              <p className="text-xs text-muted-foreground mb-2">Skills</p>
              <div className="flex flex-wrap gap-1.5">
                {agent.skills.map((skill: string) => (
                  <span key={skill} className="text-xs px-2 py-0.5 rounded-full border border-border text-muted-foreground">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          <Button variant="outline" className="w-full border-border text-foreground hover:bg-secondary">
            View Details
          </Button>
        </motion.div>
      ))}
    </div>
  );
};

export default AgentProfiles;
