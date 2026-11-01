export type PartyType =
  | "Birthday"
  | "House Party"
  | "Trip"
  | "Dinner"
  | "Festival"
  | "Bachelor Party"
  | "Office Party"
  | "Concert"
  | "Other";

export type PartyStatus = "Upcoming" | "Ongoing" | "Completed" | "Cancelled";

export interface PartyMetadata {
  dressCode?: string;
  theme?: string;
  estimatedBudget?: number;
  byob?: boolean;
  notes?: string;
  coverImage?: string;
  [key: string]: unknown;
}

export interface PartyMember {
  userId: string;
  displayName: string;
  phoneNumber?: string;
  role: "HOST" | "CO_HOST" | "ATTENDEE";
  joinedAt: string;
  avatarUrl?: string;
}

export interface Party {
  id: string;
  title: string;
  type: PartyType;
  date: string; // ISO String
  venue: string;
  hostUserId: string; // Who gave/is hosting the party
  hostDisplayName: string;
  status: PartyStatus;
  metadata: PartyMetadata;
  members: PartyMember[];
  createdAt: string;
  updatedAt: string;
}

export interface CreatePartyInput {
  title: string;
  type: PartyType;
  date: string;
  venue: string;
  hostUserId?: string; // If admin specifies host or defaults to current user
  metadata?: PartyMetadata;
  invitedMemberPhones?: string[];
}

export interface UpdatePartyInput {
  title?: string;
  type?: PartyType;
  date?: string;
  venue?: string;
  hostUserId?: string;
  status?: PartyStatus;
  metadata?: PartyMetadata;
}

