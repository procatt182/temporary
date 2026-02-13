import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// ============================================================
// Firebase Configuration
// ============================================================
// Paste your Firebase project config values here, or set them
// as environment variables prefixed with NEXT_PUBLIC_.
//
// You can find these values in the Firebase Console:
// Project Settings > General > Your apps > Firebase SDK snippet
// ============================================================


// Initialize Firebase (prevent re-initialization in hot-reload)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

export const auth = getAuth(app);
export const db = getFirestore(app);
export { firebaseConfig };
