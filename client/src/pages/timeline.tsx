import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { getTimelineEvents } from "@/api/timeline";
import TimelineEventComponent from "@/components/timeline/timeline-event";
import { AddTimelineEventForm } from "@/components/timeline/add-timeline-event-form";
import { z } from "zod";
import {
  characterSchema,
  plotSchema,
  timelineEventSchema,
} from "../../../shared/schema";
import { getCharacters } from "@/api/characters";
import { getPlots } from "@/api/plots";

// Define the types based on our shared Zod schemas
type TimelineEvent = z.infer<typeof timelineEventSchema>;
type Character = z.infer<typeof characterSchema>;
type Plot = z.infer<typeof plotSchema>;

export function Timeline() {
  const campaignId = "1"; // TODO: Replace with dynamic campaign ID

  // Fetch timeline events
  const {
    data: timeline,
    isLoading: isTimelineLoading,
    isError: isTimelineError,
  } = useQuery({
    queryKey: ["timeline", campaignId],
    queryFn: () => getTimelineEvents(campaignId),
  });

  // Fetch all characters for the campaign
  const { data: characters } = useQuery({
    queryKey: ["characters", campaignId],
    queryFn: () => getCharacters(campaignId),
  });

  // Fetch all plots for the campaign
  const { data: plots } = useQuery({
    queryKey: ["plots", campaignId],
    queryFn: () => getPlots(campaignId),
  });

  if (isTimelineLoading) {
    return <div>Loading...</div>;
  }

  if (isTimelineError) {
    return <div>Error loading timeline</div>;
  }

  // Helper function to find linked items
  const findLinkedItems = <T extends { id: string }>(
    allItems: T[] | undefined,
    linkedIds: string[] | null | undefined
  ): T[] => {
    if (!allItems || !linkedIds) return [];
    return allItems.filter((item) => linkedIds.includes(item.id));
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>Timeline</CardTitle>
            <CardDescription>
              A chronological history of events in your campaign.
            </CardDescription>
          </div>
          <AddTimelineEventForm />
        </div>
      </CardHeader>
      <CardContent>
        {timeline && timeline.length > 0 ? (
          <ol className="relative border-s border-gray-200 dark:border-gray-700">
            {timeline.map((event: TimelineEvent) => {
              const linkedCharacters = findLinkedItems(
                characters,
                event.linkedCharacters
              );
              const linkedPlots = findLinkedItems(plots, event.linkedPlots);

              return (
                <TimelineEventComponent
                  key={event.id}
                  event={event}
                  characters={linkedCharacters}
                  plots={linkedPlots}
                />
              );
            })}
          </ol>
        ) : (
          <p>No timeline events yet.</p>
        )}
      </CardContent>
    </Card>
  );
}