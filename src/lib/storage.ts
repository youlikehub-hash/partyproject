import { promises as fs } from "fs";
import path from "path";
import bcrypt from "bcryptjs";
import { DatabaseSchema, User, Party, UserStatus, PartyStatus } from "@/types/ledger";

const DATA_DIR = path.join(process.cwd(), "data");
const DB_FILE = path.join(DATA_DIR, "db.json");
const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");

// Basic asynchronous write queue mutex to ensure concurrency safety
let writeQueue = Promise.resolve();

function enqueueWrite<T>(task: () => Promise<T>): Promise<T> {
  const result = writeQueue.then(task);
  writeQueue = result.catch(() => {}) as unknown as Promise<void>;
  return result;
}

/**
 * Ensures data directory and db.json exist
 */
async function ensureDbExists(): Promise<void> {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    await fs.mkdir(UPLOAD_DIR, { recursive: true });
    await fs.access(DB_FILE);
  } catch {
    const salt = bcrypt.genSaltSync(10);
    const defaultAdminHash = bcrypt.hashSync("Admin@123", salt);

    const initialDb: DatabaseSchema = {
      users: [
        {
          id: "usr_admin_sandeep",
          mobileNumber: "Admin",
          password: defaultAdminHash,
          name: "Sandeep",
          role: "ADMIN",
          status: "ACTIVE",
          createdAt: new Date().toISOString(),
        },
      ],
      parties: [],
    };
    await fs.writeFile(DB_FILE, JSON.stringify(initialDb, null, 2), "utf-8");
  }
}

/**
 * Reads the entire database from data/db.json
 */
export async function readDb(): Promise<DatabaseSchema> {
  await ensureDbExists();
  try {
    const data = await fs.readFile(DB_FILE, "utf-8");
    return JSON.parse(data);
  } catch (err) {
    console.error("Error reading db.json, attempting fallback:", err);
    return { users: [], parties: [] };
  }
}

/**
 * Atomically writes data back to data/db.json with queue mutex
 */
export async function writeDb(data: DatabaseSchema): Promise<void> {
  return enqueueWrite(async () => {
    await ensureDbExists();
    const tempFile = `${DB_FILE}.tmp.${Date.now()}`;
    await fs.writeFile(tempFile, JSON.stringify(data, null, 2), "utf-8");
    await fs.rename(tempFile, DB_FILE);
  });
}

/**
 * Find user by mobile number or username
 */
export async function findUser(identifier: string): Promise<User | null> {
  const db = await readDb();
  const raw = identifier.trim().toLowerCase();

  // If identifier is "admin"
  if (raw === "admin") {
    const adminUser = db.users.find(
      (u) => u.mobileNumber.toLowerCase() === "admin" || u.role === "ADMIN"
    );
    if (adminUser) return adminUser;
  }

  // Exact mobile number match
  let user = db.users.find((u) => u.mobileNumber.toLowerCase() === raw);
  if (user) return user;

  // Normalized digit matching (e.g. +919876543210 vs 9876543210)
  const digitsOnly = raw.replace(/\D/g, "");
  if (digitsOnly.length >= 10) {
    const last10 = digitsOnly.slice(-10);
    user = db.users.find((u) => {
      const uDigits = u.mobileNumber.replace(/\D/g, "");
      return uDigits.endsWith(last10) || u.mobileNumber.toLowerCase() === raw;
    });
  }

  return user || null;
}

/**
 * Find user by ID
 */
export async function findUserById(id: string): Promise<User | null> {
  const db = await readDb();
  const user = db.users.find((u) => u.id === id);
  return user || null;
}

/**
 * Register a new user with status PENDING
 */
