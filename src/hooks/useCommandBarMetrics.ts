import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface CommandBarMetrics {
  emailsToday: number;
  smsToday: number;
  activeDeals: number;
  fundedMTD: number;
  pipelineFunded: number;
  pipelineGoal: number;
  loading: boolean;
}

const REFRESH_MS = 30_000;

export function useCommandBarMetrics(): CommandBarMetrics {
  const [m, setM] = useState<CommandBarMetrics>({
    emailsToday: 0,
    smsToday: 0,
    activeDeals: 0,
    fundedMTD: 0,
    pipelineFunded: 0,
    pipelineGoal: 23_000_000,
    loading: true,
  });

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const today = new Date().toISOString().slice(0, 10);
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const [emailRes, smsRes, dealsRes, fundedRes, goalRes] = await Promise.all([
        supabase.from("email_metrics").select("sent").eq("date", today).maybeSingle(),
        supabase
          .from("sms_inbound")
          .select("id", { count: "exact", head: true })
          .gte("received_at", startOfDay.toISOString()),
        supabase
          .from("deals")
          .select("id", { count: "exact", head: true })
          .not("stage", "in", "(funded,dead)"),
        supabase
          .from("deals")
          .select("amount, funded_at")
          .eq("stage", "funded")
          .gte("funded_at", startOfMonth.toISOString()),
        supabase.from("pipeline_goals").select("funded_amount, goal_amount").maybeSingle(),
      ]);

      if (cancelled) return;

      const fundedMTD =
        fundedRes.data?.reduce((s, d) => s + Number(d.amount ?? 0), 0) ?? 0;

      setM({
        emailsToday: emailRes.data?.sent ?? 0,
        smsToday: smsRes.count ?? 0,
        activeDeals: dealsRes.count ?? 0,
        fundedMTD,
        pipelineFunded: Number(goalRes.data?.funded_amount ?? 0),
        pipelineGoal: Number(goalRes.data?.goal_amount ?? 23_000_000),
        loading: false,
      });
    }

    load();
    const id = setInterval(load, REFRESH_MS);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, []);

  return m;
}
