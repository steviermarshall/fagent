import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export function useAgents(pollInterval = 30000) {
  const [agents, setAgents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    const { data } = await supabase.from("agents").select("*").order("name");
    if (data) setAgents(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetch();
    const interval = setInterval(fetch, pollInterval);
    return () => clearInterval(interval);
  }, [fetch, pollInterval]);

  return { agents, loading };
}

export function useLogs() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase.from("logs").select("*").order("timestamp", { ascending: false }).limit(100);
      if (data) setLogs(data);
      setLoading(false);
    };
    fetch();

    const channel = supabase
      .channel("logs-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "logs" }, () => fetch())
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  return { logs, loading };
}

export function useMeetings() {
  const [meetings, setMeetings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase.from("meetings").select("*").order("date", { ascending: false });
      if (data) setMeetings(data);
      setLoading(false);
    };
    fetch();
  }, []);

  return { meetings, loading };
}

export function useCouncilSessions() {
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase.from("council_sessions").select("*").order("created_at", { ascending: false });
      if (data) setSessions(data);
      setLoading(false);
    };
    fetch();

    const channel = supabase
      .channel("council-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "council_sessions" }, () => fetch())
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  return { sessions, loading };
}

export function useQueue(pollInterval = 30000) {
  const [queue, setQueue] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    const { data } = await supabase.from("queue").select("*").order("created_at", { ascending: false });
    if (data) setQueue(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetch();
    const interval = setInterval(fetch, pollInterval);
    return () => clearInterval(interval);
  }, [fetch, pollInterval]);

  return { queue, loading };
}

export function useEmailMetrics() {
  const [metrics, setMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase
        .from("email_metrics")
        .select("*")
        .order("date", { ascending: false })
        .limit(1);
      if (data && data.length > 0) setMetrics(data[0]);
      setLoading(false);
    };
    fetch();

    const channel = supabase
      .channel("email-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "email_metrics" }, () => fetch())
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  return { metrics, loading };
}

export function useSmsMetrics() {
  const [metrics, setMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase
        .from("sms_metrics")
        .select("*")
        .order("week_start", { ascending: false })
        .limit(1);
      if (data && data.length > 0) setMetrics(data[0]);
      setLoading(false);
    };
    fetch();

    const channel = supabase
      .channel("sms-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "sms_metrics" }, () => fetch())
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  return { metrics, loading };
}

export function useSheetSync() {
  const [sheets, setSheets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase
        .from("sheets_sync")
        .select("*")
        .order("sheet_name");
      if (data) setSheets(data);
      setLoading(false);
    };
    fetch();

    const channel = supabase
      .channel("sheets-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "sheets_sync" }, () => fetch())
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  return { sheets, loading };
}

export function useEngagementRates() {
  const [rates, setRates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase
        .from("engagement_rates")
        .select("*")
        .order("date", { ascending: true })
        .limit(30);
      if (data) setRates(data);
      setLoading(false);
    };
    fetch();

    const channel = supabase
      .channel("engagement-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "engagement_rates" }, () => fetch())
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  return { rates, loading };
}

export function useGithubDeploys() {
  const [deploys, setDeploys] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase
        .from("github_deploys")
        .select("*")
        .order("deployed_at", { ascending: false })
        .limit(20);
      if (data) setDeploys(data);
      setLoading(false);
    };
    fetch();

    const channel = supabase
      .channel("deploys-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "github_deploys" }, () => fetch())
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  return { deploys, loading };
}

export function useCrossRef() {
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase
        .from("crossref_matches")
        .select("*")
        .order("sheet_a");
      if (data) setMatches(data);
      setLoading(false);
    };
    fetch();

    const channel = supabase
      .channel("crossref-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "crossref_matches" }, () => fetch())
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  return { matches, loading };
}

export function useDealPipeline() {
  const [pipeline, setPipeline] = useState<{
    totalAmount: number;
    targetAmount: number;
    dealCount: number;
    stages: Record<string, { count: number; amount: number }>;
  }>({
    totalAmount: 0,
    targetAmount: 25000,
    dealCount: 0,
    stages: {},
  });
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    const { data } = await supabase.from("deals").select("stage, amount, commission");
    if (data) {
      const stages: Record<string, { count: number; amount: number }> = {};
      let totalAmount = 0;
      data.forEach((deal: any) => {
        const stage = deal.stage || "lead";
        if (!stages[stage]) stages[stage] = { count: 0, amount: 0 };
        stages[stage].count += 1;
        stages[stage].amount += Number(deal.amount || 0);
        totalAmount += Number(deal.commission || 0);
      });
      setPipeline({ totalAmount, targetAmount: 25000, dealCount: data.length, stages });
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetch();
    const channel = supabase
      .channel("deals-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "deals" }, () => fetch())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [fetch]);

  return { pipeline, loading };
}

export function useMerchantCount() {
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const { count: c } = await supabase.from("merchants").select("*", { count: "exact", head: true });
      setCount(c || 0);
      setLoading(false);
    };
    fetch();
    const channel = supabase
      .channel("merchants-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "merchants" }, () => fetch())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  return { count, loading };
}
