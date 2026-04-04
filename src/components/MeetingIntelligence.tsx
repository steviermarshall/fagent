import { motion, AnimatePresence } from "framer-motion";
import { useState, useMemo } from "react";
import { Calendar, TrendingUp, CheckSquare, Clock, Search, Globe, Sparkles, ExternalLink, Share2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { format, parseISO, isAfter, subDays } from "date-fns";
import DOMPurify from "dompurify";
import { useMeetings } from "@/hooks/useSupabaseData";

const meetingTypeColors: Record<string, string> = {
  "1-on-1": "#60a5fa", external: "#a78bfa", sales: "#34d399", team: "#fb923c",
  standup: "#818cf8", planning: "#2dd4bf", interview: "#f472b6", "all-hands": "#facc15",
};

const meetingTypeBadgeClasses: Record<string, string> = {
  "1-on-1": "bg-blue-400/15 text-blue-400 border-blue-400/30",
  sales: "bg-emerald-400/15 text-emerald-400 border-emerald-400/30",
  standup: "bg-indigo-400/15 text-indigo-400 border-indigo-400/30",
  planning: "bg-teal-400/15 text-teal-400 border-teal-400/30",
  interview: "bg-pink-400/15 text-pink-400 border-pink-400/30",
  "all-hands": "bg-yellow-400/15 text-yellow-400 border-yellow-400/30",
  team: "bg-orange-400/15 text-orange-400 border-orange-400/30",
};

const KPICard = ({ icon: Icon, label, value, delay }: { icon: any; label: string; value: string; delay: number }) => (
  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay, duration: 0.4 }} className="glass-card-hover p-5">
    <div className="p-2 rounded-lg bg-primary/10 glow-emerald w-fit mb-3">
      <Icon className="w-5 h-5 text-primary" />
    </div>
    <p className="text-3xl font-bold font-heading text-foreground">{value}</p>
    <p className="text-sm text-muted-foreground mt-1">{label}</p>
  </motion.div>
);

