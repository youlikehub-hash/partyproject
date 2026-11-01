import fs from "fs";
import path from "path";
import bcrypt from "bcryptjs";
import { User, Role } from "@/types/auth";
import { Party, PartyMember, CreatePartyInput, UpdatePartyInput, PartyStatus } from "@/types/party";
import { Expense, CreateExpenseInput, SplitType } from "@/types/expense";
import { AuditLog, AuditAction, SystemMetrics } from "@/types/audit";
import { calculateSplits } from "../calculations/ledger";

interface DBData {
  users: User[];
  parties: Party[];
  expenses: Expense[];
  auditLogs: AuditLog[];
}

const DATA_DIR = path.join(process.cwd(), ".data");
const DATA_FILE = path.join(DATA_DIR, "party_pilot_db.json");

class DatabaseStore {
  private data: DBData;

  constructor() {
    this.data = this.loadOrSeed();
  }

  private ensureDir() {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  }

  private loadOrSeed(): DBData {
    this.ensureDir();
    if (fs.existsSync(DATA_FILE)) {
      try {
        const raw = fs.readFileSync(DATA_FILE, "utf-8");
        return JSON.parse(raw);
      } catch (err) {
        console.error("Failed to parse database file, re-seeding default data:", err);
      }
    }
    const initialData = this.generateSeedData();
    this.saveData(initialData);
    return initialData;
  }

  private saveData(dataToSave?: DBData) {
    this.ensureDir();
    const payload = dataToSave || this.data;
    fs.writeFileSync(DATA_FILE, JSON.stringify(payload, null, 2), "utf-8");
  }

