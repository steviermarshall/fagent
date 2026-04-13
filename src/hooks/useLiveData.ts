import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface DailyReport {
  id: string;
  report_type: "pipeline" | "book" | "campaign";
  report_date: string;
  data: any;
  created_at: string;
}

export interface ApprovalQueueItem {
  id: string;
  contact_name: string;
  company: string;
  email: string;
  phone: string;
  trigger_reason: string;
  suggested_email_subject: string;
  suggested_email_body: string;
  suggested_sms: string;
  sheet_source: string;
  status: "pending" | "approved" | "dismissed";
  created_at: string;
  approved_at: string | null;
  dismissed_at: string | null;
}

export interface SMSReply {
  id: string;
  from_number: string;
  message: string;
  timestamp: string;
  sinch_message_id: string;
  reply_status: string;
  contact_name: string;
  company: string;
  created_at: string;
}

export function useLiveData() {
  const [dailyReports, setDailyReports] = useState<DailyReport[]>([]);
  const [approvalQueue, setApprovalQueue] = useState<ApprovalQueueItem[]>([]);
  const [smsReplies, setSmsReplies] = useState<SMSReply[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    const [reportsRes, queueRes, smsRes] = await Promise.all([
      supabase.from("daily_reports").select("*").order("created_at", { ascending: false }),
      supabase.from("approval_queue").select("*").order("created_at", { ascending: false }),
      supabase.from("sms_replies").select("*").order("timestamp", { ascending: false }),
    ]);

    if (reportsRes.data) setDailyReports(reportsRes.data as DailyReport[]);
    if (queueRes.data) setApprovalQueue(queueRes.data as ApprovalQueueItem[]);
    if (smsRes.data) setSmsReplies(smsRes.data as SMSReply[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchData();

    // Subscribe to realtime changes
    const channel = supabase
      .channel("live-data")
      .on("postgres_changes", { event: "*", schema: "public", table: "daily_reports" }, () => fetchData())
      .on("postgres_changes", { event: "*", schema: "public", table: "approval_queue" }, () => fetchData())
      .on("postgres_changes", { event: "*", schema: "public", table: "sms_replies" }, () => fetchData())
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchData]);

  const approveItem = async (id: string) => {
    await supabase.from("approval_queue").update({ status: "approved", approved_at: new Date().toISOString() }).eq("id", id);
  };

  const dismissItem = async (id: string) => {
    await supabase.from("approval_queue").update({ status: "dismissed", dismissed_at: new Date().toISOString() }).eq("id", id);
  };

  return {
    dailyReports,
    approvalQueue,
    smsReplies,
    loading,
    approveItem,
    dismissItem,
    refetch: fetchData,
  };
}
