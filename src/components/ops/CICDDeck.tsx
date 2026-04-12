import { motion } from "framer-motion";
import { GitBranch, Clock, CheckCircle, XCircle, Zap } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useGithubDeploys, useLogs } from "@/hooks/useSupabaseData";
import { formatDistanceToNow } from "date-fns";

const sectionTitle = "text-[11px] uppercase tracking-[2px] text-muted-foreground font-mono mb-3";
const fadeUp = (i: number) => ({ initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { delay: i * 0.06 } });

const Beacon = ({ color = "#34d399" }: { color?: string }) => (
  <span className="relative flex h-2 w-2">
    <span className="animate-beacon absolute inline-flex h-full w-full rounded-full opacity-75" style={{ backgroundColor: color }} />
    <span className="relative inline-flex rounded-full h-2 w-2" style={{ backgroundColor: color }} />
  </span>
);

const PipelineStep = ({ label, ok }: { label: string; ok: boolean }) => (
  <div className="flex items-center gap-1.5">
    {ok ? <CheckCircle className="w-3.5 h-3.5 text-primary" /> : <XCircle className="w-3.5 h-3.5 text-red-400" />}
    <span className="text-xs font-mono text-foreground">{label}</span>
  </div>
);

const cronJobs = [
  { name: "Deal Brief", time: "7:00 AM" },
  { name: "Email Batch", time: "8:00 AM" },
  { name: "SMS Queue", time: "10:00 AM" },
  { name: "Action Trigger", time: "12:05 PM" },
  { name: "Sheets Sync", time: "*/15 min" },
  { name: "Health Check", time: "*/5 min" },
];

const CICDDeck = () => {
  const { deploys } = useGithubDeploys();
  const { logs } = useLogs();
  const latest = deploys[0];

  return (
    <div className="space-y-6">
      <p className={sectionTitle}>CI/CD PIPELINE</p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left — GitHub Deploy */}
        <div className="lg:col-span-2 space-y-4">
          <motion.div {...fadeUp(0)} className="glass-card p-5">
            <div className="flex items-center gap-2 mb-4">
              <GitBranch className="w-4 h-4 text-cyan-400" />
              <span className={sectionTitle + " !mb-0"}>GITHUB DEPLOY</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
              <div>
                <p className="text-[9px] text-muted-foreground font-mono uppercase">Branch</p>
                <p className="text-sm font-bold font-mono text-foreground">{latest?.branch ?? "main"}</p>
              </div>
              <div>
                <p className="text-[9px] text-muted-foreground font-mono uppercase">Last Deploy</p>
                <p className="text-sm font-bold font-mono text-foreground">
                  {latest ? formatDistanceToNow(new Date(latest.deployed_at), { addSuffix: true }) : "N/A"}
                </p>
              </div>
              <div>
                <p className="text-[9px] text-muted-foreground font-mono uppercase">Auto-Deploy</p>
                <p className="text-sm font-bold font-mono text-primary">ON</p>
              </div>
              <div>
                <p className="text-[9px] text-muted-foreground font-mono uppercase">Commits Today</p>
                <p className="text-sm font-bold font-mono text-foreground">{deploys.length}</p>
              </div>
            </div>

            <p className={sectionTitle}>PIPELINE STATUS</p>
            <div className="flex flex-wrap gap-4">
              <PipelineStep label="lint" ok={latest?.pipeline_lint ?? true} />
              <PipelineStep label="test" ok={latest?.pipeline_test ?? true} />
              <PipelineStep label="build" ok={latest?.pipeline_build ?? true} />
              <PipelineStep label="deploy" ok={latest?.pipeline_deploy ?? true} />
              <PipelineStep label="healthCheck" ok={latest?.pipeline_health ?? true} />
            </div>
          </motion.div>

          <motion.div {...fadeUp(1)} className="glass-card p-5 border-l-2 border-l-cyan-500/50">
            <p className={sectionTitle}>SELF-HEALING PIPELINE</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono text-foreground/80">
              {[
                "Auto-lint on push",
                "Error detection + self-fix",
                "Rollback on failure",
                "Continuous code pull",
                "Health check every 5min",
              ].map((item) => (
                <div key={item} className="flex items-center gap-2">
                  <CheckCircle className="w-3 h-3 text-primary flex-shrink-0" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Right — Cron Schedule */}
        <motion.div {...fadeUp(2)} className="glass-card p-5">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-4 h-4 text-amber-400" />
            <span className={sectionTitle + " !mb-0"}>CRON SCHEDULE</span>
          </div>
          <div className="space-y-3">
            {cronJobs.map((job) => (
              <div key={job.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Beacon color="#34d399" />
                  <span className="text-xs font-mono text-foreground">{job.name}</span>
                </div>
                <span className="text-[10px] font-mono text-muted-foreground">{job.time}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Bottom — Deploy & System Log */}
      <motion.div {...fadeUp(3)} className="glass-card p-5">
        <div className="flex items-center gap-2 mb-3">
          <Zap className="w-4 h-4 text-cyan-400" />
          <span className={sectionTitle + " !mb-0"}>DEPLOY & SYSTEM LOG</span>
          <Beacon />
        </div>
        <ScrollArea className="h-48">
          <div className="space-y-2">
            {deploys.map((d: any) => (
              <div key={d.id} className="flex items-start gap-2 text-xs">
                <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-400">
                  DEPLOY
                </span>
                <span className="text-foreground/80 flex-1 font-mono">
                  {d.commit_sha?.slice(0, 7) ?? "—"} {d.commit_message ?? `Deploy to ${d.branch}`}
                </span>
                <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded ${d.status === "success" ? "bg-primary/15 text-primary" : "bg-red-500/15 text-red-400"}`}>
                  {d.status}
                </span>
                <span className="text-[9px] text-muted-foreground font-mono whitespace-nowrap">
                  {formatDistanceToNow(new Date(d.deployed_at), { addSuffix: true })}
                </span>
              </div>
            ))}
            {logs.slice(0, 10).map((log: any) => (
              <div key={log.id} className="flex items-start gap-2 text-xs">
                <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400">
                  {log.agent_emoji} LOG
                </span>
                <span className="text-foreground/80 flex-1">{log.message}</span>
                <span className="text-[9px] text-muted-foreground font-mono whitespace-nowrap">
                  {log.timestamp ? formatDistanceToNow(new Date(log.timestamp), { addSuffix: true }) : ""}
                </span>
              </div>
            ))}
            {!deploys.length && !logs.length && <p className="text-xs text-muted-foreground">No deploy data yet</p>}
          </div>
        </ScrollArea>
      </motion.div>
    </div>
  );
};

export default CICDDeck;
