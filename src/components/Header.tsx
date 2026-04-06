import { motion } from "framer-motion";
import { Settings } from "lucide-react";
import { agents } from "@/data/mockData";

const Header = () => {
  const activeAgent = agents[0];

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="glass-card border-l-2 border-l-primary px-6 py-4 mb-6"
    >
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <span className="text-3xl">🐕</span>
          <div>
            <h1 className="text-xl font-bold font-heading text-foreground">DOGZ TERMINAL</h1>
            <p className="text-sm text-muted-foreground">AI Agent Command Center</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-pulse-dot absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-primary" />
            </span>
            <div className="text-right">
              <p className="text-sm font-medium text-foreground">
                {activeAgent.emoji} {activeAgent.name}: Online
              </p>
              <p className="text-xs text-muted-foreground">Last seen: {activeAgent.lastSeen}</p>
            </div>
          </div>
          <button className="p-2 rounded-lg hover:bg-secondary transition-colors">
            <Settings className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>
      </div>
    </motion.header>
  );
};

export default Header;
