import { z } from "zod";

export const partyTypeEnum = z.enum([
  "Birthday",
  "House Party",
  "Trip",
  "Dinner",
  "Festival",
  "Bachelor Party",
  "Office Party",
  "Concert",
  "Other",
]);

export const partyStatusEnum = z.enum([
  "Upcoming",
  "Ongoing",
  "Completed",
  "Cancelled",
]);

export const createPartySchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(100),
  type: partyTypeEnum,
  date: z.string().min(1, "Party date and time is required"),
  venue: z.string().min(3, "Venue location is required").max(150),
  hostUserId: z.string().optional(),
  metadata: z
    .object({
      dressCode: z.string().optional(),
      theme: z.string().optional(),
      estimatedBudget: z.number().nonnegative().optional(),
      byob: z.boolean().optional(),
      notes: z.string().optional(),
      coverImage: z.string().url().optional().or(z.literal("")),
    })
    .optional(),
  invitedMemberPhones: z.array(z.string()).optional(),
});

export const updatePartySchema = createPartySchema.partial().extend({
  status: partyStatusEnum.optional(),
});