  private generateSeedData(): DBData {
    const salt = bcrypt.genSaltSync(10);
    const adminPasswordHash = bcrypt.hashSync("Admin@123", salt);

    const now = new Date().toISOString();

    const adminUser: User = {
      id: "usr_admin_sandeep",
      username: "Admin",
      phoneNumber: "+919999900000",
      displayName: "Sandeep",
      role: "GLOBAL_ADMIN",
      avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
      createdAt: "2026-01-01T10:00:00.000Z",
      updatedAt: now,
      isActive: true,
    };

    const user1: User = {
      id: "usr_rahul",
      phoneNumber: "+919876543210",
      displayName: "Rahul Sharma",
      role: "USER",
      avatarUrl: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80",
      createdAt: "2026-02-15T12:00:00.000Z",
      updatedAt: now,
      isActive: true,
    };

    const user2: User = {
      id: "usr_priya",
      phoneNumber: "+919812345678",
      displayName: "Priya Patel",
      role: "USER",
      avatarUrl: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80",
      createdAt: "2026-02-20T14:30:00.000Z",
      updatedAt: now,
      isActive: true,
    };

    const user3: User = {
      id: "usr_amit",
      phoneNumber: "+919823456789",
      displayName: "Amit Kumar",
      role: "USER",
      avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
      createdAt: "2026-03-01T09:15:00.000Z",
      updatedAt: now,
      isActive: true,
    };

    const user4: User = {
      id: "usr_ananya",
      phoneNumber: "+919834567890",
      displayName: "Ananya Roy",
      role: "USER",
      avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
      createdAt: "2026-03-05T11:45:00.000Z",
      updatedAt: now,
      isActive: true,
    };

    // Store admin password in a protected metadata property or credential mapping
    (adminUser as unknown as { passwordHash: string }).passwordHash = adminPasswordHash;

    const party1: Party = {
      id: "pty_house_party_2026",
      title: "Neon Rooftop House Party 2026",
      type: "House Party",
      date: "2026-11-14T19:30:00.000Z",
      venue: "Skyline Terrace Penthouse, Indiranagar, Bengaluru",
      hostUserId: user1.id,
      hostDisplayName: user1.displayName,
      status: "Upcoming",
      metadata: {
        dressCode: "Neon & Glow in the Dark",
        theme: "Cyberpunk Glow",
        estimatedBudget: 35000,
        byob: true,
        notes: "DJ set starting at 9 PM. Finger foods and craft cocktails included.",
        coverImage: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800&auto=format&fit=crop&q=80",
      },
      members: [
        { userId: user1.id, displayName: user1.displayName, phoneNumber: user1.phoneNumber, role: "HOST", joinedAt: now },
        { userId: user2.id, displayName: user2.displayName, phoneNumber: user2.phoneNumber, role: "CO_HOST", joinedAt: now },
        { userId: user3.id, displayName: user3.displayName, phoneNumber: user3.phoneNumber, role: "ATTENDEE", joinedAt: now },
        { userId: user4.id, displayName: user4.displayName, phoneNumber: user4.phoneNumber, role: "ATTENDEE", joinedAt: now },
      ],
      createdAt: "2026-10-25T18:00:00.000Z",
      updatedAt: now,
    };

    const party2: Party = {
      id: "pty_goa_trip_2026",
      title: "Sunburn & Beach Retreat Goa",
      type: "Trip",
      date: "2026-12-05T10:00:00.000Z",
      venue: "Vagator Villa by the Waves, North Goa",
      hostUserId: adminUser.id, // Hosted by Sandeep (Admin)
      hostDisplayName: adminUser.displayName,
      status: "Upcoming",
      metadata: {
        dressCode: "Beach Casuals & Linen",
        theme: "Coastal Sunset Vibes",
        estimatedBudget: 75000,
        byob: false,
        notes: "Private 4-bedroom villa with infinity pool booked for 3 nights.",
        coverImage: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&auto=format&fit=crop&q=80",
      },
      members: [
        { userId: adminUser.id, displayName: adminUser.displayName, phoneNumber: adminUser.phoneNumber, role: "HOST", joinedAt: now },
        { userId: user1.id, displayName: user1.displayName, phoneNumber: user1.phoneNumber, role: "ATTENDEE", joinedAt: now },
        { userId: user2.id, displayName: user2.displayName, phoneNumber: user2.phoneNumber, role: "ATTENDEE", joinedAt: now },
        { userId: user3.id, displayName: user3.displayName, phoneNumber: user3.phoneNumber, role: "ATTENDEE", joinedAt: now },
      ],
      createdAt: "2026-10-20T12:00:00.000Z",
      updatedAt: now,
    };

    const party3: Party = {
      id: "pty_birthday_priya",
      title: "Priya's 25th Milestone Birthday Bash",
      type: "Birthday",
      date: "2026-10-28T20:00:00.000Z",
      venue: "The Glass House Brewery, MG Road",
      hostUserId: user2.id,
      hostDisplayName: user2.displayName,
      status: "Completed",
      metadata: {
        dressCode: "Semi-Formal Cocktail",
        theme: "Silver & Midnight Blue",
        estimatedBudget: 42000,
        byob: false,
        notes: "Cake cutting at 10 PM sharp!",
        coverImage: "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=800&auto=format&fit=crop&q=80",
      },
      members: [
        { userId: user2.id, displayName: user2.displayName, phoneNumber: user2.phoneNumber, role: "HOST", joinedAt: now },
        { userId: user1.id, displayName: user1.displayName, phoneNumber: user1.phoneNumber, role: "ATTENDEE", joinedAt: now },
        { userId: user3.id, displayName: user3.displayName, phoneNumber: user3.phoneNumber, role: "ATTENDEE", joinedAt: now },
        { userId: user4.id, displayName: user4.displayName, phoneNumber: user4.phoneNumber, role: "ATTENDEE", joinedAt: now },
      ],
      createdAt: "2026-10-15T15:00:00.000Z",
      updatedAt: now,
    };

    // Pre-seed realistic expenses for Party 1
    const p1Participants = party1.members.map((m) => ({ userId: m.userId, displayName: m.displayName }));
    
    const exp1: Expense = {
      id: "exp_101",
      partyId: party1.id,
      partyTitle: party1.title,
      payerId: user1.id,
      payerDisplayName: user1.displayName,
      title: "Rooftop Venue Booking Advance",
      amount: 15000,
      category: "Venue / Stay",
      splitType: "EQUAL",
      splits: calculateSplits(15000, p1Participants, "EQUAL"),
      notes: "Advance deposit for sound system and terrace lights",
      createdAt: "2026-10-26T14:00:00.000Z",
      updatedAt: "2026-10-26T14:00:00.000Z",
    };

    const exp2: Expense = {
      id: "exp_102",
      partyId: party1.id,
      partyTitle: party1.title,
      payerId: user2.id,
      payerDisplayName: user2.displayName,
      title: "Gourmet Snack Platters & Finger Food",
      amount: 6800,
      category: "Food & Drinks",
      splitType: "EQUAL",
      splits: calculateSplits(6800, p1Participants, "EQUAL"),
      notes: "Sliders, dips, skewers, and vegan tacos",
      createdAt: "2026-10-27T16:30:00.000Z",
      updatedAt: "2026-10-27T16:30:00.000Z",
    };

    const exp3: Expense = {
      id: "exp_103",
      partyId: party1.id,
      partyTitle: party1.title,
      payerId: user3.id,
      payerDisplayName: user3.displayName,
      title: "UV Neon Glow Lights & Props",
      amount: 3200,
      category: "Decorations",
      splitType: "EQUAL",
      splits: calculateSplits(3200, p1Participants, "EQUAL"),
      notes: "Glow wristbands, body paint, and blacklight strobes",
      createdAt: "2026-10-28T11:15:00.000Z",
      updatedAt: "2026-10-28T11:15:00.000Z",
    };

    // Pre-seed realistic expenses for Party 2 (Hosted by Sandeep)
    const p2Participants = party2.members.map((m) => ({ userId: m.userId, displayName: m.displayName }));
    const exp4: Expense = {
      id: "exp_201",
      partyId: party2.id,
      partyTitle: party2.title,
      payerId: adminUser.id,
      payerDisplayName: adminUser.displayName,
      title: "Beachside Villa 50% Advance",
      amount: 40000,
      category: "Venue / Stay",
      splitType: "EQUAL",
      splits: calculateSplits(40000, p2Participants, "EQUAL"),
      notes: "Paid via Sandeep's corporate card",
      createdAt: "2026-10-22T10:00:00.000Z",
      updatedAt: "2026-10-22T10:00:00.000Z",
    };

    const initialAuditLogs: AuditLog[] = [
      {
        id: "log_001",
        userId: adminUser.id,
        userName: adminUser.displayName,
        role: "GLOBAL_ADMIN",
        action: "ADMIN_LOGIN",
        resource: "AUTH",
        resourceId: adminUser.id,
        details: { method: "Credentials", username: "Admin" },
        ipAddress: "127.0.0.1",
        userAgent: "PartyPilot/1.0",
        timestamp: "2026-10-20T10:00:00.000Z",
      },
      {
        id: "log_002",
        userId: adminUser.id,
        userName: adminUser.displayName,
        role: "GLOBAL_ADMIN",
        action: "PARTY_CREATED",
        resource: "PARTY",
        resourceId: party2.id,
        details: { title: party2.title, venue: party2.venue, budget: 75000 },
        ipAddress: "127.0.0.1",
        userAgent: "PartyPilot/1.0",
        timestamp: "2026-10-20T12:00:00.000Z",
      },
      {
        id: "log_003",
        userId: user1.id,
        userName: user1.displayName,
        role: "USER",
        action: "PARTY_CREATED",
        resource: "PARTY",
        resourceId: party1.id,
        details: { title: party1.title, venue: party1.venue },
        ipAddress: "127.0.0.1",
        userAgent: "Mozilla/5.0 Mobile",
        timestamp: "2026-10-25T18:00:00.000Z",
      },
      {
        id: "log_004",
        userId: user1.id,
        userName: user1.displayName,
        role: "USER",
        action: "EXPENSE_ADDED",
        resource: "EXPENSE",
        resourceId: exp1.id,
        details: { title: exp1.title, amount: exp1.amount, partyId: party1.id },
        ipAddress: "127.0.0.1",
        userAgent: "Mozilla/5.0 Mobile",
        timestamp: "2026-10-26T14:00:00.000Z",
      },
    ];

    return {
      users: [adminUser, user1, user2, user3, user4],
      parties: [party1, party2, party3],
      expenses: [exp1, exp2, exp3, exp4],
      auditLogs: initialAuditLogs,
    };
  }

