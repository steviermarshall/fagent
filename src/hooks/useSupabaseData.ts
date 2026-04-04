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
