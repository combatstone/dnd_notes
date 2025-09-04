// client/src/api/timeline.ts
import { type TimelineEvent, type InsertTimelineEvent } from "@shared/schema";

export const getTimelineEvents = async (campaignId: string): Promise<TimelineEvent[]> => {
  const response = await fetch(`/api/timeline/${campaignId}`);
  if (!response.ok) throw new Error("Failed to fetch timeline events");
  return response.json();
};

export const createTimelineEvent = async (eventData: InsertTimelineEvent): Promise<TimelineEvent> => {
  const response = await fetch("/api/timeline", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(eventData),
  });
  if (!response.ok) throw new Error("Failed to create timeline event");
  return response.json();
};

export const updateTimelineEvent = async (
  eventId: string,
  eventData: Partial<InsertTimelineEvent>
): Promise<TimelineEvent> => {
  const response = await fetch(`/api/timeline/${eventId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(eventData),
  });
  if (!response.ok) throw new Error("Failed to update timeline event");
  return response.json();
};

export const deleteTimelineEvent = async (eventId: string): Promise<void> => {
  const response = await fetch(`/api/timeline/${eventId}`, {
    method: "DELETE",
  });
  if (!response.ok) throw new Error("Failed to delete timeline event");
};