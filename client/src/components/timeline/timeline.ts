import { z } from "zod";
import { timelineEventSchema } from "../../../../shared/schema";

export type TimelineEvent = z.infer<typeof timelineEventSchema>;

export type TimelineEventProps = {
  event: TimelineEvent;
};