  // User queries
  public getUsers(): User[] {
    return this.data.users.map((u) => {
      // Do not leak password hash in general queries
      const { ...safeUser } = u;
      return safeUser;
    });
  }

  public getUserById(id: string): User | undefined {
    return this.data.users.find((u) => u.id === id);
  }

  public getUserByPhone(phoneNumber: string): User | undefined {
    return this.data.users.find((u) => u.phoneNumber === phoneNumber);
  }

  public getUserByUsername(username: string): (User & { passwordHash?: string }) | undefined {
    return this.data.users.find((u) => u.username?.toLowerCase() === username.toLowerCase()) as
      | (User & { passwordHash?: string })
      | undefined;
  }

  public createOrUpdatePhoneUser(phoneNumber: string, displayName?: string): User {
    let user = this.getUserByPhone(phoneNumber);
    const now = new Date().toISOString();

    if (user) {
      if (displayName && displayName !== user.displayName) {
        user.displayName = displayName;
        user.updatedAt = now;
        this.saveData();
      }
      return user;
    }

    const newUser: User = {
      id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      phoneNumber,
      displayName: displayName || `PartyGoer ${phoneNumber.slice(-4)}`,
      role: "USER",
      createdAt: now,
      updatedAt: now,
      isActive: true,
    };

    this.data.users.push(newUser);
    this.saveData();

    this.logAudit({
      userId: newUser.id,
      userName: newUser.displayName,
      role: newUser.role,
      action: "USER_REGISTERED",
      resource: "USER",
      resourceId: newUser.id,
      details: { phoneNumber },
    });

    return newUser;
  }

