export interface Agent {
  id: string;
  name: string;
  emoji: string;
  type: string;
  role: string;
  status: "active" | "idle" | "error" | "offline";
  currentActivity: string;
  lastSeen: string;
  tasksCompleted: number;
  accuracy: number;
  skills: string[];
  accentColor: string;
}

export interface Task {
  id: string;
  title: string;
  agentEmoji: string;
  agentName: string;
  priority: "low" | "medium" | "high" | "urgent";
  progress?: number;
  column: "todo" | "doing" | "needs-input" | "done";
}

export interface LogEntry {
  id: string;
  agentEmoji: string;
  agentName: string;
  message: string;
  category: "observation" | "general" | "reminder" | "fyi";
  timestamp: string;
}

export interface CouncilMessage {
  agentEmoji: string;
  agentName: string;
  message: string;
  messageNumber: number;
  timestamp: string;
}

export interface CouncilSession {
  id: string;
  question: string;
  status: "active" | "concluded" | "pending";
  participants: { emoji: string; name: string; sent: number; limit: number; status: "done" | "typing" | "waiting" }[];
  messages: CouncilMessage[];
}

export interface ActionItem {
  task: string;
  assignee: string;
  done: boolean;
}

export interface Meeting {
  id: string;
  type: string;
  title: string;
  date: string;
  duration_minutes: number;
  duration_display: string;
  attendees: string[];
  summary: string;
  action_items: ActionItem[];
  ai_insights: string;
  meeting_type: string;
  sentiment: string;
  has_external_participants: boolean;
  external_domains: string[];
  fathom_url: string | null;
  share_url: string | null;
}

export interface ActivityEvent {
  id: string;
  agentEmoji: string;
  agentName: string;
  action: string;
  timestamp: string;
}

export const agents: Agent[] = [
  {
    id: "alpha",
    name: "Agent Alpha",
    emoji: "🤖",
    type: "Code Agent",
    role: "Lead Engineer",
    status: "active",
    currentActivity: "Reviewing PR #142",
    lastSeen: "just now",
    tasksCompleted: 847,
    accuracy: 98.2,
    skills: ["TypeScript", "React", "Node.js", "Python", "Code Review", "Testing"],
    accentColor: "#10b981",
  },
  {
    id: "dispatch",
    name: "Dispatch Bot",
    emoji: "📋",
    type: "Coordinator",
    role: "Operations Director",
    status: "idle",
    currentActivity: "Awaiting new tasks",
    lastSeen: "2m ago",
    tasksCompleted: 1203,
    accuracy: 99.1,
    skills: ["Task Routing", "Priority Assessment", "Resource Allocation", "Scheduling"],
    accentColor: "#f59e0b",
  },
  {
    id: "audit",
    name: "Audit Bot",
    emoji: "🛡️",
    type: "Quality Agent",
    role: "Compliance Officer",
    status: "active",
    currentActivity: "Scanning codebase for vulnerabilities",
    lastSeen: "just now",
    tasksCompleted: 562,
    accuracy: 99.8,
    skills: ["Security Audit", "Code Quality", "Compliance", "Documentation", "Testing"],
    accentColor: "#06b6d4",
  },
];

