import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { History, RotateCcw, FileText, Users, Scroll, Globe, Calendar, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { AuditLog } from "@shared/schema";

interface ImportResult {
  filename: string;
  documentId: string;
  importBatchId: string;
  extracted: {
    characters: any[];
    events: any[];
    plots: any[];
    lore: any[];
  };
}

export default function AuditLogPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: auditLog, isLoading } = useQuery<AuditLog[]>({
    queryKey: ["/api/campaigns/default-campaign/audit-log"],
  });

  const rollbackImportMutation = useMutation({
    mutationFn: async (importBatchId: string) => {
      const response = await fetch(`/api/rollback/import/${importBatchId}`, {
        method: "POST",
      });
      if (!response.ok) {
        throw new Error("Rollback failed");
      }
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Rollback Successful",
        description: `Reverted ${data.deletedCount} created items and restored ${data.restoredCount} modified items`,
      });
      
      // Refresh all campaign data
      queryClient.invalidateQueries({ queryKey: ["/api/campaigns/default-campaign/timeline"] });
      queryClient.invalidateQueries({ queryKey: ["/api/campaigns/default-campaign/characters"] });
      queryClient.invalidateQueries({ queryKey: ["/api/campaigns/default-campaign/plots"] });
      queryClient.invalidateQueries({ queryKey: ["/api/campaigns/default-campaign/lore"] });
      queryClient.invalidateQueries({ queryKey: ["/api/campaigns/default-campaign/audit-log"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Rollback Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const rollbackTimestampMutation = useMutation({
    mutationFn: async (timestamp: Date) => {
      const response = await fetch(`/api/rollback/timestamp/default-campaign`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ timestamp: timestamp.toISOString() }),
      });
      if (!response.ok) {
        throw new Error("Rollback failed");
      }
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Rollback Successful",
        description: `Reverted ${data.changesReverted} changes`,
      });
      
      // Refresh all campaign data
      queryClient.invalidateQueries({ queryKey: ["/api/campaigns/default-campaign/timeline"] });
      queryClient.invalidateQueries({ queryKey: ["/api/campaigns/default-campaign/characters"] });
      queryClient.invalidateQueries({ queryKey: ["/api/campaigns/default-campaign/plots"] });
      queryClient.invalidateQueries({ queryKey: ["/api/campaigns/default-campaign/lore"] });
      queryClient.invalidateQueries({ queryKey: ["/api/campaigns/default-campaign/audit-log"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Rollback Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'create': return '➕';
      case 'update': return '✏️';
      case 'delete': return '🗑️';
      default: return '📝';
    }
  };

  const getEntityIcon = (entityType: string) => {
    switch (entityType) {
      case 'character': return <Users className="h-4 w-4" />;
      case 'event': return <Calendar className="h-4 w-4" />;
      case 'plot': return <Scroll className="h-4 w-4" />;
      case 'lore': return <Globe className="h-4 w-4" />;
      case 'document': return <FileText className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const getSourceColor = (source: string) => {
    switch (source) {
      case 'import': return 'default';
      case 'ai-processing': return 'secondary';
      case 'manual': return 'outline';
      default: return 'outline';
    }
  };

  // Group audit entries by import batch
  const importBatches = auditLog ? auditLog
    .filter(entry => entry.importBatchId)
    .reduce((acc, entry) => {
      if (!acc[entry.importBatchId!]) {
        acc[entry.importBatchId!] = [];
      }
      acc[entry.importBatchId!].push(entry);
      return acc;
    }, {} as Record<string, AuditLog[]>) : {};

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-muted-foreground">Loading audit log...</div>
      </div>
    );
  }

  return (
    <>
      {/* Top Bar */}
      <header className="bg-card border-b border-border px-6 py-4" data-testid="audit-log-header">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <History className="h-6 w-6" />
              Audit Trail & Changelog
            </h2>
            <p className="text-sm text-muted-foreground">Track changes and rollback imports when needed</p>
          </div>
        </div>
      </header>

      {/* Audit Log Content */}
      <div className="flex-1 overflow-auto">
        <div className="p-6">
          {/* Import Batches Section */}
          {Object.keys(importBatches).length > 0 && (
            <div className="mb-8">
              <h3 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Recent Import Batches
              </h3>
              <div className="space-y-4">
                {Object.entries(importBatches).map(([batchId, entries]) => {
                  const firstEntry = entries[0];
                  const importCounts = entries.reduce((acc, entry) => {
                    acc[entry.entityType] = (acc[entry.entityType] || 0) + 1;
                    return acc;
                  }, {} as Record<string, number>);

                  return (
                    <Card key={batchId} className="border-l-4 border-l-primary">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-semibold text-foreground">
                              Import Batch
                            </h4>
                            <p className="text-sm text-muted-foreground mt-1">
                              {new Date(firstEntry.timestamp).toLocaleString()} • {firstEntry.metadata}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                              {entries.length} changes
                            </Badge>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button 
                                  variant="destructive" 
                                  size="sm"
                                  disabled={rollbackImportMutation.isPending}
                                  data-testid={`rollback-import-${batchId}`}
                                >
                                  <RotateCcw className="h-4 w-4 mr-1" />
                                  Rollback Import
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle className="flex items-center gap-2">
                                    <AlertTriangle className="h-5 w-5 text-destructive" />
                                    Rollback Import
                                  </AlertDialogTitle>
                                  <AlertDialogDescription>
                                    This will permanently remove all data imported in this batch:
                                    <ul className="mt-2 ml-4 list-disc">
                                      {Object.entries(importCounts).map(([type, count]) => (
                                        <li key={type}>{count} {type}(s)</li>
                                      ))}
                                    </ul>
                                    This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => rollbackImportMutation.mutate(batchId)}
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  >
                                    Rollback Import
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="flex flex-wrap gap-2">
                          {Object.entries(importCounts).map(([type, count]) => (
                            <Badge key={type} variant="secondary" className="text-xs">
                              {getEntityIcon(type)} {count} {type}(s)
                            </Badge>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}

          {/* Full Audit Log */}
          <div>
            <h3 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
              <History className="h-5 w-5" />
              Complete Change History
            </h3>
            
            {auditLog && auditLog.length > 0 ? (
              <div className="space-y-3">
                {auditLog.map((entry, index) => (
                  <Card key={entry.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3 flex-1">
                          <div className="flex items-center gap-2">
                            {getEntityIcon(entry.entityType)}
                            <span className="text-lg">{getActionIcon(entry.action)}</span>
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium capitalize">
                                {entry.action}
                              </span>
                              <span className="text-muted-foreground">
                                {entry.entityType}
                              </span>
                              <Badge 
                                variant={getSourceColor(entry.source) as any}
                                className="text-xs"
                              >
                                {entry.source}
                              </Badge>
                              {entry.importBatchId && (
                                <Badge variant="outline" className="text-xs">
                                  batch: {entry.importBatchId.split('-')[1]}
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {new Date(entry.timestamp).toLocaleString()}
                              {entry.metadata && ` • ${entry.metadata}`}
                            </p>
                          </div>
                        </div>
                        {index === 0 && !entry.importBatchId && (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button 
                                variant="outline" 
                                size="sm"
                                disabled={rollbackTimestampMutation.isPending}
                                data-testid="rollback-to-timestamp"
                              >
                                <RotateCcw className="h-4 w-4 mr-1" />
                                Rollback to Here
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle className="flex items-center gap-2">
                                  <AlertTriangle className="h-5 w-5 text-destructive" />
                                  Rollback to Timestamp
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  This will revert all changes made after {new Date(entry.timestamp).toLocaleString()}. 
                                  This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => rollbackTimestampMutation.mutate(new Date(entry.timestamp))}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Rollback to This Point
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-6 text-center">
                  <History className="h-12 w-12 mx-auto mb-4 opacity-50 text-muted-foreground" />
                  <p className="text-lg font-medium mb-2 text-muted-foreground">No audit history</p>
                  <p className="text-sm text-muted-foreground">
                    Changes to your campaign data will appear here for tracking and rollback purposes.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </>
  );
}