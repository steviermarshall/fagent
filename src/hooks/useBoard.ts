import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { BoardColumn, BoardTask, Subtask, TaskAssignee } from "@/types/board";

export function useBoard() {
  const [columns, setColumns] = useState<BoardColumn[]>([]);
  const [tasks, setTasks] = useState<BoardTask[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    const [colRes, taskRes, subRes, assignRes] = await Promise.all([
      supabase.from("board_columns").select("*").order("position"),
      supabase.from("tasks").select("*").order("position"),
      supabase.from("subtasks").select("*"),
      supabase.from("task_assignees").select("*"),
    ]);

    if (colRes.data) setColumns(colRes.data as BoardColumn[]);

    const subtasksMap = new Map<string, Subtask[]>();
    (subRes.data as Subtask[] || []).forEach((s) => {
      if (!subtasksMap.has(s.task_id)) subtasksMap.set(s.task_id, []);
      subtasksMap.get(s.task_id)!.push(s);
    });

    const assigneesMap = new Map<string, TaskAssignee[]>();
    (assignRes.data as TaskAssignee[] || []).forEach((a) => {
      if (!assigneesMap.has(a.task_id)) assigneesMap.set(a.task_id, []);
      assigneesMap.get(a.task_id)!.push(a);
    });

    const enrichedTasks: BoardTask[] = (taskRes.data || []).map((t: any) => ({
      ...t,
      subtasks: subtasksMap.get(t.id) || [],
      assignees: assigneesMap.get(t.id) || [],
    }));

    setTasks(enrichedTasks);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchData();

    const channel = supabase
      .channel("board-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "tasks" }, () => fetchData())
      .on("postgres_changes", { event: "*", schema: "public", table: "subtasks" }, () => fetchData())
      .on("postgres_changes", { event: "*", schema: "public", table: "task_assignees" }, () => fetchData())
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [fetchData]);

  const createTask = async (data: { title: string; description: string; priority: string; board_column_id: string; due_date: string | null }) => {
    const maxPos = tasks.filter(t => t.board_column_id === data.board_column_id).reduce((m, t) => Math.max(m, t.position), -1);
    await supabase.from("tasks").insert({ ...data, position: maxPos + 1 });
  };

  const updateTask = async (id: string, data: Partial<{ title: string; description: string; priority: string; board_column_id: string; due_date: string | null }>) => {
    await supabase.from("tasks").update(data).eq("id", id);
  };

  const deleteTask = async (id: string) => {
    await supabase.from("tasks").delete().eq("id", id);
  };

  const addSubtask = async (taskId: string, title: string) => {
    await supabase.from("subtasks").insert({ task_id: taskId, title });
  };

  const toggleSubtask = async (id: string, completed: boolean) => {
    await supabase.from("subtasks").update({ completed }).eq("id", id);
  };

  const deleteSubtask = async (id: string) => {
    await supabase.from("subtasks").delete().eq("id", id);
  };

  const addAssignee = async (taskId: string, displayName: string) => {
    await supabase.from("task_assignees").insert({ task_id: taskId, display_name: displayName });
  };

  const removeAssignee = async (id: string) => {
    await supabase.from("task_assignees").delete().eq("id", id);
  };

  const moveTask = async (taskId: string, newColumnId: string) => {
    await supabase.from("tasks").update({ board_column_id: newColumnId }).eq("id", taskId);
  };

  return {
    columns, tasks, loading,
    createTask, updateTask, deleteTask,
    addSubtask, toggleSubtask, deleteSubtask,
    addAssignee, removeAssignee, moveTask,
    refetch: fetchData,
  };
}
