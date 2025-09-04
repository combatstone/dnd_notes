import { Button } from "@/components/ui/button";
import { Plus, UserPlus, MapPin, Sparkles } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

interface AISuggestion {
  type: string;
  title: string;
  description: string;
  priority: string;
}

export default function RightSidebar() {
  const { data: suggestions } = useQuery<AISuggestion[]>({
    queryKey: ["/api/campaigns/default-campaign/ai-suggestions"],
  });

  const quickActions = [
    { label: "Add Character", icon: UserPlus },
    { label: "Add Plot Thread", icon: Plus },
    { label: "Add Location", icon: MapPin },
  ];

  const recentItems = [
    { type: "character", name: "Kael Ironforge", details: "Dwarf Fighter • Referenced 3 times today" },
    { type: "plot", name: "The Crystal Corruption", details: "Active subplot • 2 events linked" },
    { type: "location", name: "Thornwick Pass", details: "Mountain location • Combat site" },
  ];

  return (
    <aside className="w-80 bg-card border-l border-border flex flex-col" data-testid="right-sidebar">
      {/* Quick Actions */}
      <div className="p-4 border-b border-border">
        <h3 className="font-semibold text-sm text-foreground mb-3">Quick Actions</h3>
        <div className="space-y-2">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <Button
                key={action.label}
                variant="ghost"
                className="w-full justify-start gap-2 text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                data-testid={`quick-action-${action.label.toLowerCase().replace(/\s+/g, '-')}`}
              >
                <Icon className="h-4 w-4" />
                {action.label}
              </Button>
            );
          })}
        </div>
      </div>

      {/* AI Suggestions */}
      <div className="p-4 border-b border-border">
        <h3 className="font-semibold text-sm text-foreground mb-3 flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          AI Suggestions
        </h3>
        <div className="space-y-3">
          {suggestions?.slice(0, 2).map((suggestion, index) => (
            <div 
              key={index}
              className={`border rounded-lg p-3 ${
                suggestion.priority === 'high' 
                  ? 'bg-primary/5 border-primary/20' 
                  : 'bg-accent/5 border-accent/20'
              }`}
              data-testid={`ai-suggestion-${index}`}
            >
              <p className="text-sm font-medium text-foreground">{suggestion.title}</p>
              <p className="text-xs text-muted-foreground mt-1">{suggestion.description}</p>
              <div className="flex gap-2 mt-2">
                <Button 
                  size="sm" 
                  className={`text-xs px-2 py-1 h-auto ${
                    suggestion.priority === 'high' 
                      ? 'bg-primary text-primary-foreground' 
                      : 'bg-accent text-accent-foreground'
                  }`}
                  data-testid={`accept-suggestion-${index}`}
                >
                  Accept
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-xs text-muted-foreground hover:text-foreground h-auto p-1"
                  data-testid={`dismiss-suggestion-${index}`}
                >
                  Dismiss
                </Button>
              </div>
            </div>
          )) || (
            <div className="text-sm text-muted-foreground">
              No AI suggestions available
            </div>
          )}
        </div>
      </div>

      {/* Recent Links */}
      <div className="p-4 flex-1">
        <h3 className="font-semibold text-sm text-foreground mb-3">Recently Referenced</h3>
        <div className="space-y-2">
          {recentItems.map((item, index) => (
            <Button
              key={index}
              variant="ghost"
              className="w-full justify-start p-2 h-auto text-left hover:bg-accent hover:text-accent-foreground"
              data-testid={`recent-item-${index}`}
            >
              <div className="flex items-start gap-2 w-full">
                <div className="flex items-center gap-2 flex-1">
                  <span className="text-sm">{getTypeIcon(item.type)}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{item.name}</div>
                    <div className="text-xs text-muted-foreground">{item.details}</div>
                  </div>
                </div>
              </div>
            </Button>
          ))}
        </div>
      </div>
    </aside>
  );
}

function getTypeIcon(type: string) {
  switch (type) {
    case 'character': return '👤';
    case 'plot': return '📜';
    case 'location': return '📍';
    default: return '📄';
  }
}