export const tasks: Task[] = [
  { id: "t1", title: "Implement OAuth2 flow", agentEmoji: "🤖", agentName: "Agent Alpha", priority: "high", column: "todo" },
  { id: "t2", title: "Database migration script", agentEmoji: "🤖", agentName: "Agent Alpha", priority: "urgent", column: "todo" },
  { id: "t3", title: "Update API documentation", agentEmoji: "📋", agentName: "Dispatch Bot", priority: "medium", column: "todo" },
  { id: "t4", title: "Refactor auth middleware", agentEmoji: "🤖", agentName: "Agent Alpha", priority: "high", progress: 65, column: "doing" },
  { id: "t5", title: "Deploy staging environment", agentEmoji: "📋", agentName: "Dispatch Bot", priority: "medium", progress: 30, column: "doing" },
  { id: "t6", title: "Review security policies", agentEmoji: "🛡️", agentName: "Audit Bot", priority: "high", column: "needs-input" },
  { id: "t7", title: "Approve vendor access", agentEmoji: "📋", agentName: "Dispatch Bot", priority: "urgent", column: "needs-input" },
  { id: "t8", title: "Fix CORS configuration", agentEmoji: "🤖", agentName: "Agent Alpha", priority: "high", column: "done" },
  { id: "t9", title: "Compliance report Q1", agentEmoji: "🛡️", agentName: "Audit Bot", priority: "medium", column: "done" },
  { id: "t10", title: "Onboard new microservice", agentEmoji: "📋", agentName: "Dispatch Bot", priority: "low", column: "done" },
];

export const logEntries: LogEntry[] = [
  { id: "l1", agentEmoji: "🤖", agentName: "Agent Alpha", message: "Detected unusual commit pattern in repo backend-core. 14 commits in 30 minutes from same author.", category: "observation", timestamp: "2026-04-03T09:45:00Z" },
  { id: "l2", agentEmoji: "📋", agentName: "Dispatch Bot", message: "Task queue healthy. 3 tasks pending, 2 in progress. Average completion time: 23 minutes.", category: "general", timestamp: "2026-04-03T09:30:00Z" },
  { id: "l3", agentEmoji: "🛡️", agentName: "Audit Bot", message: "Reminder: Security audit for payment module due in 48 hours.", category: "reminder", timestamp: "2026-04-03T09:15:00Z" },
  { id: "l4", agentEmoji: "🤖", agentName: "Agent Alpha", message: "FYI: New TypeScript 5.8 features available. Consider upgrading project config.", category: "fyi", timestamp: "2026-04-03T09:00:00Z" },
  { id: "l5", agentEmoji: "📋", agentName: "Dispatch Bot", message: "Rerouted 3 low-priority tasks to next sprint based on capacity analysis.", category: "observation", timestamp: "2026-04-03T08:45:00Z" },
  { id: "l6", agentEmoji: "🛡️", agentName: "Audit Bot", message: "Code quality score improved from 87 to 91 after latest refactor.", category: "general", timestamp: "2026-04-03T08:30:00Z" },
  { id: "l7", agentEmoji: "🤖", agentName: "Agent Alpha", message: "Dependency vulnerability found: lodash@4.17.20 has prototype pollution risk.", category: "observation", timestamp: "2026-04-03T08:15:00Z" },
  { id: "l8", agentEmoji: "📋", agentName: "Dispatch Bot", message: "Reminder: Stand-up sync scheduled for 10:00 AM. All agents should report status.", category: "reminder", timestamp: "2026-04-03T08:00:00Z" },
  { id: "l9", agentEmoji: "🛡️", agentName: "Audit Bot", message: "FYI: New GDPR compliance checklist published. Updating internal policies.", category: "fyi", timestamp: "2026-04-03T07:45:00Z" },
  { id: "l10", agentEmoji: "🤖", agentName: "Agent Alpha", message: "Successfully merged 5 feature branches. All tests passing.", category: "general", timestamp: "2026-04-03T07:30:00Z" },
];

