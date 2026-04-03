import { Badge } from "@/components/ui/badge";
import { User, Calendar } from "lucide-react";
import type { BoardTask } from "@/types/board";
import { formatDistanceToNow, isPast, parseISO } from "date-fns";

const priorityConfig: Record<string, { label: string; className: string }> = {
  urgent: { label: "Urgent", className: "bg-red-500/20 text-red-400 border-red-500/30" },
  high: { label: "High", className: "bg-orange-500/20 text-orange-400 border-orange-500/30" },
  medium: { label: "Medium", className: "bg-blue-500/20 text-blue-400 border-blue-500/30" },
  low: { label: "Low", className: "bg-gray-500/20 text-gray-400 border-gray-500/30" },
};

const avatarColors = [
  "bg-emerald-600", "bg-cyan-600", "bg-amber-600", "bg-purple-600",
  "bg-pink-600", "bg-blue-600", "bg-red-600", "bg-teal-600",
];

function getInitials(name: string) {
  return name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);
}

interface Props {
  task: BoardTask;
  onClick: () => void;
}

export default function TaskCard({ task, onClick }: Props) {
  const priority = priorityConfig[task.priority] || priorityConfig.medium;
  const completedSubs = task.subtasks.filter(s => s.completed).length;
  const totalSubs = task.subtasks.length;
  const isOverdue = task.due_date && isPast(parseISO(task.due_date));

  return (
    <div
      onClick={onClick}
      className="glass-card-hover p-3.5 cursor-pointer group"
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <p className="text-sm font-semibold text-foreground leading-tight line-clamp-2">{task.title}</p>
        <Badge variant="outline" className={`text-[10px] shrink-0 px-1.5 py-0 ${priority.className}`}>
          {priority.label}
        </Badge>
      </div>

      {task.description && (
        <p className="text-xs text-muted-foreground line-clamp-2 mb-2.5">{task.description}</p>
      )}

      {totalSubs > 0 && (
        <div className="mb-2.5">
          <div className="flex justify-between text-[10px] text-muted-foreground mb-1">
            <span>{completedSubs}/{totalSubs} subtasks</span>
          </div>
          <div className="w-full bg-secondary rounded-full h-1">
            <div
              className="bg-primary h-1 rounded-full transition-all"
              style={{ width: `${(completedSubs / totalSubs) * 100}%` }}
            />
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div className="flex items-center -space-x-1.5">
          {task.assignees.length === 0 && (
            <div className="w-6 h-6 rounded-full bg-secondary flex items-center justify-center">
              <User className="w-3 h-3 text-muted-foreground" />
            </div>
          )}
          {task.assignees.slice(0, 3).map((a, i) => (
            <div
              key={a.id}
              title={a.display_name}
              className={`w-6 h-6 rounded-full ${avatarColors[i % avatarColors.length]} flex items-center justify-center text-[9px] font-bold text-white ring-1 ring-background`}
            >
              {getInitials(a.display_name)}
            </div>
          ))}
          {task.assignees.length > 3 && (
            <div className="w-6 h-6 rounded-full bg-secondary flex items-center justify-center text-[9px] font-medium text-muted-foreground ring-1 ring-background">
              +{task.assignees.length - 3}
            </div>
          )}
        </div>

        {task.due_date && (
          <div className={`flex items-center gap-1 text-[10px] ${isOverdue ? "text-red-400" : "text-muted-foreground"}`}>
            <Calendar className="w-3 h-3" />
            {formatDistanceToNow(parseISO(task.due_date), { addSuffix: true })}
          </div>
        )}
      </div>
    </div>
  );
}
