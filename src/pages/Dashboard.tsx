import { motion } from "framer-motion";
import { AlertCircle, CheckCircle2, Clock, Mail, MessageSquare, TrendingUp, Loader2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useLiveData } from "@/hooks/useLiveData";

export default function Dashboard() {
  const { dailyReports, approvalQueue, smsReplies, loading, approveItem, dismissItem } = useLiveData();

  const pipelineReport = dailyReports.find(r => r.report_type === "pipeline")?.data;
  const bookReport = dailyReports.find(r => r.report_type === "book")?.data;
  const campaignReport = dailyReports.find(r => r.report_type === "campaign")?.data;

  const pendingApprovals = approvalQueue.filter(a => a.status === "pending");

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-[1600px] mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Dashboard</h1>
          <p className="text-muted-foreground">Real-time operations overview</p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0 }}>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Active Pipeline</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${(pipelineReport?.total_pipeline_value || 0) / 1000}K</div>
                <p className="text-xs text-muted-foreground mt-1">{pipelineReport?.total_active || 0} active files</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Funded (MTD)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${(pipelineReport?.total_funded || 0) / 1000}K</div>
                <p className="text-xs text-muted-foreground mt-1">{pipelineReport?.total_funded ? "✅ On track" : "—"}</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Pending Approval</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{pendingApprovals.length}</div>
                <p className="text-xs text-muted-foreground mt-1">Items in queue</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Blocked Deals</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{pipelineReport?.blocked_count || 0}</div>
                <p className="text-xs text-muted-foreground mt-1">Missing documentation</p>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Pipeline Status */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="lg:col-span-2">
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Pipeline Status
                </CardTitle>
                <CardDescription>Current deal flow</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {pipelineReport?.top_5 ? (
                  pipelineReport.top_5.map((deal: any) => (
                    <div key={deal.company} className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
                      <div>
                        <p className="font-medium text-sm">{deal.company}</p>
                        <p className="text-xs text-muted-foreground">{deal.stage}</p>
                      </div>
                      <Badge>${deal.value / 1000}K</Badge>
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground text-sm">No data yet</p>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* SMS Replies */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <MessageSquare className="w-5 h-5" />
                  Recent SMS
                </CardTitle>
                <CardDescription>{smsReplies.length} replies</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[300px]">
                  <div className="space-y-2">
                    {smsReplies.slice(0, 5).map((sms) => (
                      <div key={sms.id} className="text-xs p-2 bg-secondary/50 rounded border border-border/50">
                        <p className="font-medium">{sms.contact_name || sms.from_number}</p>
                        <p className="text-muted-foreground line-clamp-2">{sms.message}</p>
                      </div>
                    ))}
                    {smsReplies.length === 0 && <p className="text-muted-foreground text-xs">No replies yet</p>}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Approval Queue */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                Pending Approval ({pendingApprovals.length})
              </CardTitle>
              <CardDescription>Review and approve before sending</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="w-full h-[400px]">
                <div className="space-y-4 pr-4">
                  {pendingApprovals.length > 0 ? (
                    pendingApprovals.map((item) => (
                      <div key={item.id} className="p-4 border border-border rounded-lg space-y-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">{item.contact_name}</p>
                            <p className="text-sm text-muted-foreground">{item.company}</p>
                          </div>
                          <Badge variant="outline">{item.trigger_reason}</Badge>
                        </div>

                        {item.suggested_email_subject && (
                          <div className="bg-secondary/30 p-2 rounded text-xs space-y-1">
                            <p className="font-medium flex items-center gap-2">
                              <Mail className="w-4 h-4" />
                              {item.suggested_email_subject}
                            </p>
                            <p className="text-muted-foreground line-clamp-2">{item.suggested_email_body}</p>
                          </div>
                        )}

                        {item.suggested_sms && (
                          <div className="bg-secondary/30 p-2 rounded text-xs space-y-1">
                            <p className="font-medium flex items-center gap-2">
                              <MessageSquare className="w-4 h-4" />
                              SMS
                            </p>
                            <p className="text-muted-foreground line-clamp-2">{item.suggested_sms}</p>
                          </div>
                        )}

                        <div className="flex gap-2 pt-2">
                          <Button size="sm" onClick={() => approveItem(item.id)} className="gap-2 flex-1">
                            <CheckCircle2 className="w-4 h-4" />
                            Approve
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => dismissItem(item.id)} className="flex-1">
                            Dismiss
                          </Button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-muted-foreground text-center py-8">No pending approvals</p>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
