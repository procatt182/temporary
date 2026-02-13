"use client";

import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from "react";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  type User,
} from "firebase/auth";
import { doc, getDoc, onSnapshot } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import type { UserDocument, UserRole } from "@/lib/types";

interface AuthContextType {
  user: User | null;
  userDoc: UserDocument | null;
  loading: boolean;
  role: UserRole | null;
  /** True when user is authenticated but has no Firestore document (not provisioned by admin). */
  userNotProvisioned: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshUserDoc: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/** Check if a Firestore user document exists for this Firebase Auth user. */
async function checkUserDoc(firebaseUser: User): Promise<boolean> {
  const ref = doc(db, "users", firebaseUser.uid);
  const snap = await getDoc(ref);
  return snap.exists();
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userDoc, setUserDoc] = useState<UserDocument | null>(null);
  const [loading, setLoading] = useState(true);
  const [userNotProvisioned, setUserNotProvisioned] = useState(false);

  // Listen to Firestore user document in real-time
  useEffect(() => {
    if (!user) {
      setUserDoc(null);
      setUserNotProvisioned(false);
      return;
    }

    const ref = doc(db, "users", user.uid);
    const unsubscribe = onSnapshot(
      ref,
      (snap) => {
        if (snap.exists()) {
          setUserDoc(snap.data() as UserDocument);
          setUserNotProvisioned(false);
        } else {
          setUserDoc(null);
          setUserNotProvisioned(true);
        }
      },
      (error) => {
        console.error("User doc snapshot error:", error);
      }
    );
    return unsubscribe;
  }, [user]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        try {
          const exists = await checkUserDoc(firebaseUser);
          if (!exists) {
            setUserNotProvisioned(true);
          }
        } catch (err) {
          console.error("Failed to check user doc:", err);
        }
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const signIn = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const signOut = async () => {
    await firebaseSignOut(auth);
    setUserDoc(null);
    setUserNotProvisioned(false);
  };

  const refreshUserDoc = useCallback(async () => {
    if (!user) return;
    const ref = doc(db, "users", user.uid);
    const snap = await getDoc(ref);
    if (snap.exists()) {
      setUserDoc(snap.data() as UserDocument);
    }
  }, [user]);

  const role = userDoc?.role ?? null;

  return (
    <AuthContext.Provider value={{ user, userDoc, loading, role, userNotProvisioned, signIn, signOut, refreshUserDoc }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
