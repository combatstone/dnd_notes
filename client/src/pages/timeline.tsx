import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Filter, Calendar, Users, Scroll, Clock } from "lucide-react";
import TimelineEvent from "@/components/timeline/timeline-event";
import type { TimelineEvent as TimelineEventType, Character, Plot } from "@shared/schema";

export default function Timeline() {
  const { data: events, isLoading } = useQuery<TimelineEventType[]>({
    queryKey: ["/api/campaigns/default-campaign/timeline"],
  });

  const { data: characters } = useQuery<Character[]>({
    queryKey: ["/api/campaigns/default-campaign/characters"],
  });

  const { data: plots } = useQuery<Plot[]>({
    queryKey: ["/api/campaigns/default-campaign/plots"],
  });

  const stats = {
    totalEvents: events?.length || 0,
    totalCharacters: characters?.length || 0,
    activePlots: plots?.filter(p => p.status === "active").length || 0,
    sessionHours: 72, // This could be calculated from session data
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-muted-foreground">Loading timeline...</div>
      </div>
    );
  }

  return (
    <>
      {/* Top Bar */}
      <header className="bg-card border-b border-border px-6 py-4" data-testid="timeline-header">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Campaign Timeline</h2>
            <p className="text-sm text-muted-foreground">Chronological events and story progression</p>
          </div>
          <div className="flex items-center gap-3">
            <Button className="flex items-center gap-2" data-testid="add-event-button">
              <Plus className="h-4 w-4" />
              Add Event
            </Button>
            <Button variant="secondary" className="flex items-center gap-2" data-testid="filter-button">
              <Filter className="h-4 w-4" />
              Filter
            </Button>
          </div>
        </div>
      </header>

      {/* Timeline Content */}
      <div className="flex-1 overflow-auto">
        <div className="p-6">
          {/* Quick Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card data-testid="stat-total-events">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 text-primary rounded-lg flex items-center justify-center">
                    <Calendar className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stats.totalEvents}</p>
                    <p className="text-sm text-muted-foreground">Total Events</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card data-testid="stat-total-characters">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-accent/10 text-accent rounded-lg flex items-center justify-center">
                    <Users className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stats.totalCharacters}</p>
                    <p className="text-sm text-muted-foreground">Characters</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card data-testid="stat-active-plots">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-secondary/10 text-secondary-foreground rounded-lg flex items-center justify-center">
                    <Scroll className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stats.activePlots}</p>
                    <p className="text-sm text-muted-foreground">Active Plots</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card data-testid="stat-session-hours">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-muted/10 text-muted-foreground rounded-lg flex items-center justify-center">
                    <Clock className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stats.sessionHours}</p>
                    <p className="text-sm text-muted-foreground">Session Hours</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Timeline Events */}
          <div className="space-y-4">
            {events && events.length > 0 ? (
              events.map((event) => (
                <TimelineEvent 
                  key={event.id} 
                  event={event} 
                  characters={characters || []}
                  plots={plots || []}
                />
              ))
            ) : (
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="text-muted-foreground">
                    <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p className="text-lg font-medium mb-2">No timeline events yet</p>
                    <p className="text-sm">Start by adding your first campaign event or importing your notes.</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {events && events.length > 0 && (
              <div className="text-center py-6">
                <Button variant="secondary" className="px-6 py-3" data-testid="load-more-events">
                  Load Earlier Events
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
