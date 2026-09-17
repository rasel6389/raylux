// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
export const firebaseConfig = {
  apiKey: "AIzaSyDWDX8tqgl29CP37OuOjr_ROFpIQWpKd9Q",
  authDomain: "rayluxuk.firebaseapp.com",
  projectId: "rayluxuk",
  storageBucket: "rayluxuk.firebasestorage.app",
  messagingSenderId: "717152531817",
  appId: "1:717152531817:web:6ab01744a78f9e968179f8",
  measurementId: "G-BDVV49DG71"
};

// Initialize Firebase (singleton pattern)
export const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Initialize Firebase Authentication
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

// Initialize Cloud Firestore
export const db = getFirestore(app);

// Initialize Firebase Analytics (safe for browser & test environments)
export let analytics: ReturnType<typeof getAnalytics> | null = null;
if (typeof window !== 'undefined') {
  isSupported().then((supported) => {
    if (supported) {
      analytics = getAnalytics(app);
    }
  }).catch(() => {
    // Analytics not supported in this environment
  });
}

// Auth Helper Functions
import {
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile as updateFirebaseProfile,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User as FirebaseUser,
} from "firebase/auth";

export async function loginWithFirebaseGoogle(): Promise<FirebaseUser> {
  const result = await signInWithPopup(auth, googleProvider);
  return result.user;
}

export async function loginWithFirebaseEmail(email: string, pass: string): Promise<FirebaseUser> {
  const result = await signInWithEmailAndPassword(auth, email, pass);
  return result.user;
}

export async function signupWithFirebaseEmail(name: string, email: string, pass: string): Promise<FirebaseUser> {
  const result = await createUserWithEmailAndPassword(auth, email, pass);
  if (name && result.user) {
    try {
      await updateFirebaseProfile(result.user, { displayName: name });
    } catch {
      // ignore
    }
  }
  return result.user;
}

export async function logoutFirebase(): Promise<void> {
  await firebaseSignOut(auth);
}

export function subscribeToFirebaseAuth(callback: (user: FirebaseUser | null) => void) {
  return onAuthStateChanged(auth, callback);
}

