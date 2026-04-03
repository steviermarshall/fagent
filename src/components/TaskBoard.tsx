import { motion } from "framer-motion";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { tasks as initialTasks, type Task } from "@/data/mockData";

const columns = [
  { id: "todo" as const, label: "To Do", color: "text-muted-foreground" },
  { id: "doing" as const, label: "Doing", color: "text-accent" },
  { id: "needs-input" as const, label: "Needs Input", color: "text-warning" },
  { id: "done" as const, label: "Done", color: "text-primary" },
];

const priorityDots: Record<string, string> = {
  low: "bg-muted-foreground",
  medium: "bg-accent",
  high: "bg-warning",
  urgent: "bg-destructive",
};

const TaskBoard = () => {
  const [taskList, setTaskList] = useState<Task[]>(initialTasks);
  const [draggedTask, setDraggedTask] = useState<string | null>(null);

  const handleDragStart = (taskId: string) => {
    setDraggedTask(taskId);
  };

  const handleDrop = (columnId: Task["column"]) => {
    if (!draggedTask) return;
    setTaskList((prev) =>
      prev.map((t) =>
        t.id === draggedTask ? { ...t, column: columnId, progress: columnId === "doing" ? (t.progress || 10) : t.progress } : t
      )
    );
    setDraggedTask(null);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 overflow-x-auto">
      {columns.map((col, colIdx) => (
        <motion.div
          key={col.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: colIdx * 0.08 }}
          className="glass-card p-4 min-w-[260px]"
          onDragOver={(e) => e.preventDefault()}
          onDrop={() => handleDrop(col.id)}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className={`text-sm font-semibold ${col.color}`}>{col.label}</h3>
            <Badge variant="outline" className="text-xs border-border text-muted-foreground">
              {taskList.filter((t) => t.column === col.id).length}
            </Badge>
          </div>
          <ScrollArea className="h-[400px]">
            <div className="space-y-3 pr-2">
              {taskList
                .filter((t) => t.column === col.id)
                .map((task, i) => (
                  <motion.div
                    key={task.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: colIdx * 0.08 + i * 0.05 }}
                    draggable
                    onDragStart={() => handleDragStart(task.id)}
                    className="glass-card p-3 cursor-grab active:cursor-grabbing hover:scale-[1.02] transition-transform"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <p className="text-sm font-medium text-foreground leading-tight">{task.title}</p>
                      <span className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${priorityDots[task.priority]}`} />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm">{task.agentEmoji}</span>
                      <span className="text-xs text-muted-foreground">{task.agentName}</span>
                    </div>
                    {task.progress !== undefined && col.id === "doing" && (
                      <div className="mt-2">
                        <div className="flex justify-between text-xs text-muted-foreground mb-1">
                          <span>Progress</span>
                          <span className="font-mono">{task.progress}%</span>
                        </div>
                        <div className="w-full bg-secondary rounded-full h-1.5">
                          <div className="bg-primary h-1.5 rounded-full transition-all" style={{ width: `${task.progress}%` }} />
                        </div>
                      </div>
                    )}
                  </motion.div>
                ))}
            </div>
          </ScrollArea>
        </motion.div>
      ))}
    </div>
  );
};

export default TaskBoard;
