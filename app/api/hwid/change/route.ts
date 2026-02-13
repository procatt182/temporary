import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { MAX_HWID_CHANGES, HWID_COOLDOWN_MS } from "@/lib/types";
import crypto from "crypto";

function sha256(input: string): string {
  // Check if already a SHA-256 hash
  if (/^[a-f0-9]{64}$/i.test(input)) {
    return input.toLowerCase();
  }
  return crypto.createHash("sha256").update(input).digest("hex");
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { uid, newHwid } = body;

    if (!uid || !newHwid) {
      return NextResponse.json(
        { error: "Missing uid or newHwid" },
        { status: 400 }
      );
    }

    const userRef = adminDb.collection("users").doc(uid);
    const userSnap = await userRef.get();

    if (!userSnap.exists) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    const userData = userSnap.data()!;

    // Check subscription is active
    const subType = userData.subscriptionType;
    if (!subType) {
      return NextResponse.json(
        { error: "No active subscription" },
        { status: 403 }
      );
    }
    if (subType !== "lifetime") {
      const expDate = userData.expirationDate;
      if (!expDate || Date.now() >= expDate) {
        return NextResponse.json(
          { error: "Subscription has expired" },
          { status: 403 }
        );
      }
    }

    // Check HWID change count
    const changeCount = userData.hwidChangeCount ?? 0;
    if (changeCount >= MAX_HWID_CHANGES) {
      return NextResponse.json(
        {
          error: "HWID change limit reached. Please join our Discord for assistance.",
          code: "LIMIT_REACHED",
        },
        { status: 403 }
      );
    }

    // Check cooldown
    const lastChange = userData.lastHwidChangeDate;
    if (lastChange) {
      const elapsed = Date.now() - lastChange;
      if (elapsed < HWID_COOLDOWN_MS) {
        const remaining = HWID_COOLDOWN_MS - elapsed;
        return NextResponse.json(
          {
            error: "HWID change is on cooldown",
            code: "COOLDOWN_ACTIVE",
            cooldownRemaining: remaining,
          },
          { status: 429 }
        );
      }
    }

    // All checks passed - update HWID
    const hashedHwid = sha256(newHwid.trim());

    await userRef.update({
      hwid: hashedHwid,
      hwidChangeCount: changeCount + 1,
      lastHwidChangeDate: Date.now(),
    });

    return NextResponse.json({
      success: true,
      hwid: hashedHwid,
      remainingChanges: MAX_HWID_CHANGES - (changeCount + 1),
    });
  } catch (error) {
    console.error("HWID change error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
