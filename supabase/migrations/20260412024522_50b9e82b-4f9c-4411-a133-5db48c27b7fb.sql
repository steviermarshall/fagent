
-- Email outreach metrics
CREATE TABLE public.email_metrics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  sent INTEGER NOT NULL DEFAULT 0,
  delivered INTEGER NOT NULL DEFAULT 0,
  opened INTEGER NOT NULL DEFAULT 0,
  clicked INTEGER NOT NULL DEFAULT 0,
  replied INTEGER NOT NULL DEFAULT 0,
  bounced INTEGER NOT NULL DEFAULT 0,
  day1_count INTEGER NOT NULL DEFAULT 100,
  day3_count INTEGER NOT NULL DEFAULT 100,
  day7_count INTEGER NOT NULL DEFAULT 100,
  daily_target INTEGER NOT NULL DEFAULT 300,
  warmup_day INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.email_metrics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "email_metrics viewable by all" ON public.email_metrics FOR SELECT USING (true);
CREATE POLICY "email_metrics insertable by all" ON public.email_metrics FOR INSERT WITH CHECK (true);
CREATE POLICY "email_metrics updatable by all" ON public.email_metrics FOR UPDATE USING (true);

-- SMS outreach metrics
CREATE TABLE public.sms_metrics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  week_start DATE NOT NULL DEFAULT date_trunc('week', CURRENT_DATE)::date,
  sent INTEGER NOT NULL DEFAULT 0,
  delivered INTEGER NOT NULL DEFAULT 0,
  replied INTEGER NOT NULL DEFAULT 0,
  weekly_target INTEGER NOT NULL DEFAULT 50,
  a2p_status TEXT NOT NULL DEFAULT 'pending',
  compliance_ok BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.sms_metrics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "sms_metrics viewable by all" ON public.sms_metrics FOR SELECT USING (true);
CREATE POLICY "sms_metrics insertable by all" ON public.sms_metrics FOR INSERT WITH CHECK (true);
CREATE POLICY "sms_metrics updatable by all" ON public.sms_metrics FOR UPDATE USING (true);

-- Google Sheets sync status
CREATE TABLE public.sheets_sync (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sheet_name TEXT NOT NULL,
  row_count INTEGER NOT NULL DEFAULT 0,
  delta INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'live',
  last_sync TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.sheets_sync ENABLE ROW LEVEL SECURITY;
CREATE POLICY "sheets_sync viewable by all" ON public.sheets_sync FOR SELECT USING (true);
CREATE POLICY "sheets_sync insertable by all" ON public.sheets_sync FOR INSERT WITH CHECK (true);
CREATE POLICY "sheets_sync updatable by all" ON public.sheets_sync FOR UPDATE USING (true);

INSERT INTO public.sheets_sync (sheet_name, row_count) VALUES
  ('ZEUS', 0),
  ('MARSHALL', 0),
  ('MONEY', 0);

-- Engagement rate snapshots
CREATE TABLE public.engagement_rates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  open_rate NUMERIC(5,2) NOT NULL DEFAULT 0,
  click_rate NUMERIC(5,2) NOT NULL DEFAULT 0,
  reply_rate NUMERIC(5,2) NOT NULL DEFAULT 0,
  drop_rate NUMERIC(5,2) NOT NULL DEFAULT 0,
  bounce_rate NUMERIC(5,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.engagement_rates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "engagement_rates viewable by all" ON public.engagement_rates FOR SELECT USING (true);
CREATE POLICY "engagement_rates insertable by all" ON public.engagement_rates FOR INSERT WITH CHECK (true);

-- GitHub deploy events
CREATE TABLE public.github_deploys (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  branch TEXT NOT NULL DEFAULT 'main',
  commit_sha TEXT,
  status TEXT NOT NULL DEFAULT 'success',
  deployed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  commit_message TEXT,
  pipeline_lint BOOLEAN NOT NULL DEFAULT true,
  pipeline_test BOOLEAN NOT NULL DEFAULT true,
  pipeline_build BOOLEAN NOT NULL DEFAULT true,
  pipeline_deploy BOOLEAN NOT NULL DEFAULT true,
  pipeline_health BOOLEAN NOT NULL DEFAULT true
);

ALTER TABLE public.github_deploys ENABLE ROW LEVEL SECURITY;
CREATE POLICY "github_deploys viewable by all" ON public.github_deploys FOR SELECT USING (true);
CREATE POLICY "github_deploys insertable by all" ON public.github_deploys FOR INSERT WITH CHECK (true);

-- Cross-reference matches
CREATE TABLE public.crossref_matches (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sheet_a TEXT NOT NULL,
  sheet_b TEXT NOT NULL,
  match_count INTEGER NOT NULL DEFAULT 0,
  last_scan TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.crossref_matches ENABLE ROW LEVEL SECURITY;
CREATE POLICY "crossref viewable by all" ON public.crossref_matches FOR SELECT USING (true);
CREATE POLICY "crossref insertable by all" ON public.crossref_matches FOR INSERT WITH CHECK (true);
CREATE POLICY "crossref updatable by all" ON public.crossref_matches FOR UPDATE USING (true);

INSERT INTO public.crossref_matches (sheet_a, sheet_b, match_count) VALUES
  ('ZEUS', 'MARSHALL', 0),
  ('MARSHALL', 'MONEY', 0),
  ('ZEUS', 'MONEY', 0);

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.email_metrics;
ALTER PUBLICATION supabase_realtime ADD TABLE public.sms_metrics;
ALTER PUBLICATION supabase_realtime ADD TABLE public.sheets_sync;
ALTER PUBLICATION supabase_realtime ADD TABLE public.engagement_rates;
ALTER PUBLICATION supabase_realtime ADD TABLE public.github_deploys;
ALTER PUBLICATION supabase_realtime ADD TABLE public.crossref_matches;
