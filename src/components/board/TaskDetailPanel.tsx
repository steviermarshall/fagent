import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Trash2, Plus, X, AlertTriangle } from "lucide-react";
import type { BoardTask, BoardColumn } from "@/types/board";

interface Props {
  task: BoardTask | null;
  columns: BoardColumn[];
  onClose: () => void;
  onUpdate: (id: string, data: any) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onAddSubtask: (taskId: string, title: string) => Promise<void>;
  onToggleSubtask: (id: string, completed: boolean) => Promise<void>;
  onDeleteSubtask: (id: string) => Promise<void>;
  onAddAssignee: (taskId: string, name: string) => Promise<void>;
  onRemoveAssignee: (id: string) => Promise<void>;
  onMove: (taskId: string, colId: string) => Promise<void>;
}

export default function TaskDetailPanel({
  task, columns, onClose, onUpdate, onDelete,
  onAddSubtask, onToggleSubtask, onDeleteSubtask,
  onAddAssignee, onRemoveAssignee, onMove,
}: Props) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [newSubtask, setNewSubtask] = useState("");
  const [newAssignee, setNewAssignee] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);

  if (!task) return null;

  const startEdit = () => {
    setTitle(task.title);
    setDescription(task.description || "");
    setPriority(task.priority);
    setDueDate(task.due_date || "");
    setEditing(true);
  };

  const saveEdit = async () => {
    await onUpdate(task.id, { title, description, priority, due_date: dueDate || null });
    setEditing(false);
  };

  const handleAddSubtask = async () => {
    if (!newSubtask.trim()) return;
    await onAddSubtask(task.id, newSubtask.trim());
    setNewSubtask("");
  };

  const handleAddAssignee = async () => {
    if (!newAssignee.trim()) return;
    await onAddAssignee(task.id, newAssignee.trim());
    setNewAssignee("");
  };

  const handleDelete = async () => {
    await onDelete(task.id);
    onClose();
  };

  const completedSubs = task.subtasks.filter(s => s.completed).length;

  return (
    <Dialog open={!!task} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="glass-card border-border sm:max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-[var(--font-heading)] pr-8">
            {editing ? (
              <Input value={title} onChange={e => setTitle(e.target.value)} className="bg-secondary/50 border-border text-lg font-semibold" />
            ) : (
              <span className="cursor-pointer hover:text-primary transition-colors" onClick={startEdit}>{task.title}</span>
            )}
          </DialogTitle>
          <DialogDescription className="sr-only">Task details</DialogDescription>
        </DialogHeader>

        <div className="space-y-5">
          {/* Priority & Column */}
          <div className="flex gap-3 flex-wrap">
            {editing ? (
              <Select value={priority} onValueChange={setPriority}>
                <SelectTrigger className="w-32 bg-secondary/50 border-border"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="urgent">Urgent</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            ) : (
              <Badge variant="outline" className="text-xs">{task.priority}</Badge>
            )}
            <Select value={task.board_column_id} onValueChange={(v) => onMove(task.id, v)}>
              <SelectTrigger className="w-40 bg-secondary/50 border-border"><SelectValue /></SelectTrigger>
              <SelectContent>
                {columns.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          {/* Due Date */}
          {editing ? (
            <Input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} className="bg-secondary/50 border-border w-44" />
          ) : task.due_date ? (
            <p className="text-xs text-muted-foreground">Due: {task.due_date}</p>
          ) : null}

          {/* Description */}
          {editing ? (
            <Textarea value={description} onChange={e => setDescription(e.target.value)} rows={4} className="bg-secondary/50 border-border" placeholder="Description..." />
          ) : task.description ? (
            <div className="text-sm text-foreground/80 whitespace-pre-wrap">{task.description}</div>
          ) : (
            <p className="text-sm text-muted-foreground italic cursor-pointer" onClick={startEdit}>Click to add description...</p>
          )}

          {editing && (
            <div className="flex gap-2">
              <Button size="sm" onClick={saveEdit}>Save</Button>
              <Button size="sm" variant="ghost" onClick={() => setEditing(false)}>Cancel</Button>
            </div>
          )}

          {/* Assignees */}
          <div>
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Assignees</h4>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {task.assignees.map(a => (
                <Badge key={a.id} variant="secondary" className="gap-1 pr-1">
                  {a.display_name}
                  <button onClick={() => onRemoveAssignee(a.id)} className="hover:text-destructive">
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="Add assignee..."
                value={newAssignee}
                onChange={e => setNewAssignee(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleAddAssignee()}
                className="bg-secondary/50 border-border h-8 text-xs"
              />
              <Button size="sm" variant="ghost" onClick={handleAddAssignee} className="h-8 px-2"><Plus className="w-3.5 h-3.5" /></Button>
            </div>
          </div>

          {/* Subtasks */}
          <div>
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              Subtasks {task.subtasks.length > 0 && `(${completedSubs}/${task.subtasks.length})`}
            </h4>
            <div className="space-y-1.5 mb-2">
              {task.subtasks.map(s => (
                <div key={s.id} className="flex items-center gap-2 group/sub">
                  <Checkbox checked={s.completed} onCheckedChange={(c) => onToggleSubtask(s.id, !!c)} />
                  <span className={`text-sm flex-1 ${s.completed ? "line-through text-muted-foreground" : ""}`}>{s.title}</span>
                  <button onClick={() => onDeleteSubtask(s.id)} className="opacity-0 group-hover/sub:opacity-100 text-muted-foreground hover:text-destructive transition-opacity">
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="Add subtask..."
                value={newSubtask}
                onChange={e => setNewSubtask(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleAddSubtask()}
                className="bg-secondary/50 border-border h-8 text-xs"
              />
              <Button size="sm" variant="ghost" onClick={handleAddSubtask} className="h-8 px-2"><Plus className="w-3.5 h-3.5" /></Button>
            </div>
          </div>

          {/* Delete */}
          <div className="pt-3 border-t border-border">
            {confirmDelete ? (
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-4 h-4 text-destructive" />
                <span className="text-sm text-destructive">Delete this task?</span>
                <Button size="sm" variant="destructive" onClick={handleDelete}>Yes, delete</Button>
                <Button size="sm" variant="ghost" onClick={() => setConfirmDelete(false)}>Cancel</Button>
              </div>
            ) : (
              <Button size="sm" variant="ghost" className="text-muted-foreground hover:text-destructive" onClick={() => setConfirmDelete(true)}>
                <Trash2 className="w-3.5 h-3.5 mr-1.5" /> Delete task
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
