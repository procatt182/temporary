import { initializeApp, getApps, cert, type ServiceAccount } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";

function getServiceAccount(): ServiceAccount {
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (!raw) {
    throw new Error("FIREBASE_SERVICE_ACCOUNT environment variable is not set");
  }
  try {
    return JSON.parse(raw) as ServiceAccount;
  } catch {
    throw new Error("FIREBASE_SERVICE_ACCOUNT is not valid JSON");
  }
}

const adminApp =
  getApps().length === 0
    ? initializeApp({ credential: cert(getServiceAccount()) })
    : getApps()[0];

export const adminDb = getFirestore(adminApp);
export const adminAuth = getAuth(adminApp);
