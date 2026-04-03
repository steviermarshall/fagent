export interface BoardColumn {
  id: string;
  name: string;
  color: string;
  position: number;
}

export interface Subtask {
  id: string;
  task_id: string;
  title: string;
  completed: boolean;
}

export interface TaskAssignee {
  id: string;
  task_id: string;
  user_id: string | null;
  display_name: string;
}

export interface BoardTask {
  id: string;
  title: string;
  description: string;
  board_column_id: string;
  priority: string;
  due_date: string | null;
  position: number;
  created_at: string;
  created_by_bujji: boolean;
  subtasks: Subtask[];
  assignees: TaskAssignee[];
}
