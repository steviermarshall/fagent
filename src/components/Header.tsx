import { motion } from "framer-motion";
import { Settings, Sun, Moon } from "lucide-react";
import { agents } from "@/data/mockData";
import { useTheme } from "@/hooks/useTheme";

const Header = () => {
  const activeAgent = agents[0];
  const { theme, toggle } = useTheme();

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="glass-card border-l-2 border-l-primary px-4 sm:px-6 py-3 sm:py-4 mb-4 sm:mb-6"
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-cyan-400 to-purple-500 flex items-center justify-center text-white font-bold text-base sm:text-lg font-heading shadow-lg shrink-0">
            D
          </div>
          <div className="min-w-0">
            <h1 className="text-base sm:text-xl font-bold font-heading text-foreground truncate">DOGZ TERMINAL</h1>
            <p className="text-[9px] sm:text-[10px] text-muted-foreground font-mono uppercase tracking-widest truncate">AI AGENT COMMAND CENTER · v3.0</p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-4 shrink-0">
          <div className="hidden sm:flex items-center gap-3">
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
          <button
            onClick={toggle}
            className="p-2 rounded-lg hover:bg-secondary transition-colors"
            aria-label="Toggle theme"
          >
            {theme === "dark" ? (
              <Sun className="w-4 h-4 text-muted-foreground" />
            ) : (
              <Moon className="w-4 h-4 text-muted-foreground" />
            )}
          </button>
          <button className="p-2 rounded-lg hover:bg-secondary transition-colors">
            <Settings className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>
      </div>
    </motion.header>
  );
};

export default Header;
