import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { BoardColumn } from "@/types/board";

interface Props {
  open: boolean;
  onClose: () => void;
  columns: BoardColumn[];
  onCreate: (data: { title: string; description: string; priority: string; board_column_id: string; due_date: string | null }) => Promise<void>;
}

export default function NewTaskModal({ open, onClose, columns, onCreate }: Props) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("medium");
  const [columnId, setColumnId] = useState(columns[0]?.id || "");
  const [dueDate, setDueDate] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async () => {
    if (!title.trim()) return;
    setSaving(true);
    await onCreate({
      title: title.trim(),
      description,
      priority,
      board_column_id: columnId || columns[0]?.id,
      due_date: dueDate || null,
    });
    setSaving(false);
    setTitle(""); setDescription(""); setPriority("medium"); setDueDate("");
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="glass-card border-border sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-[var(--font-heading)]">New Task</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Input placeholder="Task title" value={title} onChange={e => setTitle(e.target.value)} className="bg-secondary/50 border-border" />
          <Textarea placeholder="Description (optional)" value={description} onChange={e => setDescription(e.target.value)} rows={3} className="bg-secondary/50 border-border" />
          <div className="grid grid-cols-2 gap-3">
            <Select value={priority} onValueChange={setPriority}>
              <SelectTrigger className="bg-secondary/50 border-border"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="urgent">🔴 Urgent</SelectItem>
                <SelectItem value="high">🟠 High</SelectItem>
                <SelectItem value="medium">🔵 Medium</SelectItem>
                <SelectItem value="low">⚪ Low</SelectItem>
              </SelectContent>
            </Select>
            <Select value={columnId || columns[0]?.id} onValueChange={setColumnId}>
              <SelectTrigger className="bg-secondary/50 border-border"><SelectValue /></SelectTrigger>
              <SelectContent>
                {columns.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <Input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} className="bg-secondary/50 border-border" />
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={!title.trim() || saving}>
            {saving ? "Creating..." : "Create Task"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
