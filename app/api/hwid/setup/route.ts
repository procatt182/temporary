import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import crypto from "crypto";

function sha256(input: string): string {
  if (/^[a-f0-9]{64}$/i.test(input)) {
    return input.toLowerCase();
  }
  return crypto.createHash("sha256").update(input).digest("hex");
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { uid, hwid } = body;

    if (!uid || !hwid) {
      return NextResponse.json(
        { error: "Missing uid or hwid" },
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

    // Only allow setting HWID if not already set
    if (userData.hwid) {
      return NextResponse.json(
        { error: "HWID is already set. Use the change endpoint instead." },
        { status: 400 }
      );
    }

    const hashedHwid = sha256(hwid.trim());

    await userRef.update({
      hwid: hashedHwid,
    });

    return NextResponse.json({
      success: true,
      hwid: hashedHwid,
    });
  } catch (error) {
    console.error("HWID setup error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
