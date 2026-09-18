import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types/product';
import {
  loginWithFirebaseGoogle,
  loginWithFirebaseEmail,
  signupWithFirebaseEmail,
  logoutFirebase,
  subscribeToFirebaseAuth,
} from '../services/firebase';

interface AuthContextType {
  currentUser: User | null;
  registeredUsers: User[];
  login: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  signup: (name: string, email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  loginWithGoogle: (googleProfile?: { name: string; email: string; avatar?: string }) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<User>) => void;
  addCustomer: (userData: Omit<User, 'id'>) => User;
  updateCustomer: (userId: string, data: Partial<User>) => void;
  deleteCustomer: (userId: string) => void;
  setCustomerStatus: (userId: string, status: 'ACTIVE' | 'VIP' | 'SUSPENDED') => void;
  isAuthModalOpen: boolean;
  authModalMode: 'signin' | 'signup' | 'forgot';
  openAuthModal: (mode?: 'signin' | 'signup' | 'forgot') => void;
  closeAuthModal: () => void;
}

const DEFAULT_USERS: User[] = [
  {
    id: 'usr-marcus-01',
    name: 'Marcus Vance',
    email: 'marcus.vance@studio.com',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    provider: 'email',
    joinedDate: 'Nov 14, 2025',
    role: 'customer',
    phone: '+1 (555) 234-8921',
    sizePreference: 'L/XL (58-61CM)',
    status: 'VIP',
    totalOrders: 3,
    totalSpent: 450,
  },
  {
    id: 'usr-elena-02',
    name: 'Elena Rostova',
    email: 'elena.rostova@design.de',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=200&q=80',
    provider: 'google',
    joinedDate: 'Jan 20, 2026',
    role: 'customer',
    phone: '+49 170 8291029',
    sizePreference: 'S/M (54-57CM)',
    status: 'ACTIVE',
    totalOrders: 2,
    totalSpent: 195,
  },
  {
    id: 'usr-kenji-03',
    name: 'Kenji Takahashi',
    email: 'kenji.t@tokyo-lab.jp',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    provider: 'google',
    joinedDate: 'Mar 04, 2026',
    role: 'customer',
    phone: '+81 90 1234 5678',
    sizePreference: 'ADJUSTABLE',
    status: 'VIP',
    totalOrders: 4,
    totalSpent: 380,
  },
];

