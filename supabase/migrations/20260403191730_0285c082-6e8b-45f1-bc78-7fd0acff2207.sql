
-- Create board_columns table
CREATE TABLE public.board_columns (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  color TEXT NOT NULL DEFAULT '#6b7280',
  position INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.board_columns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Board columns are viewable by everyone"
ON public.board_columns FOR SELECT USING (true);

-- Seed default columns
INSERT INTO public.board_columns (name, color, position) VALUES
  ('To Do', '#ef4444', 0),
  ('Doing', '#f59e0b', 1),
  ('Needs Input', '#a855f7', 2),
  ('Done', '#22c55e', 3),
  ('Canceled', '#6b7280', 4);

-- Create tasks table
CREATE TABLE public.tasks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  board_column_id UUID NOT NULL REFERENCES public.board_columns(id) ON DELETE CASCADE,
  priority TEXT NOT NULL DEFAULT 'medium',
  due_date DATE,
  position INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by_bujji BOOLEAN NOT NULL DEFAULT false
);

ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tasks are viewable by everyone"
ON public.tasks FOR SELECT USING (true);

CREATE POLICY "Tasks can be inserted by anyone"
ON public.tasks FOR INSERT WITH CHECK (true);

CREATE POLICY "Tasks can be updated by anyone"
ON public.tasks FOR UPDATE USING (true);

CREATE POLICY "Tasks can be deleted by anyone"
ON public.tasks FOR DELETE USING (true);

-- Create subtasks table
CREATE TABLE public.subtasks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  completed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.subtasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Subtasks are viewable by everyone"
ON public.subtasks FOR SELECT USING (true);

CREATE POLICY "Subtasks can be inserted by anyone"
ON public.subtasks FOR INSERT WITH CHECK (true);

CREATE POLICY "Subtasks can be updated by anyone"
ON public.subtasks FOR UPDATE USING (true);

CREATE POLICY "Subtasks can be deleted by anyone"
ON public.subtasks FOR DELETE USING (true);

-- Create task_assignees table
CREATE TABLE public.task_assignees (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  user_id UUID,
  display_name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.task_assignees ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Task assignees are viewable by everyone"
ON public.task_assignees FOR SELECT USING (true);

CREATE POLICY "Task assignees can be inserted by anyone"
ON public.task_assignees FOR INSERT WITH CHECK (true);

CREATE POLICY "Task assignees can be updated by anyone"
ON public.task_assignees FOR UPDATE USING (true);

CREATE POLICY "Task assignees can be deleted by anyone"
ON public.task_assignees FOR DELETE USING (true);

-- Enable realtime for tasks
ALTER PUBLICATION supabase_realtime ADD TABLE public.tasks;
ALTER PUBLICATION supabase_realtime ADD TABLE public.subtasks;
ALTER PUBLICATION supabase_realtime ADD TABLE public.task_assignees;
