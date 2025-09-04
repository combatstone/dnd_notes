import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MoreVertical, Edit, Trash2, Eye, EyeOff, LucideIcon } from "lucide-react";
import type { LoreEntry } from "@shared/schema";

interface LoreSectionProps {
  title: string;
  icon: LucideIcon;
  entries: LoreEntry[];
}

export default function LoreSection({ title, icon: Icon, entries }: LoreSectionProps) {
  return (
    <div className="mb-8">
      <div className="flex items-center gap-2 mb-4">
        <Icon className="h-5 w-5 text-primary" />
        <h3 className="text-xl font-semibold text-foreground">{title}</h3>
        <Badge variant="outline" className="text-xs">
          {entries.length}
        </Badge>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {entries.map((entry) => (
          <Card 
            key={entry.id} 
            className="hover:shadow-md transition-shadow"
            data-testid={`lore-entry-${entry.id}`}
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold text-foreground" data-testid="lore-title">
                      {entry.title}
                    </h4>
                    {entry.isSecret && (
                      <Badge 
                        variant="destructive" 
                        className="text-xs flex items-center gap-1"
                        data-testid="secret-badge"
                      >
                        <EyeOff className="h-3 w-3" />
                        DM Only
                      </Badge>
                    )}
                  </div>
                  <Badge variant="outline" className="text-xs" data-testid="lore-category">
                    {entry.category}
                  </Badge>
                </div>
                <Button variant="ghost" size="sm" data-testid="lore-menu">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            
            <CardContent className="pt-0">
              {entry.content && (
                <p className="text-sm text-muted-foreground mb-3 line-clamp-4" data-testid="lore-content">
                  {entry.content}
                </p>
              )}

              {/* Tags */}
              {entry.tags && entry.tags.length > 0 && (
                <div className="mb-3">
                  <div className="flex flex-wrap gap-1">
                    {entry.tags.map((tag, index) => (
                      <Badge 
                        key={index} 
                        variant="outline" 
                        className="text-xs"
                        data-testid={`lore-tag-${index}`}
                      >
                        #{tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-center gap-2">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-xs flex-1"
                  data-testid="edit-lore"
                >
                  <Edit className="h-3 w-3 mr-1" />
                  Edit
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-xs"
                  data-testid="toggle-visibility"
                >
                  {entry.isSecret ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-xs text-destructive hover:text-destructive"
                  data-testid="delete-lore"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
