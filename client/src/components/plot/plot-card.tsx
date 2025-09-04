import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MoreVertical, Edit, Trash2, CheckCircle, Clock, Pause } from "lucide-react";
import type { Plot } from "@shared/schema";

interface PlotCardProps {
  plot: Plot;
}

export default function PlotCard({ plot }: PlotCardProps) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <Clock className="h-4 w-4" />;
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      case 'on-hold': return <Pause className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'default';
      case 'completed': return 'secondary';
      case 'on-hold': return 'outline';
      default: return 'outline';
    }
  };

  const getPlotTypeColor = (plotType: string) => {
    switch (plotType) {
      case 'main': return 'destructive';
      case 'subplot': return 'default';
      case 'side-quest': return 'secondary';
      default: return 'outline';
    }
  };

  return (
    <Card className="hover:shadow-md transition-shadow" data-testid={`plot-card-${plot.id}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h4 className="font-semibold text-foreground" data-testid="plot-title">
                {plot.title}
              </h4>
              <Badge 
                variant={getPlotTypeColor(plot.plotType) as any}
                className="text-xs"
                data-testid="plot-type"
              >
                {plot.plotType}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <Badge 
                variant={getStatusColor(plot.status) as any}
                className="text-xs flex items-center gap-1"
                data-testid="plot-status"
              >
                {getStatusIcon(plot.status)}
                {plot.status}
              </Badge>
            </div>
          </div>
          <Button variant="ghost" size="sm" data-testid="plot-menu">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        {plot.description && (
          <p className="text-sm text-muted-foreground mb-4" data-testid="plot-description">
            {plot.description}
          </p>
        )}

        {/* Linked Characters */}
        {plot.linkedCharacters && plot.linkedCharacters.length > 0 && (
          <div className="mb-4">
            <p className="text-xs font-medium text-foreground mb-2">Linked Characters:</p>
            <div className="flex flex-wrap gap-1">
              {plot.linkedCharacters.map((charId, index) => (
                <Badge 
                  key={index} 
                  variant="outline" 
                  className="text-xs"
                  data-testid={`plot-character-${index}`}
                >
                  👤 {charId}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Linked Events */}
        {plot.linkedEvents && plot.linkedEvents.length > 0 && (
          <div className="mb-4">
            <p className="text-xs font-medium text-foreground mb-2">Related Events:</p>
            <div className="text-xs text-muted-foreground">
              {plot.linkedEvents.length} event(s) linked
            </div>
          </div>
        )}

        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-xs flex-1"
            data-testid="edit-plot"
          >
            <Edit className="h-3 w-3 mr-1" />
            Edit
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-xs text-destructive hover:text-destructive"
            data-testid="delete-plot"
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