export const councilSessions: CouncilSession[] = [
  {
    id: "c1",
    question: "Should we migrate from REST to GraphQL for the public API?",
    status: "concluded",
    participants: [
      { emoji: "🤖", name: "Agent Alpha", sent: 3, limit: 3, status: "done" },
      { emoji: "📋", name: "Dispatch Bot", sent: 2, limit: 3, status: "done" },
      { emoji: "🛡️", name: "Audit Bot", sent: 3, limit: 3, status: "done" },
    ],
    messages: [
      { agentEmoji: "🤖", agentName: "Agent Alpha", message: "GraphQL would reduce over-fetching by ~40% based on current API usage patterns.", messageNumber: 1, timestamp: "2026-04-02T14:00:00Z" },
      { agentEmoji: "📋", agentName: "Dispatch Bot", message: "Migration would require 3 sprints. We should run both APIs in parallel during transition.", messageNumber: 2, timestamp: "2026-04-02T14:05:00Z" },
      { agentEmoji: "🛡️", agentName: "Audit Bot", message: "GraphQL introduces new attack surfaces. Need to implement query depth limiting and rate limiting per query complexity.", messageNumber: 3, timestamp: "2026-04-02T14:10:00Z" },
      { agentEmoji: "🤖", agentName: "Agent Alpha", message: "Agreed on security concerns. Recommend Apollo Server with persisted queries to mitigate risks.", messageNumber: 4, timestamp: "2026-04-02T14:15:00Z" },
      { agentEmoji: "📋", agentName: "Dispatch Bot", message: "Cost-benefit analysis: 3 sprint investment vs 40% performance gain. Recommend proceeding with phased rollout.", messageNumber: 5, timestamp: "2026-04-02T14:20:00Z" },
    ],
  },
  {
    id: "c2",
    question: "What monitoring stack should we adopt for the new microservices?",
    status: "active",
    participants: [
      { emoji: "🤖", name: "Agent Alpha", sent: 2, limit: 3, status: "typing" },
      { emoji: "📋", name: "Dispatch Bot", sent: 1, limit: 3, status: "waiting" },
      { emoji: "🛡️", name: "Audit Bot", sent: 1, limit: 3, status: "done" },
    ],
    messages: [
      { agentEmoji: "🛡️", agentName: "Audit Bot", message: "From compliance perspective, we need log retention for 90 days minimum. DataDog and Grafana Cloud both meet this.", messageNumber: 1, timestamp: "2026-04-03T10:00:00Z" },
      { agentEmoji: "🤖", agentName: "Agent Alpha", message: "Grafana + Prometheus + Loki gives us full observability with lower cost. We already use Prometheus for basic metrics.", messageNumber: 2, timestamp: "2026-04-03T10:05:00Z" },
      { agentEmoji: "📋", agentName: "Dispatch Bot", message: "Team capacity for setup: Grafana stack = 2 weeks, DataDog = 3 days but higher ongoing cost.", messageNumber: 3, timestamp: "2026-04-03T10:10:00Z" },
      { agentEmoji: "🤖", agentName: "Agent Alpha", message: "Proposing hybrid: Grafana Cloud for metrics/logs, PagerDuty for alerting. Best of both worlds.", messageNumber: 4, timestamp: "2026-04-03T10:15:00Z" },
    ],
  },
];

