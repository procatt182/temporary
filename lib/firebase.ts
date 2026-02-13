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

const firebaseConfig = {
  apiKey: "AIzaSyC0bZ2Kvw_5GS1VqFf6HuSl3BhEwrKtk8Q",
  authDomain: "maikatisymebal.firebaseapp.com",
  projectId: "maikatisymebal",
  storageBucket: "maikatisymebal.firebasestorage.app",
  messagingSenderId: "100684443502",
  appId: "1:100684443502:web:f5cbf15c958af909a49b7f"
};

// Initialize Firebase (prevent re-initialization in hot-reload)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

export const auth = getAuth(app);
export const db = getFirestore(app);
export { firebaseConfig };