export async function registerUser(userData: {
  mobileNumber: string;
  name: string;
  passwordPlain: string;
}): Promise<User> {
  const db = await readDb();

  const rawDigits = userData.mobileNumber.replace(/\D/g, "");
  const last10 = rawDigits.length >= 10 ? rawDigits.slice(-10) : rawDigits;
  const existing = db.users.find((u) => {
    const uDigits = u.mobileNumber.replace(/\D/g, "");
    return (last10 && uDigits.endsWith(last10)) || u.mobileNumber === userData.mobileNumber;
  });
  if (existing) {
    throw new Error("A user with this mobile number already exists.");
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(userData.passwordPlain, salt);

  const newUser: User = {
    id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    mobileNumber: userData.mobileNumber.trim(),
    password: hashedPassword,
    name: userData.name.trim(),
    role: "USER",
    status: "PENDING", // Cannot log in until Sandeep approves
    createdAt: new Date().toISOString(),
  };

  db.users.push(newUser);
  await writeDb(db);
  return newUser;
}

/**
 * Admin action: Approve, deactivate or reactivate user
 */
export async function updateUserStatus(userId: string, status: UserStatus): Promise<User> {
  const db = await readDb();
  const user = db.users.find((u) => u.id === userId);
  if (!user) {
    throw new Error("User not found.");
  }
  if (user.role === "ADMIN") {
    throw new Error("Master administrator status cannot be modified.");
  }

  user.status = status;
  user.updatedAt = new Date().toISOString();
  await writeDb(db);
  return user;
}

/**
 * List all users (for Sandeep's user management tab)
 */
export async function getAllUsers(): Promise<Omit<User, "password">[]> {
  const db = await readDb();
  return db.users
    .map(({ password, ...safeUser }) => safeUser)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

/**
 * Get parties list with optional status filter
 */
export async function getParties(statusFilter?: PartyStatus): Promise<Party[]> {
  const db = await readDb();
  let list = db.parties;
  if (statusFilter) {
    list = list.filter((p) => p.status === statusFilter);
  }
  return list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

/**
 * Get single party by ID
 */
export async function getPartyById(id: string): Promise<Party | null> {
  const db = await readDb();
  return db.parties.find((p) => p.id === id) || null;
}

/**
 * Submit a new party record (status defaults to PENDING for admin review)
 */
export async function createParty(partyData: {
  hostId: string;
  hostName: string;
  date: string;
  hotelName: string;
  amountSpent: number;
  remarks: string;
  billImageUrl: string;
}): Promise<Party> {
  const db = await readDb();

  const newParty: Party = {
    id: `pty_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    hostId: partyData.hostId,
    hostName: partyData.hostName,
    date: partyData.date,
    hotelName: partyData.hotelName.trim(),
    amountSpent: Number(partyData.amountSpent),
    remarks: partyData.remarks.trim(),
    billImageUrl: partyData.billImageUrl || "",
    status: "PENDING", // Requires Sandeep's approval
    createdAt: new Date().toISOString(),
  };

  db.parties.unshift(newParty);
  await writeDb(db);
  return newParty;
}

/**
 * Admin action: Approve or reject a party entry with remarks
 */
export async function moderateParty(
  partyId: string,
  status: "APPROVED" | "REJECTED",
  adminRemarks: string,
  adminName: string
): Promise<Party> {
  const db = await readDb();
  const party = db.parties.find((p) => p.id === partyId);
  if (!party) {
    throw new Error("Party record not found.");
  }

  party.status = status;
  party.adminRemarks = adminRemarks.trim();
  party.reviewedAt = new Date().toISOString();
  party.reviewedBy = adminName;

  await writeDb(db);
  return party;
}

/**
 * Saves uploaded bill image locally in public/uploads/
 */
export async function saveUploadedBill(
  fileBuffer: Buffer,
  originalFilename: string
): Promise<string> {
  await ensureDbExists();
  const ext = path.extname(originalFilename) || ".jpg";
  const safeBase = path.basename(originalFilename, ext).replace(/[^a-zA-Z0-9_-]/g, "_");
  const filename = `${Date.now()}_${safeBase}${ext}`;
  const filepath = path.join(UPLOAD_DIR, filename);

  await fs.writeFile(filepath, fileBuffer);
  return `/uploads/${filename}`;
}

/**
 * Update an existing party record in db.json
 */
export async function updateParty(
  partyId: string,
  data: Partial<Pick<Party, "hotelName" | "amountSpent" | "remarks" | "date" | "billImageUrl">>
): Promise<Party> {
  const db = await readDb();
  const party = db.parties.find((p) => p.id === partyId);
  if (!party) {
    throw new Error("Party record not found.");
  }

  if (data.hotelName !== undefined) party.hotelName = data.hotelName.trim();
  if (data.amountSpent !== undefined) party.amountSpent = Number(data.amountSpent);
  if (data.remarks !== undefined) party.remarks = data.remarks.trim();
  if (data.date !== undefined) party.date = data.date;
  if (data.billImageUrl !== undefined) party.billImageUrl = data.billImageUrl;
  party.updatedAt = new Date().toISOString();

  await writeDb(db);
  return party;
}

/**
 * Delete a party record from db.json
 */
export async function deleteParty(partyId: string): Promise<boolean> {
  const db = await readDb();
  const initialLength = db.parties.length;
  db.parties = db.parties.filter((p) => p.id !== partyId);
  if (db.parties.length === initialLength) {
    return false;
  }
  await writeDb(db);
  return true;
}

