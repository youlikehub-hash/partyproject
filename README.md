# PartyPilot 🎈 — Smart Party Management & Expense Splitter

> A production-ready, highly scalable, mobile-first Party Management and Financial Ledger web application built with **Next.js (App Router)**, **TypeScript (Strict Mode)**, and **Tailwind CSS**.

---

## 🚀 Key Features

### 1. Clean Architecture & Feature-Driven Layout
- **Feature-Based Modular Structure**:
  - `src/features/auth`: Mobile phone OTP authentication, admin credentials login for Sandeep, JWT session cookies, and user state management.
  - `src/features/parties`: Party entity lifecycle (Upcoming, Ongoing, Completed, Cancelled), RSVP and attendee tracking, metadata vibes (budget, dress code, BYOB, themes, notes, and cover banners).
  - `src/features/expenses`: Multi-party expense tracking, split modes (**Equal**, **Exact**, **Percentage**), and real-time ledger recalculation.
  - `src/features/admin`: Sandeep's Global Admin command center, real-time system metrics, immutable audit trail, user account status toggle, and party host overrides.
- **Robust Error Handling**: Top-level `ErrorBoundary` and global reactive `ToastProvider` for real-time notifications.
- **Strict Validation**: Type-safe runtime schemas with **Zod** integrated into **React Hook Form**.

---

### 2. Authentication & Role-Based Access Control (RBAC)

#### Regular Users (Mobile Number + OTP)
- Input mobile number with country code (e.g. `+919876543210`).
- Receives 6-digit OTP code (with 5-minute expiry and resend countdown).
- Instant dev/test verification: Use the displayed code or master test code **`123456`**.
- Automatic session provisioning via secure `httpOnly` JWT cookies.

#### Master Admin Account (**Sandeep**)
- **Username / ID**: `Admin`
- **Password**: `Admin@123`
- **Display Name**: `Sandeep`
- **Role**: `GLOBAL_ADMIN` (elevated privileges)
- **Privileges**:
  - Full CRUD access across **all** user accounts, parties, expenses, and settlements.
  - Host Reassignment & Override: Sandeep can reassign ownership of any party to any registered user.
  - User Directory Governance: One-click account activation / suspension.
  - Centralized Audit Logging: Review all user logins, party creations, status transitions, and debt settlements.

---

### 3. Expense & Ledger Splitter ("Who Owes Whom")

The system implements a **Greedy Debt Simplification Graph Algorithm** to eliminate circular debts and minimize overall transactions:
1. Calculates each participant's **Total Paid** and **Total Share** across all party expenses.
2. Determines the exact **Net Balance** (`totalPaid - totalShare`):
   - Positive (`> 0`): Creditor (is owed money).
   - Negative (`< 0`): Debtor (owes money).
3. Executes optimal pairwise matching between the largest debtors and largest creditors until all balances reach zero.
4. Provides an interactive **Mark Settled** workflow that creates automatic reconciliation entries and triggers a celebratory confetti effect.

---

### 4. Database & Cloud Architecture

- **Active Self-Contained Engine**: Synchronous in-memory cache with atomic file persistence (`.data/party_pilot_db.json`), fully pre-seeded with Sandeep's account, demo users (Rahul, Priya, Amit, Ananya), and realistic parties.
- **Prisma Schema (`prisma/schema.prisma`)**: Complete PostgreSQL relational data model with enums, indexes, and cascade delete rules.
- **Firebase Firestore Rules (`firebase/firestore.rules`)**: Production-ready security rules enforcing strict role-based access for Sandeep and party hosts.

---

## 🛠️ Project Structure

```
d:\Project\Testing Project
├── prisma/
│   └── schema.prisma                # Production PostgreSQL Prisma schema
├── firebase/
│   └── firestore.rules              # Strict Firestore Security Rules
├── src/
│   ├── app/                         # Next.js App Router (pages & API routes)
│   │   ├── api/
│   │   │   ├── admin/               # Sandeep's admin endpoints (stats, users, audit, override)
│   │   │   ├── auth/                # OTP send, OTP verify, admin login, me, logout
│   │   │   ├── expenses/            # Expense CRUD & debt settlement
│   │   │   └── parties/             # Party CRUD & member invites
│   │   ├── admin/page.tsx           # Sandeep's Admin Command Center
│   │   ├── expenses/page.tsx        # Cross-party ledger overview
│   │   ├── login/page.tsx           # Dual-mode login (Mobile OTP + Admin credentials)
│   │   ├── parties/
│   │   │   ├── [id]/page.tsx        # Party detail (Header, Ledger, Expenses, Attendees)
│   │   │   └── create/page.tsx      # Party creation wizard
│   │   ├── globals.css              # Mobile-first CSS & safe area paddings
│   │   ├── layout.tsx               # Root layout with AppShell wrapper
│   │   ├── page.tsx                 # Main Dashboard & Party Explorer
│   ├── components/
│   │   ├── common/                  # Button, Input, Select, Modal, Badge, Toast, ErrorBoundary
│   │   └── layout/                  # Navbar, BottomNav (mobile navigation), AppShell
│   ├── features/                    # Feature-driven Clean Architecture
│   │   ├── admin/                   # AdminDashboard, AuditLogViewer, GlobalPartyManager, etc.
│   │   ├── auth/                    # PhoneOtpForm, AdminLoginForm, AuthTabs, useAuth hook
│   │   ├── expenses/                # AddExpenseModal, ExpenseList, LedgerSplitterView
│   │   └── parties/                 # PartyCard, PartyFilters, PartyFormModal, PartyDetailHeader
│   ├── lib/
│   │   ├── auth/                    # JWT signing/verification, bcrypt hashing, OTP engine
│   │   ├── calculations/            # Ledger split calculations & debt simplification graph
│   │   ├── db/                      # Persistent database store & pre-seeded data
│   │   ├── validations/             # Zod schemas for auth, parties, and expenses
│   │   └── utils.ts                 # Formatting, currency, initials, and styling helpers
│   ├── types/                       # Strict TypeScript interfaces for all data models
│   └── middleware.ts                # Edge route protection for /admin
├── tailwind.config.ts               # Custom festive colors, shadows, and touch targets
└── tsconfig.json                    # TypeScript strict mode configuration
```

---

## 🏃 Getting Started

### 1. Run Development Server
```bash
pnpm dev
# or
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your mobile device emulator or web browser.

### 2. Login Credentials
- **Sandeep (Global Admin)**:
  - Tab: **Admin (Sandeep)**
  - Username: `Admin`
  - Password: `Admin@123`
- **Regular Users (Mobile OTP)**:
  - Tab: **Mobile OTP**
  - Demo Numbers: `+919876543210` (Rahul), `+919812345678` (Priya), `+919823456789` (Amit)
  - OTP: `123456` or the dynamic 6-digit code provided on-screen.

### 3. Production Build
```bash
pnpm run build
pnpm start
```
All routes are verified to compile cleanly with TypeScript Strict Mode and Zero type errors.

