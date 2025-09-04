import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Filter, Scroll, CheckCircle, Clock, Pause } from "lucide-react";
import PlotCard from "@/components/plot/plot-card";
import type { Plot } from "@shared/schema";

export default function Plots() {
  const { data: plots, isLoading } = useQuery<Plot[]>({
    queryKey: ["/api/campaigns/default-campaign/plots"],
  });

  const activePlots = plots?.filter(plot => plot.status === "active") || [];
  const completedPlots = plots?.filter(plot => plot.status === "completed") || [];
  const onHoldPlots = plots?.filter(plot => plot.status === "on-hold") || [];

  const mainPlots = plots?.filter(plot => plot.plotType === "main") || [];
  const subplots = plots?.filter(plot => plot.plotType === "subplot") || [];
  const sideQuests = plots?.filter(plot => plot.plotType === "side-quest") || [];

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-muted-foreground">Loading plots...</div>
      </div>
    );
  }

  return (
    <>
      {/* Top Bar */}
      <header className="bg-card border-b border-border px-6 py-4" data-testid="plots-header">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Plot Summary</h2>
            <p className="text-sm text-muted-foreground">Manage storylines, quests, and narrative threads</p>
          </div>
          <div className="flex items-center gap-3">
            <Button className="flex items-center gap-2" data-testid="add-plot-button">
              <Plus className="h-4 w-4" />
              Add Plot
            </Button>
            <Button variant="secondary" className="flex items-center gap-2" data-testid="filter-plots">
              <Filter className="h-4 w-4" />
              Filter
            </Button>
          </div>
        </div>
      </header>

      {/* Plots Content */}
      <div className="flex-1 overflow-auto">
        <div className="p-6">
          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card data-testid="stat-total-plots">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 text-primary rounded-lg flex items-center justify-center">
                    <Scroll className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{plots?.length || 0}</p>
                    <p className="text-sm text-muted-foreground">Total Plots</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card data-testid="stat-active-plots">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-accent/10 text-accent rounded-lg flex items-center justify-center">
                    <Clock className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{activePlots.length}</p>
                    <p className="text-sm text-muted-foreground">Active</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card data-testid="stat-completed-plots">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-secondary/10 text-secondary-foreground rounded-lg flex items-center justify-center">
                    <CheckCircle className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{completedPlots.length}</p>
                    <p className="text-sm text-muted-foreground">Completed</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card data-testid="stat-main-plots">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-muted/10 text-muted-foreground rounded-lg flex items-center justify-center">
                    <Pause className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{mainPlots.length}</p>
                    <p className="text-sm text-muted-foreground">Main Plots</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Active Plots Section */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold text-foreground mb-4">Active Plots</h3>
            <div className="space-y-4">
              {activePlots.length > 0 ? (
                activePlots.map((plot) => (
                  <PlotCard key={plot.id} plot={plot} />
                ))
              ) : (
                <Card>
                  <CardContent className="p-6 text-center">
                    <Clock className="h-12 w-12 mx-auto mb-4 opacity-50 text-muted-foreground" />
                    <p className="text-lg font-medium mb-2 text-muted-foreground">No active plots</p>
                    <p className="text-sm text-muted-foreground">Create plot threads to track your campaign's storylines.</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          {/* Completed Plots Section */}
          {completedPlots.length > 0 && (
            <div className="mb-8">
              <h3 className="text-xl font-semibold text-foreground mb-4">Completed Plots</h3>
              <div className="space-y-4">
                {completedPlots.map((plot) => (
                  <PlotCard key={plot.id} plot={plot} />
                ))}
              </div>
            </div>
          )}

          {/* On Hold Plots Section */}
          {onHoldPlots.length > 0 && (
            <div>
              <h3 className="text-xl font-semibold text-foreground mb-4">On Hold</h3>
              <div className="space-y-4">
                {onHoldPlots.map((plot) => (
                  <PlotCard key={plot.id} plot={plot} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
