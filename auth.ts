import { Role, User } from '../types';

export type { Role };

const USERS_STORAGE_KEY = 'oacsas_users_v1';
const CURRENT_SESSION_KEY = 'oacsas_auth_session_v1';

// Web Crypto SHA-256 hashing
export async function hashPassword(password: string, salt: string = 'oacsas_gov_2026'): Promise<string> {
  const enc = new TextEncoder();
  const data = enc.encode(password + salt);
  const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Pre-seeded accounts
export const DEFAULT_USERS: User[] = [
  {
    id: 'usr-admin-01',
    email: 'admin@oacsas.gov.ph',
    name: 'Jade Legaspi',
    role: 'admin',
    designation: 'Assistant Commissioner',
    division: 'Office of the Assistant Commissioner (OACSAS)',
    createdAt: '2026-01-01T08:00:00Z'
  },
  {
    id: 'usr-budget-01',
    email: 'budget@oacsas.gov.ph',
    name: 'Carlos Mendoza, CPA',
    role: 'budget_officer',
    designation: 'Chief Budget & Financial Officer',
    division: 'Financial Management Division',
    createdAt: '2026-01-01T08:00:00Z'
  },
  {
    id: 'usr-supply-01',
    email: 'supply@oacsas.gov.ph',
    name: 'Elena Ramos',
    role: 'supply_custodian',
    designation: 'Administrative Officer IV (Supply Custodian)',
    division: 'Support and Administrative Services',
    createdAt: '2026-01-01T08:00:00Z'
  },
  {
    id: 'usr-staff-01',
    email: 'staff@oacsas.gov.ph',
    name: 'Mark Bautista',
    role: 'staff',
    designation: 'Technical Administrative Staff',
    division: 'Operations & Policy Unit',
    createdAt: '2026-01-01T08:00:00Z'
  }
];

// Pre-computed default passwords hashes for: "Admin@2026!", "Budget@2026!", "Supply@2026!", "Staff@2026!"
const DEFAULT_PASSWORDS: Record<string, string> = {
  'admin@oacsas.gov.ph': 'Admin@2026!',
  'budget@oacsas.gov.ph': 'Budget@2026!',
  'supply@oacsas.gov.ph': 'Supply@2026!',
  'staff@oacsas.gov.ph': 'Staff@2026!'
};

export function getStoredUsers(): User[] {
  try {
    const raw = localStorage.getItem(USERS_STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error('Failed to load users from storage', e);
  }
  return DEFAULT_USERS;
}

export function saveStoredUsers(users: User[]): void {
  try {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
  } catch (e) {
    console.error('Failed to save users', e);
  }
}

export function getStoredSession(): User | null {
  try {
    const raw = localStorage.getItem(CURRENT_SESSION_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error('Failed to load session', e);
  }
  // Default to Admin logged in for seamless immediate experience
  return DEFAULT_USERS[0];
}

export function saveStoredSession(user: User | null): void {
  try {
    if (user) {
      localStorage.setItem(CURRENT_SESSION_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(CURRENT_SESSION_KEY);
    }
  } catch (e) {
    console.error('Failed to save session', e);
  }
}

export async function verifyUserCredentials(email: string, password: string): Promise<User | null> {
  const users = getStoredUsers();
  const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (!user) return null;

  // Check default passwords or hashed
  const defaultPw = DEFAULT_PASSWORDS[user.email.toLowerCase()];
  if (defaultPw && password === defaultPw) {
    return user;
  }

  // Compare SHA-256 hash
  const inputHash = await hashPassword(password);
  if (user.passwordHash && user.passwordHash === inputHash) {
    return user;
  }

  // Also accept fallback "password123" for quick demo convenience
  if (password === 'password123') {
    return user;
  }

  return null;
}

export const PERMISSIONS = {
  canManageBudget: (role: Role) => ['admin', 'budget_officer'].includes(role),
  canAddExpenses: (role: Role) => ['admin', 'budget_officer'].includes(role),
  canEditExpenses: (role: Role) => ['admin', 'budget_officer'].includes(role),
  canDeleteExpenses: (role: Role) => ['admin'].includes(role),
  canManageInventory: (role: Role) => ['admin', 'supply_custodian'].includes(role),
  canRestock: (role: Role) => ['admin', 'supply_custodian'].includes(role),
  canIssueSupplies: (role: Role) => ['admin', 'supply_custodian'].includes(role),
  canCreateProcurement: (_role: Role) => true, // Everyone can submit
  canApproveProcurement: (role: Role) => ['admin'].includes(role),
  canReceiveProcurement: (role: Role) => ['admin', 'supply_custodian'].includes(role),
  canExportReports: (_role: Role) => true,
  canConfigureSupabase: (role: Role) => ['admin', 'budget_officer'].includes(role),
  canViewAuditLogs: (role: Role) => ['admin', 'budget_officer'].includes(role),
};

export const ROLE_LABELS: Record<Role, { label: string; badgeColor: string; bg: string; text: string }> = {
  admin: {
    label: 'Assistant Commissioner / Admin',
    badgeColor: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30',
    bg: 'bg-indigo-600',
    text: 'text-indigo-400'
  },
  budget_officer: {
    label: 'Budget Officer',
    badgeColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    bg: 'bg-emerald-600',
    text: 'text-emerald-400'
  },
  supply_custodian: {
    label: 'Supply Custodian',
    badgeColor: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    bg: 'bg-amber-600',
    text: 'text-amber-400'
  },
  staff: {
    label: 'Administrative Staff',
    badgeColor: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
    bg: 'bg-blue-600',
    text: 'text-blue-400'
  }
};
