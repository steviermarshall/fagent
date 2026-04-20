import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import NeuralMesh from "@/components/NeuralMesh";
import Sidebar from "@/components/shell/Sidebar";
import CommandBar from "@/components/shell/CommandBar";
import { MobileBottomTabs } from "@/components/shell/MobileNav";
import Footer from "@/components/Footer";

import CommandDeck from "@/components/CommandDeck";
import SMSTab from "@/components/SMSTab";
import TaskBoard from "@/components/TaskBoard";
import SheetsTab from "@/components/SheetsTab";
import Council from "@/components/Council";
import MeetingIntelligence from "@/components/MeetingIntelligence";
import OperationsDeck from "@/components/ops/OperationsDeck";
import OutreachDeck from "@/components/ops/OutreachDeck";
import DataFeedsDeck from "@/components/ops/DataFeedsDeck";
import CICDDeck from "@/components/ops/CICDDeck";

const NAV_LABELS: Record<string, string> = {
  sheets: "📊 Sheets",
  sms: "💬 SMS",
  council: "⚖️ Council",
  datafeeds: "🏢 Data",
  meetings: "🗓️ Meetings",
  cicd: "⚙️ CI/CD",
  operations: "Operations",
  outreach: "Outreach",
  command: "Command",
  tasks: "Tasks",
};

const Index = () => {
  const [activeTab, setActiveTab] = useState("sheets");

  return (
    <>
      <NeuralMesh />
      <div className="relative min-h-screen flex" style={{ zIndex: 1 }}>
        <Sidebar active={activeTab} onChange={setActiveTab} />

        <div className="flex-1 min-w-0 md:pl-[56px]">
          <CommandBar active={activeTab} onNavChange={setActiveTab} />

          <main className="px-3 sm:px-5 lg:px-8 py-4 sm:py-6 pb-20 md:pb-6 max-w-[1400px] mx-auto">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.18 }}
                >
                  <TabsContent value="sheets" className="mt-0"><SheetsTab /></TabsContent>
                  <TabsContent value="sms" className="mt-0"><SMSTab /></TabsContent>
                  <TabsContent value="council" className="mt-0"><Council /></TabsContent>
                  <TabsContent value="datafeeds" className="mt-0"><DataFeedsDeck /></TabsContent>
                  <TabsContent value="meetings" className="mt-0"><MeetingIntelligence /></TabsContent>
                  <TabsContent value="cicd" className="mt-0"><CICDDeck /></TabsContent>
                  <TabsContent value="operations" className="mt-0"><OperationsDeck /></TabsContent>
                  <TabsContent value="outreach" className="mt-0"><OutreachDeck /></TabsContent>
                  <TabsContent value="command" className="mt-0"><CommandDeck /></TabsContent>
                  <TabsContent value="tasks" className="mt-0"><TaskBoard /></TabsContent>
                </motion.div>
              </AnimatePresence>
            </Tabs>
            <Footer />
          </main>
        </div>
      </div>
      <MobileBottomTabs active={activeTab} onChange={setActiveTab} />
    </>
  );
};

export default Index;
