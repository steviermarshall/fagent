import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Activity, Send, LayoutDashboard, Users, Kanban, Database, GitBranch, ScrollText, MessagesSquare, BarChart3 } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import NeuralMesh from "@/components/NeuralMesh";
import CommandDeck from "@/components/CommandDeck";
import AgentProfiles from "@/components/AgentProfiles";
import TaskBoard from "@/components/TaskBoard";
import AILog from "@/components/AILog";
import Council from "@/components/Council";
import MeetingIntelligence from "@/components/MeetingIntelligence";
import OperationsDeck from "@/components/ops/OperationsDeck";
import OutreachDeck from "@/components/ops/OutreachDeck";
import DataFeedsDeck from "@/components/ops/DataFeedsDeck";
import CICDDeck from "@/components/ops/CICDDeck";

const tabs = [
  { id: "operations", label: "Operations", icon: Activity },
  { id: "outreach", label: "Outreach", icon: Send },
  { id: "command", label: "Command Deck", icon: LayoutDashboard },
  { id: "agents", label: "Agents", icon: Users },
  { id: "tasks", label: "Task Board", icon: Kanban },
  { id: "datafeeds", label: "Data Feeds", icon: Database },
  { id: "cicd", label: "CI/CD", icon: GitBranch },
  { id: "log", label: "AI Log", icon: ScrollText },
  { id: "council", label: "Council", icon: MessagesSquare },
  { id: "meetings", label: "Meetings", icon: BarChart3 },
];

const Index = () => {
  const [activeTab, setActiveTab] = useState("operations");

  return (
    <>
      <NeuralMesh />
      <div className="relative min-h-screen p-4 md:p-6 lg:p-8" style={{ zIndex: 1 }}>
        <div className="max-w-7xl mx-auto">
          <Header />
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="glass-card w-full justify-start flex-wrap h-auto gap-1 p-1.5 mb-6">
              {tabs.map((tab, i) => (
                <motion.div
                  key={tab.id}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <TabsTrigger
                    value={tab.id}
                    className="data-[state=active]:bg-primary/15 data-[state=active]:text-primary text-muted-foreground gap-2 text-sm"
                  >
                    <tab.icon className="w-4 h-4" />
                    <span className="hidden sm:inline">{tab.label}</span>
                  </TabsTrigger>
                </motion.div>
              ))}
            </TabsList>

            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <TabsContent value="operations" className="mt-0"><OperationsDeck /></TabsContent>
                <TabsContent value="outreach" className="mt-0"><OutreachDeck /></TabsContent>
                <TabsContent value="command" className="mt-0"><CommandDeck /></TabsContent>
                <TabsContent value="agents" className="mt-0"><AgentProfiles /></TabsContent>
                <TabsContent value="tasks" className="mt-0"><TaskBoard /></TabsContent>
                <TabsContent value="datafeeds" className="mt-0"><DataFeedsDeck /></TabsContent>
                <TabsContent value="cicd" className="mt-0"><CICDDeck /></TabsContent>
                <TabsContent value="log" className="mt-0"><AILog /></TabsContent>
                <TabsContent value="council" className="mt-0"><Council /></TabsContent>
                <TabsContent value="meetings" className="mt-0"><MeetingIntelligence /></TabsContent>
              </motion.div>
            </AnimatePresence>
          </Tabs>
          <Footer />
        </div>
      </div>
    </>
  );
};

export default Index;
