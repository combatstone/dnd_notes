// client/src/pages/plots.tsx
import { useState } from "react";
import PlotCard from "@/components/plot/plot-card";
// NOTE: You will need to create AddPlotForm and EditPlotForm similar to the character forms
import AddPlotForm from "@/components/plot/add-plot-form";
import EditPlotForm from "@/components/plot/edit-plot-form";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getPlots, createPlot, updatePlot, deletePlot } from "@/api/plots";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { type Plot, type InsertPlot } from "@shared/schema";

export default function Plots() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedPlot, setSelectedPlot] = useState<Plot | null>(null);

  const campaignId = "campaign-1";

  const { data: plots, isLoading, isError } = useQuery({
    queryKey: ["plots", campaignId],
    queryFn: () => getPlots(campaignId),
  });

  const createMutation = useMutation({
    mutationFn: createPlot,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["plots", campaignId] });
      toast({ title: "Success", description: "Plot added." });
      setIsAddModalOpen(false);
    },
    onError: () => toast({ title: "Error", description: "Failed to add plot.", variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: deletePlot,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["plots", campaignId] });
      toast({ title: "Success", description: "Plot deleted." });
    },
    onError: () => toast({ title: "Error", description: "Failed to delete plot.", variant: "destructive" }),
  });
  
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string, data: Partial<InsertPlot> }) => updatePlot(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["plots", campaignId] });
      toast({ title: "Success", description: "Plot updated." });
      setIsEditModalOpen(false);
    },
    onError: () => toast({ title: "Error", description: "Failed to update plot.", variant: "destructive" }),
  });

  const handleAddSubmit = (data: Omit<InsertPlot, 'campaignId'>) => {
    createMutation.mutate({ ...data, campaignId });
  };
  
  const handleDelete = (id: string) => {
    deleteMutation.mutate(id);
  };
  
  const handleEdit = (plot: Plot) => {
    setSelectedPlot(plot);
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = (data: Partial<InsertPlot>) => {
    if (selectedPlot) {
      updateMutation.mutate({ id: selectedPlot.id, data });
    }
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-48 w-full" />)}
        </div>
      );
    }
    if (isError) return <div className="p-4 text-red-500">Error fetching plots.</div>;
    if (!plots || plots.length === 0) return <div className="p-4 text-center text-gray-500">No plots found.</div>;
    return (
      <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {plots.map((plot) => (
          <PlotCard key={plot.id} plot={plot} onDelete={handleDelete} onEdit={handleEdit} />
        ))}
      </div>
    );
  };

  return (
    <div>
      <div className="flex justify-between items-center p-4 border-b">
        <h1 className="text-2xl font-bold">Plots</h1>
        <Button onClick={() => setIsAddModalOpen(true)}>Add Plot</Button>
      </div>
      {renderContent()}
      
      {/* FIX: Uncomment these components */}
      <AddPlotForm 
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleAddSubmit}
        isSubmitting={createMutation.isPending}
      />
      <EditPlotForm
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSubmit={handleEditSubmit}
        isSubmitting={updateMutation.isPending}
        plot={selectedPlot}
      />
      
    </div>
  );
}