const MeetingIntelligence = () => {
  const { meetings, loading } = useMeetings();
  const [searchQuery, setSearchQuery] = useState("");
  const [dateRange, setDateRange] = useState("all");
  const [sortBy, setSortBy] = useState("recent");
  const [hasActionItems, setHasActionItems] = useState(false);
  const [externalOnly, setExternalOnly] = useState(false);
  const [expandedMeeting, setExpandedMeeting] = useState<string | null>(null);

  const actionItems = (m: any) => (Array.isArray(m.action_items) ? m.action_items : []) as { task: string; assignee: string; done: boolean }[];

  const totalMeetings = meetings.length;
  const thisWeek = meetings.filter((m) => m.date && isAfter(parseISO(m.date), subDays(new Date(), 7))).length;
  const openActions = meetings.reduce((sum, m) => sum + actionItems(m).filter((a) => !a.done).length, 0);
  const avgDuration = meetings.length ? Math.round(meetings.reduce((sum, m) => sum + (m.duration_minutes || 0), 0) / meetings.length) : 0;

  const typeData = useMemo(() => {
    const counts: Record<string, number> = {};
    meetings.forEach((m) => { const t = m.type || "other"; counts[t] = (counts[t] || 0) + 1; });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [meetings]);

  const monthData = useMemo(() => {
    const counts: Record<string, number> = {};
    meetings.forEach((m) => {
      if (!m.date) return;
      const month = format(parseISO(m.date), "MMM");
      counts[month] = (counts[month] || 0) + 1;
    });
    return Object.entries(counts).map(([month, count]) => ({ month, count }));
  }, [meetings]);

  const filtered = useMemo(() => {
    let result = [...meetings];
    if (searchQuery) result = result.filter((m) => m.title.toLowerCase().includes(searchQuery.toLowerCase()));
    if (dateRange !== "all") {
      const days = parseInt(dateRange);
      result = result.filter((m) => m.date && isAfter(parseISO(m.date), subDays(new Date(), days)));
    }
    if (hasActionItems) result = result.filter((m) => actionItems(m).some((a) => !a.done));
    if (externalOnly) result = result.filter((m) => m.has_external);
    result.sort((a, b) => {
      if (sortBy === "recent") return new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime();
      if (sortBy === "oldest") return new Date(a.date || 0).getTime() - new Date(b.date || 0).getTime();
      return (b.duration_minutes || 0) - (a.duration_minutes || 0);
    });
    return result;
  }, [meetings, searchQuery, dateRange, sortBy, hasActionItems, externalOnly]);

  if (loading) return <p className="text-sm text-muted-foreground">Loading meetings...</p>;
  if (meetings.length === 0) return <p className="text-sm text-muted-foreground">No meetings found.</p>;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard icon={Calendar} label="Total Meetings" value={String(totalMeetings)} delay={0} />
        <KPICard icon={TrendingUp} label="This Week" value={String(thisWeek)} delay={0.05} />
        <KPICard icon={CheckSquare} label="Open Action Items" value={String(openActions)} delay={0.1} />
        <KPICard icon={Clock} label="Avg Duration" value={`${avgDuration}m`} delay={0.15} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="glass-card p-5">
          <h3 className="text-sm font-semibold text-foreground mb-4">Meeting Type Distribution</h3>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie data={typeData} cx="50%" cy="50%" innerRadius={50} outerRadius={85} dataKey="value" paddingAngle={4} strokeWidth={0}>
                {typeData.map((entry) => <Cell key={entry.name} fill={meetingTypeColors[entry.name] || "#6b7280"} />)}
              </Pie>
              <Tooltip contentStyle={{ background: "rgba(17,24,39,0.9)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, color: "#f9fafb" }} />
              <Legend formatter={(value) => <span className="text-xs text-muted-foreground capitalize">{value}</span>} />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25 }} className="glass-card p-5">
          <h3 className="text-sm font-semibold text-foreground mb-4">Monthly Trend</h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={monthData}>
              <XAxis dataKey="month" tick={{ fill: "#9ca3af", fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#9ca3af", fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: "rgba(17,24,39,0.9)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, color: "#f9fafb" }} />
              <Bar dataKey="count" fill="#10b981" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="glass-card p-5">
        <div className="flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search meetings..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10 bg-secondary/50 border-border text-foreground" />
          </div>
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-32 bg-secondary/50 border-border text-foreground"><SelectValue /></SelectTrigger>
            <SelectContent className="glass-card border-border">
              <SelectItem value="all">All Time</SelectItem>
              <SelectItem value="7">7 Days</SelectItem>
              <SelectItem value="30">30 Days</SelectItem>
              <SelectItem value="90">90 Days</SelectItem>
            </SelectContent>
          </Select>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-40 bg-secondary/50 border-border text-foreground"><SelectValue /></SelectTrigger>
            <SelectContent className="glass-card border-border">
              <SelectItem value="recent">Most Recent</SelectItem>
              <SelectItem value="oldest">Oldest First</SelectItem>
              <SelectItem value="longest">Longest Duration</SelectItem>
            </SelectContent>
          </Select>
          <Button variant={hasActionItems ? "default" : "outline"} size="sm" onClick={() => setHasActionItems(!hasActionItems)}
            className={hasActionItems ? "bg-primary text-primary-foreground" : "border-border text-muted-foreground"}>Action Items</Button>
          <Button variant={externalOnly ? "default" : "outline"} size="sm" onClick={() => setExternalOnly(!externalOnly)}
            className={externalOnly ? "bg-primary text-primary-foreground" : "border-border text-muted-foreground"}>
            <Globe className="w-3 h-3 mr-1" /> External
          </Button>
        </div>
      </motion.div>

      <ScrollArea className="h-[600px]">
        <div className="space-y-3 pr-4">
          {filtered.map((meeting, i) => {
            const items = actionItems(meeting);
            const durationDisplay = meeting.duration_minutes ? (meeting.duration_minutes >= 60 ? `${Math.floor(meeting.duration_minutes / 60)}h ${meeting.duration_minutes % 60}m` : `${meeting.duration_minutes}m`) : "";
            return (
              <motion.div key={meeting.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }} className="glass-card-hover overflow-hidden">
                <button onClick={() => setExpandedMeeting(expandedMeeting === meeting.id ? null : meeting.id)} className="w-full p-4 flex items-center gap-4 text-left">
                  <Badge variant="outline" className={`text-xs border flex-shrink-0 ${meetingTypeBadgeClasses[meeting.type] || "border-border text-muted-foreground"}`}>
                    {meeting.type || "meeting"}
                  </Badge>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">{meeting.title}</p>
                    <p className="text-xs text-muted-foreground">{meeting.date ? format(parseISO(meeting.date), "MMM d, yyyy · h:mm a") : ""}</p>
                  </div>
                  <span className="text-xs font-mono text-muted-foreground flex-shrink-0">{durationDisplay}</span>
                  {meeting.attendees && (
                    <div className="flex -space-x-2 flex-shrink-0">
                      {meeting.attendees.slice(0, 3).map((a: string) => (
                        <div key={a} className="w-7 h-7 rounded-full bg-secondary flex items-center justify-center border-2 border-background text-xs font-medium text-foreground">{a[0]}</div>
                      ))}
                      {meeting.attendees.length > 3 && (
                        <div className="w-7 h-7 rounded-full bg-secondary flex items-center justify-center border-2 border-background text-xs text-muted-foreground">+{meeting.attendees.length - 3}</div>
                      )}
                    </div>
                  )}
                  {items.filter((a) => !a.done).length > 0 && (
                    <Badge className="bg-warning/15 text-warning border-warning/30 text-xs flex-shrink-0">
                      {items.filter((a) => !a.done).length} action{items.filter((a) => !a.done).length > 1 ? "s" : ""}
                    </Badge>
                  )}
                  {meeting.has_external && <Globe className="w-4 h-4 text-muted-foreground flex-shrink-0" />}
                </button>

                <AnimatePresence>
                  {expandedMeeting === meeting.id && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3 }} className="overflow-hidden">
                      <div className="px-4 pb-4 border-t border-border pt-4 space-y-4">
                        {meeting.summary && (
                          <div className="text-sm text-muted-foreground leading-relaxed prose prose-invert prose-sm max-w-none"
                            dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(meeting.summary.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>").replace(/\n/g, "<br/>")) }} />
                        )}
                        {items.length > 0 && (
                          <div>
                            <p className="text-xs font-semibold text-foreground mb-2">Action Items</p>
                            <div className="space-y-1.5">
                              {items.map((item, idx) => (
                                <div key={idx} className="flex items-center gap-2">
                                  <div className={`w-4 h-4 rounded border flex items-center justify-center ${item.done ? "bg-primary border-primary" : "border-border"}`}>
                                    {item.done && <span className="text-xs text-primary-foreground">✓</span>}
                                  </div>
                                  <span className={`text-sm ${item.done ? "line-through text-muted-foreground" : "text-foreground"}`}>{item.task}</span>
                                  <span className="text-xs text-muted-foreground ml-auto">{item.assignee}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        {meeting.ai_insights && (
                          <div className="flex items-start gap-2 p-3 rounded-lg bg-secondary/30">
                            <Sparkles className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                            <p className="text-xs text-muted-foreground">{meeting.ai_insights}</p>
                          </div>
                        )}
                        {meeting.attendees && (
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="text-xs text-muted-foreground">Attendees: {meeting.attendees.join(", ")}</p>
                            {meeting.external_domains && meeting.external_domains.length > 0 && (
                              <span className="text-xs text-muted-foreground">· External: {meeting.external_domains.join(", ")}</span>
                            )}
                          </div>
                        )}
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" className="border-border text-foreground hover:bg-secondary text-xs">
                            <ExternalLink className="w-3 h-3 mr-1" /> Open Recording
                          </Button>
                          <Button variant="outline" size="sm" className="border-border text-foreground hover:bg-secondary text-xs">
                            <Share2 className="w-3 h-3 mr-1" /> Share Link
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
};

export default MeetingIntelligence;