const USER_STORAGE_KEY = 'raylux_auth_user_v2';
const REGISTERED_USERS_KEY = 'raylux_registered_users_v2';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [registeredUsers, setRegisteredUsers] = useState<User[]>(() => {
    try {
      const saved = localStorage.getItem(REGISTERED_USERS_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // ignore
    }
    return DEFAULT_USERS;
  });

  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem(USER_STORAGE_KEY);
      if (saved !== null) {
        return saved === 'guest' ? null : JSON.parse(saved);
      }
    } catch {
      // ignore
    }
    return DEFAULT_USERS[0];
  });

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'signin' | 'signup' | 'forgot'>('signin');

  // Listen to Firebase Auth state
  useEffect(() => {
    const unsubscribe = subscribeToFirebaseAuth((fbUser) => {
      if (fbUser && fbUser.email) {
        const userEmail = fbUser.email.toLowerCase();
        setRegisteredUsers((prev) => {
          const existing = prev.find((u) => u.email.toLowerCase() === userEmail);
          if (existing) {
            const updated: User = {
              ...existing,
              name: fbUser.displayName || existing.name,
              avatar: fbUser.photoURL || existing.avatar,
            };
            setCurrentUser(updated);
            return prev.map((u) => (u.id === existing.id ? updated : u));
          } else {
            const newUser: User = {
              id: fbUser.uid,
              name: fbUser.displayName || userEmail.split('@')[0] || 'Rayluxx Member',
              email: userEmail,
              avatar: fbUser.photoURL || undefined,
              provider: fbUser.providerData[0]?.providerId === 'google.com' ? 'google' : 'email',
              joinedDate: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
              role: 'customer',
              status: 'ACTIVE',
              totalOrders: 0,
              totalSpent: 0,
              sizePreference: 'ADJUSTABLE',
            };
            setCurrentUser(newUser);
            return [newUser, ...prev];
          }
        });
      }
    });

    return () => unsubscribe();
  }, []);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(REGISTERED_USERS_KEY, JSON.stringify(registeredUsers));
    } catch {
      // ignore
    }
  }, [registeredUsers]);

  useEffect(() => {
    try {
      if (currentUser) {
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(currentUser));
      } else {
        localStorage.setItem(USER_STORAGE_KEY, 'guest');
      }
    } catch {
      // ignore
    }
  }, [currentUser]);

  const openAuthModal = (mode: 'signin' | 'signup' | 'forgot' = 'signin') => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  const login = async (email: string, pass: string): Promise<{ success: boolean; error?: string }> => {
    const trimmed = email.trim().toLowerCase();

    // 1. Check if user matches a demo account
    const existing = registeredUsers.find((u) => u.email.toLowerCase() === trimmed);
    if (existing && pass === 'password123') {
      setCurrentUser(existing);
      closeAuthModal();
      return { success: true };
    }

    // 2. Try Firebase Authentication
    try {
      const fbUser = await loginWithFirebaseEmail(trimmed, pass);
      if (fbUser) {
        closeAuthModal();
        return { success: true };
      }
    } catch (err: any) {
      // If Firebase user not found or auth not configured, check local registered users
      if (existing) {
        setCurrentUser(existing);
        closeAuthModal();
        return { success: true };
      }

      // If user doesn't exist anywhere, create smooth local account
      if (err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') {
        return { success: false, error: 'Invalid email or password. Please verify credentials or Join Us.' };
      }
    }

    // Fallback account creation for quick onboarding
    if (existing) {
      setCurrentUser(existing);
      closeAuthModal();
      return { success: true };
    }

    const newUser: User = {
      id: `usr-${Date.now()}`,
      name: trimmed.split('@')[0].replace(/[^a-zA-Z]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()) || 'Rayluxx Member',
      email: trimmed,
      provider: 'email',
      joinedDate: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      role: 'customer',
      status: 'ACTIVE',
      totalOrders: 0,
      totalSpent: 0,
      sizePreference: 'L/XL (58-61CM)',
    };
    setRegisteredUsers((prev) => [newUser, ...prev]);
    setCurrentUser(newUser);
    closeAuthModal();
    return { success: true };
  };

  const signup = async (name: string, email: string, pass: string): Promise<{ success: boolean; error?: string }> => {
    const trimmedEmail = email.trim().toLowerCase();
    const trimmedName = name.trim();

    // Try Firebase Authentication
    try {
      await signupWithFirebaseEmail(trimmedName, trimmedEmail, pass);
      closeAuthModal();
      return { success: true };
    } catch (err: any) {
      // If Firebase account already exists or offline, handle gracefully
      if (err.code === 'auth/email-already-in-use') {
        return { success: false, error: 'An account with this email already exists. Please sign in instead.' };
      }
      if (err.code === 'auth/weak-password') {
        return { success: false, error: 'Password should be at least 6 characters.' };
      }
    }

    const existing = registeredUsers.find((u) => u.email.toLowerCase() === trimmedEmail);
    if (existing) {
      setCurrentUser(existing);
      closeAuthModal();
      return { success: true };
    }

    const newUser: User = {
      id: `usr-${Date.now()}`,
      name: trimmedName,
      email: trimmedEmail,
      provider: 'email',
      joinedDate: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      role: 'customer',
      status: 'ACTIVE',
      totalOrders: 0,
      totalSpent: 0,
      sizePreference: 'L/XL (58-61CM)',
    };

    setRegisteredUsers((prev) => [newUser, ...prev]);
    setCurrentUser(newUser);
    closeAuthModal();
    return { success: true };
  };

  const loginWithGoogle = async (googleProfile?: { name: string; email: string; avatar?: string }) => {
    // If a profile was explicitly passed (e.g. from demo picker)
    if (googleProfile) {
      const email = googleProfile.email;
      const name = googleProfile.name;
      const avatar = googleProfile.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80';

      const existing = registeredUsers.find((u) => u.email.toLowerCase() === email.toLowerCase());
      if (existing) {
        const updated = { ...existing, avatar: avatar || existing.avatar };
        setCurrentUser(updated);
        setRegisteredUsers((prev) => prev.map((u) => (u.id === existing.id ? updated : u)));
      } else {
        const newUser: User = {
          id: `usr-google-${Date.now()}`,
          name,
          email,
          avatar,
          provider: 'google',
          joinedDate: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          role: 'customer',
          status: 'ACTIVE',
          totalOrders: 0,
          totalSpent: 0,
          sizePreference: 'ADJUSTABLE',
        };
        setRegisteredUsers((prev) => [newUser, ...prev]);
        setCurrentUser(newUser);
      }
      closeAuthModal();
      return;
    }

    // Otherwise, trigger real Firebase Google OAuth popup
    try {
      const fbUser = await loginWithFirebaseGoogle();
      if (fbUser) {
        closeAuthModal();
      }
    } catch (err: any) {
      console.warn('Firebase Google Auth notice:', err.message || err);
      // If popup closed or blocked, we gracefully do not crash
    }
  };

  const logout = async () => {
    try {
      await logoutFirebase();
    } catch {
      // ignore
    }
    setCurrentUser(null);
  };

  const updateProfile = (data: Partial<User>) => {
    if (!currentUser) return;
    const updated = { ...currentUser, ...data };
    setCurrentUser(updated);
    setRegisteredUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
  };

  const addCustomer = (userData: Omit<User, 'id'>): User => {
    const newCust: User = {
      ...userData,
      id: `usr-${Date.now().toString(36)}`,
      joinedDate: userData.joinedDate || new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
      role: userData.role || 'customer',
      totalOrders: userData.totalOrders || 0,
      totalSpent: userData.totalSpent || 0,
      status: userData.status || 'ACTIVE',
    };
    setRegisteredUsers((prev) => [newCust, ...prev]);
    return newCust;
  };

  const updateCustomer = (userId: string, data: Partial<User>) => {
    setRegisteredUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, ...data } : u))
    );
    if (currentUser?.id === userId) {
      setCurrentUser((prev) => (prev ? { ...prev, ...data } : null));
    }
  };

  const deleteCustomer = (userId: string) => {
    setRegisteredUsers((prev) => prev.filter((u) => u.id !== userId));
  };

  const setCustomerStatus = (userId: string, status: 'ACTIVE' | 'VIP' | 'SUSPENDED') => {
    updateCustomer(userId, { status });
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        registeredUsers,
        login,
        signup,
        loginWithGoogle,
        logout,
        updateProfile,
        addCustomer,
        updateCustomer,
        deleteCustomer,
        setCustomerStatus,
        isAuthModalOpen,
        authModalMode,
        openAuthModal,
        closeAuthModal,
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
