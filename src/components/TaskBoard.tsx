import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useBoard } from "@/hooks/useBoard";

const priorityDots: Record<string, string> = {
  low: "bg-muted-foreground",
  medium: "bg-accent",
  high: "bg-warning",
  urgent: "bg-destructive",
};

const TaskBoard = () => {
  const { columns, tasks, loading, moveTask } = useBoard();

  if (loading) return <p className="text-sm text-muted-foreground">Loading tasks...</p>;
  if (columns.length === 0) return <p className="text-sm text-muted-foreground">No board columns found.</p>;

  const handleDrop = (columnId: string, taskId: string) => {
    moveTask(taskId, columnId);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4 overflow-x-auto">
      {columns.map((col, colIdx) => {
        const colTasks = tasks.filter((t) => t.board_column_id === col.id);
        return (
          <motion.div
            key={col.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: colIdx * 0.08 }}
            className="glass-card p-4 min-w-[260px]"
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              const taskId = e.dataTransfer.getData("taskId");
              if (taskId) handleDrop(col.id, taskId);
            }}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: col.color }} />
                <h3 className="text-sm font-semibold text-foreground">{col.name}</h3>
              </div>
              <Badge variant="outline" className="text-xs border-border text-muted-foreground">
                {colTasks.length}
              </Badge>
            </div>
            <ScrollArea className="h-[400px]">
              <div className="space-y-3 pr-2">
                {colTasks.length === 0 ? (
                  <div className="border border-dashed border-border rounded-lg p-4 text-center">
                    <p className="text-xs text-muted-foreground">No tasks</p>
                  </div>
                ) : (
                  colTasks.map((task, i) => (
                    <motion.div
                      key={task.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: colIdx * 0.08 + i * 0.05 }}
                      draggable
                      onDragStart={(e: any) => e.dataTransfer.setData("taskId", task.id)}
                      className="glass-card p-3 cursor-grab active:cursor-grabbing hover:scale-[1.02] transition-transform"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <p className="text-sm font-medium text-foreground leading-tight">{task.title}</p>
                        <span className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${priorityDots[task.priority] || "bg-muted-foreground"}`} />
                      </div>
                      {task.description && (
                        <p className="text-xs text-muted-foreground line-clamp-2 mb-2">{task.description}</p>
                      )}
                      {task.assignees && task.assignees.length > 0 && (
                        <div className="flex -space-x-2 mb-1">
                          {task.assignees.slice(0, 3).map((a) => (
                            <div key={a.id} className="w-6 h-6 rounded-full bg-secondary flex items-center justify-center border-2 border-background text-xs font-medium text-foreground">
                              {a.display_name[0]}
                            </div>
                          ))}
                          {task.assignees.length > 3 && (
                            <div className="w-6 h-6 rounded-full bg-secondary flex items-center justify-center border-2 border-background text-xs text-muted-foreground">
                              +{task.assignees.length - 3}
                            </div>
                          )}
                        </div>
                      )}
                      {task.subtasks && task.subtasks.length > 0 && (
                        <div className="mt-2">
                          <div className="flex justify-between text-xs text-muted-foreground mb-1">
                            <span>{task.subtasks.filter((s) => s.completed).length}/{task.subtasks.length} subtasks</span>
                          </div>
                          <div className="w-full bg-secondary rounded-full h-1">
                            <div className="bg-primary h-1 rounded-full transition-all" style={{ width: `${(task.subtasks.filter((s) => s.completed).length / task.subtasks.length) * 100}%` }} />
                          </div>
                        </div>
                      )}
                    </motion.div>
                  ))
                )}
              </div>
            </ScrollArea>
          </motion.div>
        );
      })}
    </div>
  );
};

export default TaskBoard;
