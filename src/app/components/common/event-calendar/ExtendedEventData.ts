import { DayPilot } from "@daypilot/daypilot-lite-angular";

// Create an extended interface for your events
export interface ExtendedEventData extends DayPilot.EventData {
  description?: string;
  location?: string;
  capacity?: number;
  status?: string;
  organizer?: unknown; // You might want to define a User interface instead of any
  attendees?: unknown[]; // Similarly, define a User[] interface instead of any[]
}
