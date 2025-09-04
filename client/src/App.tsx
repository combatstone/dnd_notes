import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import { Timeline } from "@/pages/timeline";
import CharactersPage from "@/pages/characters";
import PlotsPage from "@/pages/plots";
import LorePage from "@/pages/lore";
import AuditLogPage from "@/pages/audit-log";
import Sidebar from "@/components/layout/sidebar";
import RightSidebar from "@/components/layout/right-sidebar";
import UploadModal from "@/components/modals/upload-modal";
import { useState } from "react";

function App() {
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="flex h-screen overflow-hidden bg-background">
          <Sidebar onOpenUpload={() => setIsUploadModalOpen(true)} />
          <main className="flex-1 flex flex-col overflow-hidden p-4 md:p-6 lg:p-8">
            <Switch>
              <Route path="/" component={Timeline} />
              <Route path="/timeline" component={Timeline} />
              <Route path="/characters" component={CharactersPage} />
              <Route path="/plots" component={PlotsPage} />
              <Route path="/lore" component={LorePage} />
              <Route path="/audit-log" component={AuditLogPage} />
              <Route component={NotFound} />
            </Switch>
          </main>
          <RightSidebar />
        </div>
        <UploadModal
          isOpen={isUploadModalOpen}
          onClose={() => setIsUploadModalOpen(false)}
        />
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;