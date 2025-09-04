// client/src/pages/timeline.tsx
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getTimelineEvents, createTimelineEvent, updateTimelineEvent, deleteTimelineEvent } from "@/api/timeline";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { type TimelineEvent, type InsertTimelineEvent } from "@shared/schema";
import AddTimelineEventForm from "@/components/timeline/add-timeline-event-form";
import EditTimelineEventForm from "@/components/timeline/edit-timeline-event-form";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

function TimelineEventCard({ event, onDelete, onEdit }: { event: TimelineEvent, onDelete: (id: string) => void, onEdit: (event: TimelineEvent) => void }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{event.title}</CardTitle>
        <p className="text-sm text-muted-foreground">{event.gameDate || 'No date set'}</p>
      </CardHeader>
      <CardContent>
        <p>{event.description}</p>
      </CardContent>
      <CardFooter className="flex justify-end gap-2">
        <Button variant="outline" size="sm" onClick={() => onEdit(event)}>Edit</Button>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" size="sm">Delete</Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>This will permanently delete the event "{event.title}".</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={() => onDelete(event.id)}>Continue</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardFooter>
    </Card>
  );
}

export default function Timeline() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<TimelineEvent | null>(null);

  const campaignId = "campaign-1";

  const { data: events, isLoading, isError } = useQuery({
    queryKey: ["timeline", campaignId],
    queryFn: () => getTimelineEvents(campaignId),
  });

  const createMutation = useMutation({
    mutationFn: createTimelineEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["timeline", campaignId] });
      toast({ title: "Success", description: "Event added." });
      setIsAddModalOpen(false);
    },
    onError: () => toast({ title: "Error", description: "Failed to add event.", variant: "destructive" }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string, data: Partial<InsertTimelineEvent> }) => updateTimelineEvent(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["timeline", campaignId] });
      toast({ title: "Success", description: "Event updated." });
      setIsEditModalOpen(false);
    },
    onError: () => toast({ title: "Error", description: "Failed to update event.", variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteTimelineEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["timeline", campaignId] });
      toast({ title: "Success", description: "Event deleted." });
    },
    onError: () => toast({ title: "Error", description: "Failed to delete event.", variant: "destructive" }),
  });

  const handleAddSubmit = (data: Omit<InsertTimelineEvent, 'campaignId' | 'realDate'>) => {
    createMutation.mutate({ ...data, campaignId });
  };
  
  const handleEditSubmit = (data: Partial<InsertTimelineEvent>) => {
    if (selectedEvent) {
      updateMutation.mutate({ id: selectedEvent.id, data });
    }
  };

  const handleEdit = (event: TimelineEvent) => {
    setSelectedEvent(event);
    setIsEditModalOpen(true);
  };
  
  const renderContent = () => {
    if (isLoading) return <div className="p-4 space-y-4">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-32 w-full" />)}</div>;
    if (isError) return <div className="p-4 text-red-500">Error fetching timeline.</div>;
    if (!events || events.length === 0) return <div className="p-4 text-center text-gray-500">No timeline events yet.</div>;
    return <div className="p-4 space-y-4">{events.map((event: TimelineEvent) => <TimelineEventCard key={event.id} event={event} onDelete={deleteMutation.mutate} onEdit={handleEdit} />)}</div>;
  };

  return (
    <div>
      <div className="flex justify-between items-center p-4 border-b">
        <h1 className="text-2xl font-bold">Timeline</h1>
        <Button onClick={() => setIsAddModalOpen(true)}>Add Event</Button>
      </div>
      {renderContent()}
      
      {/* FIX: Uncommented these components */}
      <AddTimelineEventForm 
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleAddSubmit}
        isSubmitting={createMutation.isPending}
      />
      <EditTimelineEventForm
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSubmit={handleEditSubmit}
        isSubmitting={updateMutation.isPending}
        event={selectedEvent}
      />
      
    </div>
  );
}