import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Filter, Users, UserCheck, UserX } from "lucide-react";
import CharacterCard from "@/components/character/character-card";
import type { Character } from "@shared/schema";

export default function Characters() {
  const { data: characters, isLoading } = useQuery<Character[]>({
    queryKey: ["/api/campaigns/default-campaign/characters"],
  });

  const playerCharacters = characters?.filter(char => !char.isNPC) || [];
  const npcs = characters?.filter(char => char.isNPC) || [];

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-muted-foreground">Loading characters...</div>
      </div>
    );
  }

  return (
    <>
      {/* Top Bar */}
      <header className="bg-card border-b border-border px-6 py-4" data-testid="characters-header">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Characters & NPCs</h2>
            <p className="text-sm text-muted-foreground">Manage player characters and non-player characters</p>
          </div>
          <div className="flex items-center gap-3">
            <Button className="flex items-center gap-2" data-testid="add-character-button">
              <Plus className="h-4 w-4" />
              Add Character
            </Button>
            <Button variant="secondary" className="flex items-center gap-2" data-testid="filter-characters">
              <Filter className="h-4 w-4" />
              Filter
            </Button>
          </div>
        </div>
      </header>

      {/* Characters Content */}
      <div className="flex-1 overflow-auto">
        <div className="p-6">
          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card data-testid="stat-total-characters">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 text-primary rounded-lg flex items-center justify-center">
                    <Users className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{characters?.length || 0}</p>
                    <p className="text-sm text-muted-foreground">Total Characters</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card data-testid="stat-player-characters">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-accent/10 text-accent rounded-lg flex items-center justify-center">
                    <UserCheck className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{playerCharacters.length}</p>
                    <p className="text-sm text-muted-foreground">Player Characters</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card data-testid="stat-npcs">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-secondary/10 text-secondary-foreground rounded-lg flex items-center justify-center">
                    <UserX className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{npcs.length}</p>
                    <p className="text-sm text-muted-foreground">NPCs</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Player Characters Section */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold text-foreground mb-4">Player Characters</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {playerCharacters.length > 0 ? (
                playerCharacters.map((character) => (
                  <CharacterCard key={character.id} character={character} />
                ))
              ) : (
                <Card className="col-span-full">
                  <CardContent className="p-6 text-center">
                    <UserCheck className="h-12 w-12 mx-auto mb-4 opacity-50 text-muted-foreground" />
                    <p className="text-lg font-medium mb-2 text-muted-foreground">No player characters yet</p>
                    <p className="text-sm text-muted-foreground">Add player characters to track their progress and details.</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          {/* NPCs Section */}
          <div>
            <h3 className="text-xl font-semibold text-foreground mb-4">Non-Player Characters</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {npcs.length > 0 ? (
                npcs.map((character) => (
                  <CharacterCard key={character.id} character={character} />
                ))
              ) : (
                <Card className="col-span-full">
                  <CardContent className="p-6 text-center">
                    <UserX className="h-12 w-12 mx-auto mb-4 opacity-50 text-muted-foreground" />
                    <p className="text-lg font-medium mb-2 text-muted-foreground">No NPCs yet</p>
                    <p className="text-sm text-muted-foreground">Add NPCs to track important characters in your campaign.</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