  public toggleUserStatus(userId: string, currentAdminId: string): User | null {
    const user = this.data.users.find((u) => u.id === userId);
    if (!user) return null;
    if (user.role === "GLOBAL_ADMIN") return user; // Cannot disable master admin

    user.isActive = !user.isActive;
    user.updatedAt = new Date().toISOString();
    this.saveData();

    this.logAudit({
      userId: currentAdminId,
      action: "ADMIN_USER_TOGGLED",
      resource: "USER",
      resourceId: user.id,
      details: { targetUser: user.displayName, newStatus: user.isActive ? "ACTIVE" : "DISABLED" },
    });

    return user;
  }

  // Party queries
  public getParties(userId?: string, isAdmin: boolean = false): Party[] {
    if (isAdmin) {
      return [...this.data.parties].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );
    }
    if (!userId) return [];

    return this.data.parties
      .filter((p) => p.hostUserId === userId || p.members.some((m) => m.userId === userId))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  public getPartyById(id: string): Party | undefined {
    return this.data.parties.find((p) => p.id === id);
  }

  public createParty(input: CreatePartyInput, creator: User): Party {
    const now = new Date().toISOString();
    const partyId = `pty_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    // If Sandeep / GLOBAL_ADMIN, can assign party to another host; else creator is host
    const hostId = creator.role === "GLOBAL_ADMIN" && input.hostUserId ? input.hostUserId : creator.id;
    const hostUser = this.getUserById(hostId) || creator;

    const members: PartyMember[] = [
      {
        userId: hostUser.id,
        displayName: hostUser.displayName,
        phoneNumber: hostUser.phoneNumber,
        role: "HOST",
        joinedAt: now,
      },
    ];

    // Add invited phone members if provided
    if (input.invitedMemberPhones && input.invitedMemberPhones.length > 0) {
      for (const phone of input.invitedMemberPhones) {
        if (!phone) continue;
        const existing = this.createOrUpdatePhoneUser(phone);
        if (existing.id !== hostUser.id && !members.some((m) => m.userId === existing.id)) {
          members.push({
            userId: existing.id,
            displayName: existing.displayName,
            phoneNumber: existing.phoneNumber,
            role: "ATTENDEE",
            joinedAt: now,
          });
        }
      }
    }

    const newParty: Party = {
      id: partyId,
      title: input.title,
      type: input.type,
      date: input.date,
      venue: input.venue,
      hostUserId: hostUser.id,
      hostDisplayName: hostUser.displayName,
      status: "Upcoming",
      metadata: input.metadata || {},
      members,
      createdAt: now,
      updatedAt: now,
    };

    this.data.parties.unshift(newParty);
    this.saveData();

    this.logAudit({
      userId: creator.id,
      userName: creator.displayName,
      role: creator.role,
      action: "PARTY_CREATED",
      resource: "PARTY",
      resourceId: newParty.id,
      details: { title: newParty.title, venue: newParty.venue, hostId: hostUser.id },
    });

    return newParty;
  }

  public updateParty(
    partyId: string,
    updates: UpdatePartyInput,
    actor: User
  ): { party: Party | null; error?: string } {
    const party = this.getPartyById(partyId);
    if (!party) return { party: null, error: "Party not found" };

    const isAdmin = actor.role === "GLOBAL_ADMIN";
    const isHost = party.hostUserId === actor.id;

    if (!isAdmin && !isHost) {
      return { party: null, error: "Permission denied: only the host or Sandeep (Admin) can edit this party" };
    }

    const now = new Date().toISOString();

    if (updates.title) party.title = updates.title;
    if (updates.type) party.type = updates.type;
    if (updates.date) party.date = updates.date;
    if (updates.venue) party.venue = updates.venue;
    if (updates.status) party.status = updates.status;
    if (updates.metadata) party.metadata = { ...party.metadata, ...updates.metadata };

    // Host override allowed for GLOBAL_ADMIN
    if (updates.hostUserId && isAdmin && updates.hostUserId !== party.hostUserId) {
      const newHost = this.getUserById(updates.hostUserId);
      if (newHost) {
        party.hostUserId = newHost.id;
        party.hostDisplayName = newHost.displayName;
        if (!party.members.some((m) => m.userId === newHost.id)) {
          party.members.push({
            userId: newHost.id,
            displayName: newHost.displayName,
            phoneNumber: newHost.phoneNumber,
            role: "HOST",
            joinedAt: now,
          });
        }
        this.logAudit({
          userId: actor.id,
          userName: actor.displayName,
          role: actor.role,
          action: "HOST_OVERRIDDEN",
          resource: "PARTY",
          resourceId: party.id,
          details: { newHostId: newHost.id, newHostName: newHost.displayName },
        });
      }
    }

    party.updatedAt = now;
    this.saveData();

    this.logAudit({
      userId: actor.id,
      userName: actor.displayName,
      role: actor.role,
      action: "PARTY_UPDATED",
      resource: "PARTY",
      resourceId: party.id,
      details: { updates },
    });

    return { party };
  }

  public deleteParty(partyId: string, actor: User): { success: boolean; error?: string } {
    const partyIndex = this.data.parties.findIndex((p) => p.id === partyId);
    if (partyIndex === -1) return { success: false, error: "Party not found" };

    const party = this.data.parties[partyIndex];
    const isAdmin = actor.role === "GLOBAL_ADMIN";
    const isHost = party.hostUserId === actor.id;

    if (!isAdmin && !isHost) {
      return { success: false, error: "Permission denied: only host or Sandeep can delete this party" };
    }

    // Cascade delete associated expenses
    this.data.expenses = this.data.expenses.filter((e) => e.partyId !== partyId);
    this.data.parties.splice(partyIndex, 1);
    this.saveData();

    this.logAudit({
      userId: actor.id,
      userName: actor.displayName,
      role: actor.role,
      action: "PARTY_DELETED",
      resource: "PARTY",
      resourceId: partyId,
      details: { title: party.title },
    });

    return { success: true };
  }

  public addPartyMember(partyId: string, userToAdd: User, actor: User): { success: boolean; error?: string } {
    const party = this.getPartyById(partyId);
    if (!party) return { success: false, error: "Party not found" };

    const isAdmin = actor.role === "GLOBAL_ADMIN";
    const isHost = party.hostUserId === actor.id;

    if (!isAdmin && !isHost && actor.id !== userToAdd.id) {
      return { success: false, error: "Permission denied" };
    }

    if (party.members.some((m) => m.userId === userToAdd.id)) {
      return { success: true }; // already member
    }

    party.members.push({
      userId: userToAdd.id,
      displayName: userToAdd.displayName,
      phoneNumber: userToAdd.phoneNumber,
      role: "ATTENDEE",
      joinedAt: new Date().toISOString(),
    });

    party.updatedAt = new Date().toISOString();
    this.saveData();
    return { success: true };
  }

  // Expense queries
  public getExpensesByParty(partyId: string): Expense[] {
    return this.data.expenses
      .filter((e) => e.partyId === partyId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public getAllExpenses(userId?: string, isAdmin: boolean = false): Expense[] {
    if (isAdmin) {
      return [...this.data.expenses].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    }
    if (!userId) return [];

    return this.data.expenses
      .filter((e) => e.payerId === userId || e.splits.some((s) => s.userId === userId))
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public createExpense(input: CreateExpenseInput, actor: User): { expense: Expense | null; error?: string } {
    const party = this.getPartyById(input.partyId);
    if (!party) return { expense: null, error: "Party not found" };

    const payer = this.getUserById(input.payerId);
    if (!payer) return { expense: null, error: "Payer not found" };

    // Find participant details from party members or database
    const participants = input.participantIds
      .map((id) => this.getUserById(id))
      .filter((u): u is User => !!u)
      .map((u) => ({ userId: u.id, displayName: u.displayName }));

    if (participants.length === 0) {
      return { expense: null, error: "At least one participant required for splitting" };
    }

    const splits = calculateSplits(
      input.amount,
      participants,
      input.splitType,
      input.exactAmounts,
      input.percentageShares
    );

    const now = new Date().toISOString();
    const newExpense: Expense = {
      id: `exp_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      partyId: input.partyId,
      partyTitle: party.title,
      payerId: payer.id,
      payerDisplayName: payer.displayName,
      title: input.title,
      amount: input.amount,
      category: input.category,
      splitType: input.splitType,
      splits,
      notes: input.notes,
      createdAt: now,
      updatedAt: now,
    };

