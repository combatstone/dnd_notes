import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Clock, Users, Scroll, Globe, Upload, Search, Sparkles } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import type { Campaign } from "@shared/schema";

interface SidebarProps {
  onOpenUpload: () => void;
}

export default function Sidebar({ onOpenUpload }: SidebarProps) {
  const [location] = useLocation();

  const { data: campaigns } = useQuery<Campaign[]>({
    queryKey: ["/api/campaigns"],
  });

  const currentCampaign = campaigns?.[0]; // Using first campaign as default

  const navItems = [
    { href: "/timeline", label: "Timeline", icon: Clock },
    { href: "/characters", label: "Characters & NPCs", icon: Users },
    { href: "/plots", label: "Plot Summary", icon: Scroll },
    { href: "/lore", label: "World Lore", icon: Globe },
  ];

  const toolItems = [
    { label: "Import Documents", icon: Upload, onClick: onOpenUpload },
    { label: "Search All Content", icon: Search, onClick: () => console.log("Search clicked") },
    { label: "AI Insights", icon: Sparkles, onClick: () => console.log("AI Insights clicked") },
  ];

  return (
    <aside className="w-64 bg-card border-r border-border flex flex-col" data-testid="sidebar">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
          <span className="text-primary">🐉</span>
          Campaign Chronicle
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Digital DM Notebook</p>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 p-4">
        <div className="space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location === item.href || (location === "/" && item.href === "/timeline");
            
            return (
              <Link key={item.href} href={item.href}>
                <Button
                  variant={isActive ? "default" : "ghost"}
                  className={`w-full justify-start gap-3 ${
                    isActive 
                      ? "bg-primary text-primary-foreground" 
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  }`}
                  data-testid={`nav-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Button>
              </Link>
            );
          })}
        </div>

        <div className="mt-8">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            Tools
          </h3>
          <div className="space-y-2">
            {toolItems.map((item) => {
              const Icon = item.icon;
              return (
                <Button
                  key={item.label}
                  variant="ghost"
                  className="w-full justify-start gap-3 text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  onClick={item.onClick}
                  data-testid={`tool-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Campaign Info */}
      <div className="p-4 border-t border-border">
        <div className="bg-muted rounded-lg p-3">
          <h4 className="font-medium text-sm" data-testid="campaign-name">
            {currentCampaign?.name || "No Campaign"}
          </h4>
          <p className="text-xs text-muted-foreground mt-1">
            Session {currentCampaign?.currentSession || "0"} • Level {currentCampaign?.partyLevel || "1"} Party
          </p>
          <p className="text-xs text-muted-foreground" data-testid="last-played">
            Last played: {currentCampaign?.lastPlayed 
              ? new Date(currentCampaign.lastPlayed).toLocaleDateString() 
              : "Never"}
          </p>
        </div>
      </div>
    </aside>
  );
}
