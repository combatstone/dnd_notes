import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Timeline from "@/pages/timeline";
import Characters from "@/pages/characters";
import Plots from "@/pages/plots";
import Lore from "@/pages/lore";
import AuditLog from "@/pages/audit-log";
import Sidebar from "@/components/layout/sidebar";
import RightSidebar from "@/components/layout/right-sidebar";
import UploadModal from "@/components/modals/upload-modal";
import { useState } from "react";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Timeline} />
      <Route path="/timeline" component={Timeline} />
      <Route path="/characters" component={Characters} />
      <Route path="/plots" component={Plots} />
      <Route path="/lore" component={Lore} />
      <Route path="/audit-log" component={AuditLog} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <div className="flex h-screen overflow-hidden">
          <Sidebar onOpenUpload={() => setIsUploadModalOpen(true)} />
          <main className="flex-1 flex flex-col overflow-hidden">
            <Router />
          </main>
          <RightSidebar />
        </div>
        <UploadModal 
          isOpen={isUploadModalOpen} 
          onClose={() => setIsUploadModalOpen(false)} 
        />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
