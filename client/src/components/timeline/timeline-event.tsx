import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MoreVertical, Edit, Link, StickyNote, Sword, MessageCircle, Search, MapPin } from "lucide-react";
import type { TimelineEvent, Character, Plot } from "@shared/schema";

interface TimelineEventProps {
  event: TimelineEvent;
  characters: Character[];
  plots: Plot[];
}

export default function TimelineEvent({ event, characters, plots }: TimelineEventProps) {
  const getEventIcon = (eventType: string) => {
    switch (eventType) {
      case 'combat': return <Sword className="h-5 w-5" />;
      case 'roleplay': return <MessageCircle className="h-5 w-5" />;
      case 'discovery': return <Search className="h-5 w-5" />;
      case 'travel': return <MapPin className="h-5 w-5" />;
      default: return <MessageCircle className="h-5 w-5" />;
    }
  };

  const getEventTypeColor = (eventType: string) => {
    switch (eventType) {
      case 'combat': return 'destructive';
      case 'roleplay': return 'default';
      case 'discovery': return 'secondary';
      case 'travel': return 'outline';
      default: return 'outline';
    }
  };

  const getLinkedCharacters = () => {
    return characters.filter(char => 
      event.linkedCharacters?.includes(char.id) || 
      event.linkedCharacters?.includes(char.name)
    );
  };

  const getLinkedPlots = () => {
    return plots.filter(plot => 
      event.linkedPlots?.includes(plot.id) || 
      event.linkedPlots?.includes(plot.title)
    );
  };

  const linkedCharacters = getLinkedCharacters();
  const linkedPlots = getLinkedPlots();

  return (
    <Card className="hover:shadow-md transition-shadow" data-testid={`timeline-event-${event.id}`}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-primary/10 text-primary rounded-full flex items-center justify-center flex-shrink-0">
              {getEventIcon(event.eventType)}
            </div>
            <div>
              <h3 className="font-semibold text-foreground" data-testid="event-title">
                {event.title}
              </h3>
              <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                {event.gameDate && (
                  <span data-testid="event-game-date">{event.gameDate}</span>
                )}
                <span>•</span>
                <span data-testid="event-real-date">
                  {new Date(event.realDate).toLocaleDateString()}
                </span>
                <span>•</span>
                <Badge 
                  variant={getEventTypeColor(event.eventType) as any}
                  className="text-xs"
                  data-testid="event-type"
                >
                  {event.eventType}
                </Badge>
              </div>
            </div>
          </div>
          <Button variant="ghost" size="sm" data-testid="event-menu">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </div>

        {event.description && (
          <p className="text-muted-foreground mb-4" data-testid="event-description">
            {event.description}
          </p>
        )}
        
        {/* Linked Content */}
        {(linkedCharacters.length > 0 || linkedPlots.length > 0) && (
          <div className="flex flex-wrap gap-2 mb-4">
            {linkedCharacters.map((character) => (
              <Badge 
                key={character.id} 
                variant="outline" 
                className="text-xs bg-accent/10 text-accent-foreground"
                data-testid={`linked-character-${character.id}`}
              >
                👤 {character.name}
              </Badge>
            ))}
            {linkedPlots.map((plot) => (
              <Badge 
                key={plot.id} 
                variant="outline" 
                className="text-xs bg-secondary/10 text-secondary-foreground"
                data-testid={`linked-plot-${plot.id}`}
              >
                📜 {plot.title}
              </Badge>
            ))}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-xs bg-muted hover:bg-muted/80 text-muted-foreground"
            data-testid="edit-event"
          >
            <Edit className="h-3 w-3 mr-1" />
            Edit
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-xs bg-muted hover:bg-muted/80 text-muted-foreground"
            data-testid="link-event"
          >
            <Link className="h-3 w-3 mr-1" />
            Add Links
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-xs bg-muted hover:bg-muted/80 text-muted-foreground"
            data-testid="add-note"
          >
            <StickyNote className="h-3 w-3 mr-1" />
            Add Note
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
