import React, { createContext, useContext, useState, useEffect } from 'react';
import { Role, User } from '../types';
import { 
  getStoredSession, 
  saveStoredSession, 
  getStoredUsers, 
  saveStoredUsers, 
  verifyUserCredentials,
  hashPassword,
  PERMISSIONS,
  DEFAULT_USERS
} from '../services/auth';

interface AuthContextType {
  currentUser: User | null;
  users: User[];
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  switchUser: (userId: string) => void;
  registerUser: (userData: Omit<User, 'id' | 'createdAt'> & { password?: string }) => Promise<{ success: boolean; error?: string }>;
  updateUser: (userId: string, userData: Partial<User> & { password?: string }) => Promise<{ success: boolean; error?: string }>;
  deleteUser: (userId: string) => { success: boolean; error?: string };
  permissions: {
    canManageBudget: boolean;
    canAddExpenses: boolean;
    canEditExpenses: boolean;
    canDeleteExpenses: boolean;
    canManageInventory: boolean;
    canRestock: boolean;
    canIssueSupplies: boolean;
    canCreateProcurement: boolean;
    canApproveProcurement: boolean;
    canReceiveProcurement: boolean;
    canExportReports: boolean;
    canConfigureSupabase: boolean;
    canViewAuditLogs: boolean;
  };
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(() => getStoredSession());
  const [users, setUsers] = useState<User[]>(() => getStoredUsers());

  useEffect(() => {
    saveStoredSession(currentUser);
  }, [currentUser]);

  useEffect(() => {
    saveStoredUsers(users);
  }, [users]);

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const user = await verifyUserCredentials(email, password);
      if (user) {
        setCurrentUser(user);
        return { success: true };
      }
      return { success: false, error: 'Invalid email address or encrypted password credentials.' };
    } catch (err: any) {
      return { success: false, error: err.message || 'Login failed.' };
    }
  };

  const logout = () => {
    setCurrentUser(null);
  };

  const switchUser = (userId: string) => {
    const target = users.find(u => u.id === userId);
    if (target) {
      setCurrentUser(target);
    }
  };

  const registerUser = async (userData: Omit<User, 'id' | 'createdAt'> & { password?: string }) => {
    const exists = users.some(u => u.email.toLowerCase() === userData.email.toLowerCase());
    if (exists) {
      return { success: false, error: 'A user with this email address already exists.' };
    }

    let passwordHash: string | undefined = undefined;
    if (userData.password) {
      passwordHash = await hashPassword(userData.password);
    }

    const newUser: User = {
      id: `usr-${Date.now()}`,
      email: userData.email,
      name: userData.name,
      role: userData.role,
      designation: userData.designation,
      division: userData.division,
      passwordHash,
      createdAt: new Date().toISOString()
    };

    setUsers(prev => [...prev, newUser]);
    return { success: true };
  };

  const updateUser = async (userId: string, userData: Partial<User> & { password?: string }) => {
    let passwordHash = userData.passwordHash;
    if (userData.password) {
      passwordHash = await hashPassword(userData.password);
    }

    setUsers(prev => prev.map(u => {
      if (u.id === userId) {
        const updated = {
          ...u,
          ...userData,
          ...(passwordHash ? { passwordHash } : {})
        };
        delete (updated as any).password;
        if (currentUser?.id === userId) {
          setCurrentUser(updated);
        }
        return updated;
      }
      return u;
    }));

    return { success: true };
  };

  const deleteUser = (userId: string) => {
    if (users.length <= 1) {
      return { success: false, error: 'Cannot delete the only remaining user in the system.' };
    }
    setUsers(prev => prev.filter(u => u.id !== userId));
    if (currentUser?.id === userId) {
      const remaining = users.filter(u => u.id !== userId);
      setCurrentUser(remaining[0] || null);
    }
    return { success: true };
  };

  const currentRole: Role = currentUser?.role || 'staff';

  const permissions = {
    canManageBudget: PERMISSIONS.canManageBudget(currentRole),
    canAddExpenses: PERMISSIONS.canAddExpenses(currentRole),
    canEditExpenses: PERMISSIONS.canEditExpenses(currentRole),
    canDeleteExpenses: PERMISSIONS.canDeleteExpenses(currentRole),
    canManageInventory: PERMISSIONS.canManageInventory(currentRole),
    canRestock: PERMISSIONS.canRestock(currentRole),
    canIssueSupplies: PERMISSIONS.canIssueSupplies(currentRole),
    canCreateProcurement: PERMISSIONS.canCreateProcurement(currentRole),
    canApproveProcurement: PERMISSIONS.canApproveProcurement(currentRole),
    canReceiveProcurement: PERMISSIONS.canReceiveProcurement(currentRole),
    canExportReports: PERMISSIONS.canExportReports(currentRole),
    canConfigureSupabase: PERMISSIONS.canConfigureSupabase(currentRole),
    canViewAuditLogs: PERMISSIONS.canViewAuditLogs(currentRole),
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        users,
        login,
        logout,
        switchUser,
        registerUser,
        updateUser,
        deleteUser,
        permissions
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
