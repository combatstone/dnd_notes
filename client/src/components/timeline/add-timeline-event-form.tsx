// client/src/components/timeline/add-timeline-event-form.tsx
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { type InsertTimelineEvent } from "@shared/schema";

const formSchema = z.object({
  title: z.string().min(2, { message: "Title must be at least 2 characters." }),
  description: z.string().optional(),
  gameDate: z.string().optional(),
  eventType: z.string({ required_error: "Please select an event type." }),
});

interface AddTimelineEventFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<InsertTimelineEvent, 'campaignId' | 'realDate'>) => void;
  isSubmitting: boolean;
}

export default function AddTimelineEventForm({ isOpen, onClose, onSubmit, isSubmitting }: AddTimelineEventFormProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      gameDate: "",
      eventType: "manual",
    },
  });

  const handleFormSubmit = (values: z.infer<typeof formSchema>) => {
    onSubmit(values);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose} modal={false}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add a New Timeline Event</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4">
            <FormField control={form.control} name="title" render={({ field }) => ( <FormItem> <FormLabel>Title</FormLabel> <FormControl> <Input placeholder="Ambush on the Triboar Trail" {...field} /> </FormControl> <FormMessage /> </FormItem> )} />
            <FormField control={form.control} name="description" render={({ field }) => ( <FormItem> <FormLabel>Description</FormLabel> <FormControl> <Textarea placeholder="The party is ambushed by goblins..." {...field} /> </FormControl> <FormMessage /> </FormItem> )} />
            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="gameDate" render={({ field }) => ( <FormItem> <FormLabel>In-Game Date</FormLabel> <FormControl> <Input placeholder="e.g., Mirtul 1, 1491 DR" {...field} /> </FormControl> <FormMessage /> </FormItem> )} />
              <FormField
                control={form.control}
                name="eventType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Event Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select an event type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="manual">Manual</SelectItem>
                        <SelectItem value="session_start">Session Start</SelectItem>
                        <SelectItem value="encounter">Encounter</SelectItem>
                        <SelectItem value="discovery">Discovery</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
              <Button type="submit" disabled={isSubmitting}> {isSubmitting ? "Adding..." : "Add Event"} </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}