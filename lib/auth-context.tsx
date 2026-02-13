"use client";

import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from "react";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendEmailVerification,
  signOut as firebaseSignOut,
  type User,
} from "firebase/auth";
import { doc, getDoc, setDoc, onSnapshot } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import type { UserDocument, UserRole } from "@/lib/types";

interface AuthContextType {
  user: User | null;
  userDoc: UserDocument | null;
  loading: boolean;
  role: UserRole | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshUserDoc: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/** Create or fetch the Firestore user document for a given Firebase Auth user. */
async function ensureUserDoc(firebaseUser: User): Promise<void> {
  const ref = doc(db, "users", firebaseUser.uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    const newUser: UserDocument = {
      uid: firebaseUser.uid,
      email: firebaseUser.email || "",
      role: "user",
      createdAt: Date.now(),
      subscriptionType: null,
      purchaseDate: null,
      expirationDate: null,
      hwid: null,
      hwidChangeCount: 0,
      lastHwidChangeDate: null,
    };
    await setDoc(ref, newUser);
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userDoc, setUserDoc] = useState<UserDocument | null>(null);
  const [loading, setLoading] = useState(true);

  // Listen to Firestore user document in real-time
  useEffect(() => {
    if (!user) {
      setUserDoc(null);
      return;
    }

    const ref = doc(db, "users", user.uid);
    const unsubscribe = onSnapshot(
      ref,
      (snap) => {
        if (snap.exists()) {
          setUserDoc(snap.data() as UserDocument);
        } else {
          setUserDoc(null);
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
          await ensureUserDoc(firebaseUser);
        } catch (err) {
          console.error("Failed to ensure user doc:", err);
        }
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const signIn = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const signUp = async (email: string, password: string) => {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    await sendEmailVerification(cred.user);
  };

  const signOut = async () => {
    await firebaseSignOut(auth);
    setUserDoc(null);
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
    <AuthContext.Provider value={{ user, userDoc, loading, role, signIn, signUp, signOut, refreshUserDoc }}>
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
