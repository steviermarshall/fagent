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
  Menu,
  type LucideIcon,
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useState } from "react";

interface NavItem {
  id: string;
  label: string;
  icon: LucideIcon;
}

const PINNED: NavItem[] = [
  { id: "sheets",   label: "Sheets",   icon: ScrollText },
  { id: "sms",      label: "SMS",      icon: MessageSquare },
  { id: "council",  label: "Council",  icon: MessagesSquare },
  { id: "datafeeds",label: "Data",     icon: Database },
  { id: "meetings", label: "Meetings", icon: BarChart3 },
  { id: "cicd",     label: "CI/CD",    icon: GitBranch },
];

const SECONDARY: NavItem[] = [
  { id: "operations", label: "Operations", icon: Activity },
  { id: "outreach",   label: "Outreach",   icon: Send },
  { id: "command",    label: "Command",    icon: LayoutDashboard },
  { id: "tasks",      label: "Tasks",      icon: Kanban },
];

// 4 most-used sections for bottom tab bar
const BOTTOM_TABS: NavItem[] = [
  { id: "sheets",  label: "Sheets",  icon: ScrollText },
  { id: "sms",     label: "SMS",     icon: MessageSquare },
  { id: "council", label: "Council", icon: MessagesSquare },
  { id: "tasks",   label: "Tasks",   icon: Kanban },
];

interface MobileNavProps {
  active: string;
  onChange: (id: string) => void;
}

export function MobileNavTrigger({ active, onChange }: MobileNavProps) {
  const [open, setOpen] = useState(false);

  const handle = (id: string) => {
    onChange(id);
    setOpen(false);
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button
          aria-label="Open navigation"
          className="md:hidden w-9 h-9 rounded-lg hover:bg-surface-2 flex items-center justify-center text-muted-foreground shrink-0"
        >
          <Menu className="w-5 h-5" />
        </button>
      </SheetTrigger>
      <SheetContent
        side="left"
        className="w-[260px] bg-surface-1 border-r border-hairline p-0 flex flex-col"
      >
        <SheetHeader className="h-[52px] px-4 flex-row items-center border-b border-hairline space-y-0">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-council flex items-center justify-center text-white font-extrabold text-sm">
            D
          </div>
          <SheetTitle className="ml-3 text-xs font-bold tracking-[0.18em]">
            DOGZ
          </SheetTitle>
        </SheetHeader>

        <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
          {PINNED.map((item) => (
            <DrawerNavButton key={item.id} item={item} active={active === item.id} onClick={() => handle(item.id)} />
          ))}

          <div className="px-3 pt-4 pb-1 text-[9px] font-semibold tracking-widest text-muted-foreground/60 uppercase">
            More
          </div>

          {SECONDARY.map((item) => (
            <DrawerNavButton key={item.id} item={item} active={active === item.id} onClick={() => handle(item.id)} />
          ))}
        </nav>

        <div className="h-12 border-t border-hairline flex items-center px-4">
          <span className="live-dot" />
          <span className="ml-3 text-[10px] font-bold tracking-[0.2em] text-primary">
            LIVE
          </span>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function DrawerNavButton({
  item,
  active,
  onClick,
}: {
  item: NavItem;
  active: boolean;
  onClick: () => void;
}) {
  const Icon = item.icon;
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center h-11 px-3 rounded-lg transition-colors relative ${
        active
          ? "bg-primary/10 text-primary"
          : "text-muted-foreground hover:bg-surface-2 hover:text-foreground"
      }`}
    >
      {active && (
        <span className="absolute left-0 top-2 bottom-2 w-[3px] rounded-r bg-primary" />
      )}
      <Icon className="w-[18px] h-[18px] shrink-0" />
      <span className="ml-3 text-[14px] font-medium">{item.label}</span>
    </button>
  );
}

export function MobileBottomTabs({ active, onChange }: MobileNavProps) {
  return (
    <nav
      className="md:hidden fixed bottom-0 inset-x-0 z-30 h-14 bg-surface-1/95 backdrop-blur border-t border-hairline flex items-stretch"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      {BOTTOM_TABS.map((item) => {
        const Icon = item.icon;
        const isActive = active === item.id;
        return (
          <button
            key={item.id}
            onClick={() => onChange(item.id)}
            className={`flex-1 flex flex-col items-center justify-center gap-0.5 transition-colors ${
              isActive ? "text-primary" : "text-muted-foreground"
            }`}
          >
            {isActive && (
              <span className="absolute top-0 h-[2px] w-10 rounded-b bg-primary" />
            )}
            <Icon className="w-[18px] h-[18px]" />
            <span className="text-[10px] font-medium tracking-wide">{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
