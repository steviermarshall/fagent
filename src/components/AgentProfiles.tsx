import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { agents } from "@/data/mockData";

const statusColors: Record<string, string> = {
  active: "bg-primary text-primary-foreground",
  idle: "bg-warning text-warning-foreground",
  error: "bg-destructive text-destructive-foreground",
  offline: "bg-muted text-muted-foreground",
};

const AgentProfiles = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      {agents.map((agent, i) => (
        <motion.div
          key={agent.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1, duration: 0.4 }}
          className="glass-card-hover p-6"
        >
          <div className="flex items-center gap-4 mb-4">
            <div
              className="w-14 h-14 rounded-xl flex items-center justify-center text-3xl"
              style={{ backgroundColor: `${agent.accentColor}15`, boxShadow: `0 0 20px ${agent.accentColor}30` }}
            >
              {agent.emoji}
            </div>
            <div>
              <h3 className="text-lg font-bold font-heading text-foreground">{agent.name}</h3>
              <p className="text-sm text-muted-foreground">{agent.role}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 mb-4">
            <Badge variant="outline" className="text-xs border-border text-muted-foreground">{agent.type}</Badge>
            <Badge className={`text-xs ${statusColors[agent.status]}`}>{agent.status}</Badge>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="glass-card p-3 text-center">
              <p className="text-2xl font-bold font-heading text-foreground">{agent.tasksCompleted}</p>
              <p className="text-xs text-muted-foreground">Tasks Done</p>
            </div>
            <div className="glass-card p-3 text-center">
              <p className="text-2xl font-bold font-heading text-foreground">{agent.accuracy}%</p>
              <p className="text-xs text-muted-foreground">Accuracy</p>
            </div>
          </div>

          <div className="mb-4">
            <p className="text-xs text-muted-foreground mb-2">Skills</p>
            <div className="flex flex-wrap gap-1.5">
              {agent.skills.map((skill) => (
                <span
                  key={skill}
                  className="text-xs px-2 py-0.5 rounded-full border border-border text-muted-foreground"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>

          <Button variant="outline" className="w-full border-border text-foreground hover:bg-secondary">
            View Details
          </Button>
        </motion.div>
      ))}
    </div>
  );
};

export default AgentProfiles;