export const meetings: Meeting[] = [
  {
    id: "m1", type: "meeting", title: "Weekly Standup with Engineering", date: "2026-04-03T10:00:00Z",
    duration_minutes: 30, duration_display: "30m", attendees: ["Alice", "Bob", "Charlie"],
    summary: "**Sprint Progress Update**\n\nDiscussed sprint progress. Backend API is 80% complete. Frontend team ahead of schedule.\n\n- Auth module needs final review\n- Performance testing scheduled for Thursday\n- New hire onboarding going smoothly",
    action_items: [{ task: "Review PR #42", assignee: "Alice", done: false }, { task: "Update docs", assignee: "Bob", done: true }],
    ai_insights: "30 min standup with 3 attendees. Team velocity is 15% above average this sprint.",
    meeting_type: "standup", sentiment: "positive", has_external_participants: false, external_domains: [], fathom_url: null, share_url: null,
  },
  {
    id: "m2", type: "meeting", title: "Morning Standup", date: "2026-04-02T09:30:00Z",
    duration_minutes: 15, duration_display: "15m", attendees: ["Alice", "Dave", "Eve"],
    summary: "Quick status check. All tasks on track. No blockers reported.",
    action_items: [{ task: "Push hotfix to staging", assignee: "Dave", done: false }],
    ai_insights: "15 min standup. Shortest this month — team is well-aligned.",
    meeting_type: "standup", sentiment: "positive", has_external_participants: false, external_domains: [], fathom_url: null, share_url: null,
  },
  {
    id: "m3", type: "meeting", title: "Sales Call with Acme Corp", date: "2026-04-02T14:00:00Z",
    duration_minutes: 45, duration_display: "45m", attendees: ["Alice", "Frank", "Grace (Acme)"],
    summary: "**Enterprise Deal Discussion**\n\nPresented product demo to Acme Corp. Strong interest in enterprise tier. Key requirements: SSO, audit logs, SLA.\n\n- Budget approval expected by next week\n- Technical POC requested\n- Follow-up meeting scheduled",
    action_items: [{ task: "Send proposal to Grace", assignee: "Alice", done: false }, { task: "Prepare POC environment", assignee: "Frank", done: false }],
    ai_insights: "45 min sales call. High buying signals detected. 70% close probability estimated.",
    meeting_type: "sales", sentiment: "positive", has_external_participants: true, external_domains: ["acme.com"], fathom_url: "https://fathom.video/example", share_url: "https://share.example.com/m3",
  },
  {
    id: "m4", type: "meeting", title: "Sales Review with BetaTech", date: "2026-03-31T16:00:00Z",
    duration_minutes: 60, duration_display: "1h", attendees: ["Bob", "Hank (BetaTech)", "Ivy (BetaTech)"],
    summary: "Follow-up on Q1 contract renewal. BetaTech wants to upgrade to premium tier. Discussed pricing and feature roadmap.",
    action_items: [{ task: "Draft renewal contract", assignee: "Bob", done: true }, { task: "Schedule onboarding for premium features", assignee: "Bob", done: false }],
    ai_insights: "1h sales review with 2 external attendees. Renewal confidence: high.",
    meeting_type: "sales", sentiment: "positive", has_external_participants: true, external_domains: ["betatech.io"], fathom_url: null, share_url: null,
  },
  {
    id: "m5", type: "meeting", title: "Interview: Senior Backend Engineer", date: "2026-04-01T11:00:00Z",
    duration_minutes: 60, duration_display: "1h", attendees: ["Charlie", "Dave", "Candidate"],
    summary: "Technical interview for senior backend role. Candidate showed strong system design skills. Some gaps in distributed systems knowledge.",
    action_items: [{ task: "Submit interview scorecard", assignee: "Charlie", done: false }, { task: "Schedule culture fit round", assignee: "Dave", done: false }],
    ai_insights: "1h interview. Candidate scored 7/10 on technical assessment.",
    meeting_type: "interview", sentiment: "neutral", has_external_participants: true, external_domains: [], fathom_url: null, share_url: null,
  },
  {
    id: "m6", type: "meeting", title: "Q2 All-Hands", date: "2026-03-28T15:00:00Z",
    duration_minutes: 90, duration_display: "1h 30m", attendees: ["Alice", "Bob", "Charlie", "Dave", "Eve", "Frank"],
    summary: "**Q2 Planning & Retrospective**\n\nQ1 review: revenue up 23%, user growth 18%. Q2 priorities: international expansion, mobile app launch, enterprise features.\n\n- New office opening in Austin\n- Stock option refresh announced\n- Team awards ceremony",
    action_items: [{ task: "Publish Q2 OKRs", assignee: "Alice", done: true }, { task: "Set up Austin office IT", assignee: "Frank", done: false }],
    ai_insights: "1h 30m all-hands with full team. Positive sentiment across all topics.",
    meeting_type: "all-hands", sentiment: "positive", has_external_participants: false, external_domains: [], fathom_url: null, share_url: null,
  },
  {
    id: "m7", type: "meeting", title: "1-on-1: Alice & Bob", date: "2026-04-02T11:00:00Z",
    duration_minutes: 30, duration_display: "30m", attendees: ["Alice", "Bob"],
    summary: "Career development discussion. Bob interested in moving to architecture track. Discussed training budget and conference attendance.",
    action_items: [{ task: "Research architecture certifications", assignee: "Bob", done: false }],
    ai_insights: "30 min 1-on-1. Focus: career growth. Follow-up in 2 weeks recommended.",
    meeting_type: "1-on-1", sentiment: "positive", has_external_participants: false, external_domains: [], fathom_url: null, share_url: null,
  },
  {
    id: "m8", type: "meeting", title: "1-on-1: Charlie & Eve", date: "2026-03-30T10:00:00Z",
    duration_minutes: 25, duration_display: "25m", attendees: ["Charlie", "Eve"],
    summary: "Discussed project handoff for the monitoring dashboard. Eve taking over while Charlie focuses on API work.",
    action_items: [{ task: "Transfer project docs to Eve", assignee: "Charlie", done: true }],
    ai_insights: "25 min 1-on-1. Smooth handoff planned.",
    meeting_type: "1-on-1", sentiment: "neutral", has_external_participants: false, external_domains: [], fathom_url: null, share_url: null,
  },
  {
    id: "m9", type: "meeting", title: "Sprint Planning - Sprint 24", date: "2026-03-31T09:00:00Z",
    duration_minutes: 60, duration_display: "1h", attendees: ["Alice", "Bob", "Charlie", "Dave"],
    summary: "Planned Sprint 24. 42 story points committed. Focus areas: auth refactor, performance optimization, new onboarding flow.",
    action_items: [{ task: "Break down auth epic into stories", assignee: "Alice", done: false }, { task: "Set up perf benchmarks", assignee: "Dave", done: false }],
    ai_insights: "1h planning session. Velocity target: 42 points (avg last 3 sprints: 38).",
    meeting_type: "planning", sentiment: "neutral", has_external_participants: false, external_domains: [], fathom_url: null, share_url: null,
  },
  {
    id: "m10", type: "meeting", title: "Frontend Team Sync", date: "2026-04-01T14:00:00Z",
    duration_minutes: 45, duration_display: "45m", attendees: ["Eve", "Frank", "Dave"],
    summary: "Reviewed component library progress. New design system tokens approved. Accessibility audit results discussed — 3 critical issues found.",
    action_items: [{ task: "Fix accessibility issues", assignee: "Eve", done: false }, { task: "Publish component library v2.1", assignee: "Frank", done: false }],
    ai_insights: "45 min team sync. 3 critical a11y issues need immediate attention.",
    meeting_type: "team", sentiment: "neutral", has_external_participants: false, external_domains: [], fathom_url: null, share_url: null,
  },
];

