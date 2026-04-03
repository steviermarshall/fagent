import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Inbox, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useBoard } from "@/hooks/useBoard";
import TaskCard from "@/components/board/TaskCard";
import NewTaskModal from "@/components/board/NewTaskModal";
import TaskDetailPanel from "@/components/board/TaskDetailPanel";
import type { BoardTask } from "@/types/board";

export default function Board() {
  const {
    columns, tasks, loading,
    createTask, updateTask, deleteTask,
    addSubtask, toggleSubtask, deleteSubtask,
    addAssignee, removeAssignee, moveTask,
  } = useBoard();

  const [showNewTask, setShowNewTask] = useState(false);
  const [selectedTask, setSelectedTask] = useState<BoardTask | null>(null);
  const [mobileCol, setMobileCol] = useState<string | null>(null);

  // Keep selectedTask synced with live data
  const liveSelectedTask = selectedTask ? tasks.find(t => t.id === selectedTask.id) || null : null;

  const activeColId = mobileCol || columns[0]?.id;

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-6">
      <div className="max-w-[1600px] mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold font-[var(--font-heading)] text-foreground">Board</h1>
          <Button onClick={() => setShowNewTask(true)} className="gap-2">
            <Plus className="w-4 h-4" /> New Task
          </Button>
        </div>

        {/* Mobile column switcher */}
        <div className="flex md:hidden gap-1.5 mb-4 overflow-x-auto pb-2">
          {columns.map(col => (
            <button
              key={col.id}
              onClick={() => setMobileCol(col.id)}
              className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                activeColId === col.id
                  ? "bg-primary/15 text-primary"
                  : "bg-secondary text-muted-foreground"
              }`}
            >
              {col.name} ({tasks.filter(t => t.board_column_id === col.id).length})
            </button>
          ))}
        </div>

        {/* Columns - desktop: horizontal, mobile: single column */}
        <div className="hidden md:grid gap-4" style={{ gridTemplateColumns: `repeat(${columns.length}, minmax(240px, 1fr))` }}>
          {columns.map((col, i) => {
            const colTasks = tasks.filter(t => t.board_column_id === col.id);
            return (
              <motion.div
                key={col.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                className="glass-card overflow-hidden"
              >
                <div className="flex items-center gap-2 p-3.5" style={{ borderLeft: `3px solid ${col.color}` }}>
                  <h3 className="text-sm font-semibold text-foreground flex-1">{col.name}</h3>
                  <Badge variant="outline" className="text-[10px] border-border text-muted-foreground">{colTasks.length}</Badge>
                </div>
                <ScrollArea className="h-[calc(100vh-200px)]">
                  <div className="p-2.5 space-y-2.5">
                    {colTasks.length === 0 ? (
                      <div className="border border-dashed border-border/50 rounded-lg p-6 flex flex-col items-center text-muted-foreground">
                        <Inbox className="w-5 h-5 mb-1.5 opacity-40" />
                        <span className="text-xs">No tasks</span>
                      </div>
                    ) : (
                      colTasks.map(task => (
                        <TaskCard key={task.id} task={task} onClick={() => setSelectedTask(task)} />
                      ))
                    )}
                  </div>
                </ScrollArea>
              </motion.div>
            );
          })}
        </div>

        {/* Mobile: show active column */}
        <div className="md:hidden">
          {columns.filter(c => c.id === activeColId).map(col => {
            const colTasks = tasks.filter(t => t.board_column_id === col.id);
            return (
              <div key={col.id} className="glass-card overflow-hidden">
                <div className="flex items-center gap-2 p-3.5" style={{ borderLeft: `3px solid ${col.color}` }}>
                  <h3 className="text-sm font-semibold text-foreground flex-1">{col.name}</h3>
                  <Badge variant="outline" className="text-[10px] border-border text-muted-foreground">{colTasks.length}</Badge>
                </div>
                <div className="p-2.5 space-y-2.5">
                  {colTasks.length === 0 ? (
                    <div className="border border-dashed border-border/50 rounded-lg p-6 flex flex-col items-center text-muted-foreground">
                      <Inbox className="w-5 h-5 mb-1.5 opacity-40" />
                      <span className="text-xs">No tasks</span>
                    </div>
                  ) : (
                    colTasks.map(task => (
                      <TaskCard key={task.id} task={task} onClick={() => setSelectedTask(task)} />
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <NewTaskModal open={showNewTask} onClose={() => setShowNewTask(false)} columns={columns} onCreate={createTask} />
      <TaskDetailPanel
        task={liveSelectedTask}
        columns={columns}
        onClose={() => setSelectedTask(null)}
        onUpdate={updateTask}
        onDelete={deleteTask}
        onAddSubtask={addSubtask}
        onToggleSubtask={toggleSubtask}
        onDeleteSubtask={deleteSubtask}
        onAddAssignee={addAssignee}
        onRemoveAssignee={removeAssignee}
        onMove={moveTask}
      />
    </div>
  );
}
