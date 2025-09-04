import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MoreVertical, Edit, Trash2 } from "lucide-react";
import type { Character } from "@shared/schema";

interface CharacterCardProps {
  character: Character;
}

export default function CharacterCard({ character }: CharacterCardProps) {
  const getAlignmentColor = (alignment?: string) => {
    if (!alignment) return "outline";
    
    const lower = alignment.toLowerCase();
    if (lower.includes("good")) return "default";
    if (lower.includes("evil")) return "destructive";
    if (lower.includes("neutral")) return "secondary";
    return "outline";
  };

  return (
    <Card className="hover:shadow-md transition-shadow" data-testid={`character-card-${character.id}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h4 className="font-semibold text-foreground" data-testid="character-name">
              {character.name}
            </h4>
            <div className="flex items-center gap-2 mt-1">
              {character.race && (
                <Badge variant="outline" className="text-xs" data-testid="character-race">
                  {character.race}
                </Badge>
              )}
              {character.characterClass && (
                <Badge variant="outline" className="text-xs" data-testid="character-class">
                  {character.characterClass}
                </Badge>
              )}
              <Badge 
                variant={character.isNPC ? "secondary" : "default"} 
                className="text-xs"
                data-testid="character-type"
              >
                {character.isNPC ? "NPC" : "PC"}
              </Badge>
            </div>
          </div>
          <Button variant="ghost" size="sm" data-testid="character-menu">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        {character.alignment && (
          <div className="mb-3">
            <Badge 
              variant={getAlignmentColor(character.alignment) as any}
              className="text-xs"
              data-testid="character-alignment"
            >
              {character.alignment}
            </Badge>
          </div>
        )}

        {character.biography && (
          <p className="text-sm text-muted-foreground mb-3 line-clamp-3" data-testid="character-biography">
            {character.biography}
          </p>
        )}

        {character.notes && (
          <div className="mb-3">
            <p className="text-xs font-medium text-foreground mb-1">Notes:</p>
            <p className="text-xs text-muted-foreground line-clamp-2" data-testid="character-notes">
              {character.notes}
            </p>
          </div>
        )}

        <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
          <span data-testid="appearance-count">
            Appearances: {character.appearanceCount || 0}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-xs flex-1"
            data-testid="edit-character"
          >
            <Edit className="h-3 w-3 mr-1" />
            Edit
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-xs text-destructive hover:text-destructive"
            data-testid="delete-character"
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