export const activityFeed: ActivityEvent[] = [
  { id: "a1", agentEmoji: "🤖", agentName: "Agent Alpha", action: "Merged PR #142 — Auth middleware refactor", timestamp: "2 min ago" },
  { id: "a2", agentEmoji: "🛡️", agentName: "Audit Bot", action: "Completed security scan on payment module", timestamp: "5 min ago" },
  { id: "a3", agentEmoji: "📋", agentName: "Dispatch Bot", action: "Assigned 3 new tasks to sprint backlog", timestamp: "12 min ago" },
  { id: "a4", agentEmoji: "🤖", agentName: "Agent Alpha", action: "Deployed hotfix v2.4.1 to staging", timestamp: "18 min ago" },
  { id: "a5", agentEmoji: "🛡️", agentName: "Audit Bot", action: "Flagged dependency vulnerability in lodash", timestamp: "25 min ago" },
  { id: "a6", agentEmoji: "📋", agentName: "Dispatch Bot", action: "Rerouted 2 tasks based on priority change", timestamp: "32 min ago" },
  { id: "a7", agentEmoji: "🤖", agentName: "Agent Alpha", action: "Resolved 4 code review comments", timestamp: "45 min ago" },
  { id: "a8", agentEmoji: "🛡️", agentName: "Audit Bot", action: "Generated Q1 compliance report", timestamp: "1h ago" },
];
