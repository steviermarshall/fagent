import { useState } from "react";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Send,
  Activity,
  MessageSquare,
  Kanban,
  Database,
  GitBranch,
  ScrollText,
  MessagesSquare,
  BarChart3,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  id: string;
  label: string;
  icon: LucideIcon;
  emoji?: string;
}

// Pinned: the 6 sections from the brief
const PINNED: NavItem[] = [
  { id: "sheets",   label: "Sheets",   icon: ScrollText,    emoji: "📊" },
  { id: "sms",      label: "SMS",      icon: MessageSquare, emoji: "💬" },
  { id: "council",  label: "Council",  icon: MessagesSquare, emoji: "⚖️" },
  { id: "datafeeds",label: "Data",     icon: Database,      emoji: "🏢" },
  { id: "meetings", label: "Meetings", icon: BarChart3,     emoji: "🗓️" },
  { id: "cicd",     label: "CI/CD",    icon: GitBranch,     emoji: "⚙️" },
];

// Secondary: kept accessible
const SECONDARY: NavItem[] = [
  { id: "operations", label: "Operations", icon: Activity },
  { id: "outreach",   label: "Outreach",   icon: Send },
  { id: "command",    label: "Command",    icon: LayoutDashboard },
  { id: "tasks",      label: "Tasks",      icon: Kanban },
];

interface SidebarProps {
  active: string;
  onChange: (id: string) => void;
}

export default function Sidebar({ active, onChange }: SidebarProps) {
  const [open, setOpen] = useState(false);

  return (
    <motion.aside
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      initial={false}
      animate={{ width: open ? 200 : 56 }}
      transition={{ type: "spring", stiffness: 320, damping: 32 }}
      className="hidden md:flex fixed left-0 top-0 bottom-0 z-40 flex-col bg-surface-1 border-r border-hairline overflow-hidden"
    >
      {/* Brand mark */}
      <div className="h-[52px] flex items-center px-3 border-b border-hairline shrink-0">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-council flex items-center justify-center text-white font-extrabold text-sm shrink-0">
          D
        </div>
        <span
          className={`ml-3 text-xs font-bold tracking-[0.18em] text-foreground whitespace-nowrap transition-opacity duration-150 ${
            open ? "opacity-100" : "opacity-0"
          }`}
        >
          DOGZ
        </span>
      </div>

      {/* Pinned */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
        {PINNED.map((item) => (
          <NavButton key={item.id} item={item} active={active === item.id} open={open} onClick={() => onChange(item.id)} />
        ))}

        <div
          className={`px-2 pt-4 pb-1 text-[9px] font-semibold tracking-widest text-muted-foreground/60 uppercase whitespace-nowrap transition-opacity duration-150 ${
            open ? "opacity-100" : "opacity-0"
          }`}
        >
          More
        </div>

        {SECONDARY.map((item) => (
          <NavButton key={item.id} item={item} active={active === item.id} open={open} onClick={() => onChange(item.id)} />
        ))}
      </nav>

      {/* Live indicator */}
      <div className="h-12 border-t border-hairline flex items-center px-4 shrink-0">
        <span className="live-dot" />
        <span
          className={`ml-3 text-[10px] font-bold tracking-[0.2em] text-primary whitespace-nowrap transition-opacity duration-150 ${
            open ? "opacity-100" : "opacity-0"
          }`}
        >
          LIVE
        </span>
      </div>
    </motion.aside>
  );
}

function NavButton({
  item,
  active,
  open,
  onClick,
}: {
  item: NavItem;
  active: boolean;
  open: boolean;
  onClick: () => void;
}) {
  const Icon = item.icon;
  return (
    <button
      onClick={onClick}
      className={`group w-full flex items-center h-10 px-2.5 rounded-lg transition-colors relative ${
        active
          ? "bg-primary/10 text-primary"
          : "text-muted-foreground hover:bg-surface-2 hover:text-foreground"
      }`}
      title={item.label}
    >
      {active && (
        <span className="absolute left-0 top-1.5 bottom-1.5 w-[3px] rounded-r bg-primary" />
      )}
      <span className="w-9 flex justify-center shrink-0">
        <Icon className="w-[18px] h-[18px]" />
      </span>
      <span
        className={`ml-1 text-[13px] font-medium whitespace-nowrap transition-opacity duration-150 ${
          open ? "opacity-100" : "opacity-0"
        }`}
      >
        {item.label}
      </span>
    </button>
  );
}
