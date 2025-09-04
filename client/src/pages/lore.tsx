import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Filter, Globe, MapPin, Book, Users, Crown } from "lucide-react";
import LoreSection from "@/components/lore/lore-section";
import type { LoreEntry } from "@shared/schema";

export default function Lore() {
  const { data: loreEntries, isLoading } = useQuery<LoreEntry[]>({
    queryKey: ["/api/campaigns/default-campaign/lore"],
  });

  const categorizedLore = loreEntries?.reduce((acc, entry) => {
    if (!acc[entry.category]) {
      acc[entry.category] = [];
    }
    acc[entry.category].push(entry);
    return acc;
  }, {} as Record<string, LoreEntry[]>) || {};

  const categories = [
    { key: 'location', label: 'Locations', icon: MapPin },
    { key: 'history', label: 'History', icon: Book },
    { key: 'religion', label: 'Religions', icon: Crown },
    { key: 'culture', label: 'Cultures', icon: Users },
    { key: 'organization', label: 'Organizations', icon: Users },
    { key: 'artifact', label: 'Artifacts', icon: Crown },
    { key: 'other', label: 'Other', icon: Globe },
  ];

  const publicLore = loreEntries?.filter(entry => !entry.isSecret) || [];
  const secretLore = loreEntries?.filter(entry => entry.isSecret) || [];

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-muted-foreground">Loading world lore...</div>
      </div>
    );
  }

  return (
    <>
      {/* Top Bar */}
      <header className="bg-card border-b border-border px-6 py-4" data-testid="lore-header">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground">World Lore</h2>
            <p className="text-sm text-muted-foreground">Campaign world-building and reference material</p>
          </div>
          <div className="flex items-center gap-3">
            <Button className="flex items-center gap-2" data-testid="add-lore-button">
              <Plus className="h-4 w-4" />
              Add Lore Entry
            </Button>
            <Button variant="secondary" className="flex items-center gap-2" data-testid="filter-lore">
              <Filter className="h-4 w-4" />
              Filter
            </Button>
          </div>
        </div>
      </header>

      {/* Lore Content */}
      <div className="flex-1 overflow-auto">
        <div className="p-6">
          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card data-testid="stat-total-lore">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 text-primary rounded-lg flex items-center justify-center">
                    <Globe className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{loreEntries?.length || 0}</p>
                    <p className="text-sm text-muted-foreground">Total Entries</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card data-testid="stat-public-lore">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-accent/10 text-accent rounded-lg flex items-center justify-center">
                    <Book className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{publicLore.length}</p>
                    <p className="text-sm text-muted-foreground">Public Lore</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card data-testid="stat-secret-lore">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-secondary/10 text-secondary-foreground rounded-lg flex items-center justify-center">
                    <Crown className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{secretLore.length}</p>
                    <p className="text-sm text-muted-foreground">DM Secrets</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card data-testid="stat-categories">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-muted/10 text-muted-foreground rounded-lg flex items-center justify-center">
                    <MapPin className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{Object.keys(categorizedLore).length}</p>
                    <p className="text-sm text-muted-foreground">Categories</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Lore Categories */}
          {categories.map((category) => {
            const entries = categorizedLore[category.key] || [];
            if (entries.length === 0) return null;

            return (
              <LoreSection
                key={category.key}
                title={category.label}
                icon={category.icon}
                entries={entries}
              />
            );
          })}

          {/* Empty State */}
          {loreEntries?.length === 0 && (
            <Card>
              <CardContent className="p-6 text-center">
                <Globe className="h-12 w-12 mx-auto mb-4 opacity-50 text-muted-foreground" />
                <p className="text-lg font-medium mb-2 text-muted-foreground">No world lore yet</p>
                <p className="text-sm text-muted-foreground">
                  Start building your campaign world by adding locations, history, and cultural details.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </>
  );
}