    this.data.expenses.unshift(newExpense);
    this.saveData();

    this.logAudit({
      userId: actor.id,
      userName: actor.displayName,
      role: actor.role,
      action: "EXPENSE_ADDED",
      resource: "EXPENSE",
      resourceId: newExpense.id,
      details: { title: newExpense.title, amount: newExpense.amount, partyTitle: party.title },
    });

    return { expense: newExpense };
  }

  public deleteExpense(expenseId: string, actor: User): { success: boolean; error?: string } {
    const index = this.data.expenses.findIndex((e) => e.id === expenseId);
    if (index === -1) return { success: false, error: "Expense not found" };

    const exp = this.data.expenses[index];
    const party = this.getPartyById(exp.partyId);

    const isAdmin = actor.role === "GLOBAL_ADMIN";
    const isPayer = exp.payerId === actor.id;
    const isHost = party?.hostUserId === actor.id;

    if (!isAdmin && !isPayer && !isHost) {
      return { success: false, error: "Permission denied: only payer, host or Sandeep can delete this expense" };
    }

    this.data.expenses.splice(index, 1);
    this.saveData();

    this.logAudit({
      userId: actor.id,
      userName: actor.displayName,
      role: actor.role,
      action: "EXPENSE_DELETED",
      resource: "EXPENSE",
      resourceId: expenseId,
      details: { title: exp.title, amount: exp.amount },
    });

    return { success: true };
  }

  public recordSettlement(
    partyId: string,
    fromUserId: string,
    toUserId: string,
    amount: number,
    actor: User
  ): { expense: Expense | null; error?: string } {
    const party = this.getPartyById(partyId);
    if (!party) return { expense: null, error: "Party not found" };

    const fromUser = this.getUserById(fromUserId);
    const toUser = this.getUserById(toUserId);

    if (!fromUser || !toUser) {
      return { expense: null, error: "Invalid settlement users" };
    }

    const now = new Date().toISOString();
    // A settlement is represented as a direct payment expense where fromUser paid amount to toUser
    const settlementExpense: Expense = {
      id: `exp_settle_${Date.now()}`,
      partyId,
      partyTitle: party.title,
      payerId: fromUser.id,
      payerDisplayName: fromUser.displayName,
      title: `Settlement Payment to ${toUser.displayName}`,
      amount,
      category: "Other",
      splitType: "EXACT",
      splits: [
        {
          userId: toUser.id,
          userDisplayName: toUser.displayName,
          amountOwed: amount,
          percentage: 100,
          isPaid: true,
          paidAt: now,
        },
      ],
      notes: `Direct settlement verified by ${actor.displayName}`,
      createdAt: now,
      updatedAt: now,
    };

    this.data.expenses.unshift(settlementExpense);
    this.saveData();

    this.logAudit({
      userId: actor.id,
      userName: actor.displayName,
      role: actor.role,
      action: "DEBT_SETTLED",
      resource: "LEDGER",
      resourceId: settlementExpense.id,
      details: { from: fromUser.displayName, to: toUser.displayName, amount, partyTitle: party.title },
    });

    return { expense: settlementExpense };
  }

  // Audit and Admin Operations
  public logAudit(logData: {
    userId?: string;
    userName?: string;
    role?: string;
    action: AuditAction;
    resource: AuditLog["resource"];
    resourceId?: string;
    details: Record<string, unknown>;
    ipAddress?: string;
    userAgent?: string;
  }): void {
    const newLog: AuditLog = {
      id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString(),
      ...logData,
    };
    this.data.auditLogs.unshift(newLog);
    // Keep max 500 audit logs to prevent unbounded growth
    if (this.data.auditLogs.length > 500) {
      this.data.auditLogs.pop();
    }
    this.saveData();
  }

  public getAuditLogs(limit: number = 100): AuditLog[] {
    return this.data.auditLogs.slice(0, limit);
  }

  public getSystemMetrics(): SystemMetrics {
    const totalExpensesAmount = this.data.expenses.reduce((acc, curr) => acc + curr.amount, 0);
    const activeParties = this.data.parties.filter(
      (p) => p.status === "Upcoming" || p.status === "Ongoing"
    ).length;

    return {
      totalUsers: this.data.users.length,
      activeUsers: this.data.users.filter((u) => u.isActive).length,
      totalParties: this.data.parties.length,
      activeParties,
      totalExpensesAmount: Math.round(totalExpensesAmount * 100) / 100,
      totalTransactions: this.data.expenses.length,
      auditLogsCount: this.data.auditLogs.length,
    };
  }
}

// Global singleton instance
export const db = new DatabaseStore();

