import {
  insertTimelineEventSchema,
  timelineEventSchema,
} from "../../../shared/schema";
import { z } from "zod";

export const getTimelineEvents = async (campaignId: string) => {
  const response = await fetch(`/api/timeline/${campaignId}`);
  if (!response.ok) {
    throw new Error("Failed to fetch timeline events");
  }
  const data = await response.json();
  return z.array(timelineEventSchema).parse(data);
};

export const createTimelineEvent = async (
  event: z.infer<typeof insertTimelineEventSchema>
) => {
  const response = await fetch("/api/timeline", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(event),
  });
  if (!response.ok) {
    throw new Error("Failed to create timeline event");
  }
  const data = await response.json();
  return timelineEventSchema.parse(data);
};