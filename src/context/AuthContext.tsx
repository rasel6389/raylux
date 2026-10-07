import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types/product';
import {
  loginWithFirebaseGoogle,
  loginWithFirebaseEmail,
  signupWithFirebaseEmail,
  resetFirebasePassword,
  logoutFirebase,
  subscribeToFirebaseAuth,
} from '../services/firebase';

interface AuthContextType {
  currentUser: User | null;
  registeredUsers: User[];
  login: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  signup: (name: string, email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  loginWithGoogle: () => Promise<{ success: boolean; error?: string }>;
  sendPasswordReset: (email: string) => Promise<{ success: boolean; error?: string }>;
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

const DEFAULT_USERS: User[] = [];

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
    return null;
  });

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'signin' | 'signup' | 'forgot'>('signin');

  // Listen to Firebase Auth state
  useEffect(() => {
    const unsubscribe = subscribeToFirebaseAuth((fbUser) => {
      if (fbUser && fbUser.email) {
        const userEmail = fbUser.email.toLowerCase();
        const providerId = fbUser.providerData[0]?.providerId;
        const detectedProvider: 'google' | 'email' =
          providerId === 'google.com' ? 'google' : 'email';

        setRegisteredUsers((prev) => {
          const existing = prev.find((u) => u.email.toLowerCase() === userEmail);
          if (existing) {
            const updated: User = {
              ...existing,
              name: fbUser.displayName || existing.name,
              avatar: fbUser.photoURL || existing.avatar,
              provider: detectedProvider,
            };
            setCurrentUser(updated);
            return prev.map((u) => (u.id === existing.id ? updated : u));
          } else {
            const parsedName =
              fbUser.displayName ||
              userEmail.split('@')[0].replace(/[^a-zA-Z]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()) ||
              'Rayluxx Member';
            const newUser: User = {
              id: fbUser.uid,
              name: parsedName,
              email: userEmail,
              avatar: fbUser.photoURL || undefined,
              provider: detectedProvider,
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
      } else {
        setCurrentUser(null);
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
    try {
      const fbUser = await loginWithFirebaseEmail(trimmed, pass);
      if (fbUser) {
        closeAuthModal();
        return { success: true };
      }
      return { success: false, error: 'Unable to sign in. Please verify your credentials.' };
    } catch (err: any) {
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        return { success: false, error: 'Invalid email or password. Please verify credentials or Join Us.' };
      }
      if (err.code === 'auth/invalid-email') {
        return { success: false, error: 'Please enter a valid email address.' };
      }
      if (err.code === 'auth/too-many-requests') {
        return { success: false, error: 'Access temporarily disabled due to multiple failed attempts. Try again later.' };
      }
      return { success: false, error: err.message || 'Unable to sign in. Please verify your credentials.' };
    }
  };

  const signup = async (name: string, email: string, pass: string): Promise<{ success: boolean; error?: string }> => {
    const trimmedEmail = email.trim().toLowerCase();
    const trimmedName = name.trim();

    try {
      const fbUser = await signupWithFirebaseEmail(trimmedName, trimmedEmail, pass);
      if (fbUser) {
        closeAuthModal();
        return { success: true };
      }
      return { success: false, error: 'Account creation failed. Please try again.' };
    } catch (err: any) {
      if (err.code === 'auth/email-already-in-use') {
        return { success: false, error: 'An account with this email already exists. Please sign in instead.' };
      }
      if (err.code === 'auth/weak-password') {
        return { success: false, error: 'Password should be at least 6 characters.' };
      }
      if (err.code === 'auth/invalid-email') {
        return { success: false, error: 'Please provide a valid email address.' };
      }
      return { success: false, error: err.message || 'Account creation failed. Please try again.' };
    }
  };

  const loginWithGoogle = async (): Promise<{ success: boolean; error?: string }> => {
    try {
      const fbUser = await loginWithFirebaseGoogle();
      if (fbUser && fbUser.email) {
        closeAuthModal();
        return { success: true };
      }
      return { success: false, error: 'Google sign in did not return an account.' };
    } catch (err: any) {
      if (err.code === 'auth/popup-closed-by-user') {
        return { success: false, error: 'Sign in popup was closed. Please try again.' };
      }
      if (err.code === 'auth/unauthorized-domain') {
        return { success: false, error: 'Domain not authorized in Firebase Console. Please add to Authorized Domains.' };
      }
      return { success: false, error: err.message || 'Unable to connect to Google OAuth.' };
    }
  };

  const sendPasswordReset = async (email: string): Promise<{ success: boolean; error?: string }> => {
    try {
      await resetFirebasePassword(email.trim().toLowerCase());
      return { success: true };
    } catch (err: any) {
      if (err.code === 'auth/user-not-found') {
        return { success: false, error: 'No account registered with this email address.' };
      }
      if (err.code === 'auth/invalid-email') {
        return { success: false, error: 'Please enter a valid email address.' };
      }
      return { success: false, error: err.message || 'Failed to dispatch password recovery email.' };
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
        sendPasswordReset,
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
