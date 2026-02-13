import { NextRequest, NextResponse } from "next/server";
import { adminDb, adminAuth } from "@/lib/firebase-admin";
import type { SubscriptionType, UserRole } from "@/lib/types";

async function verifyAdmin(uid: string): Promise<boolean> {
  const userSnap = await adminDb.collection("users").doc(uid).get();
  if (!userSnap.exists) return false;
  const role = userSnap.data()?.role;
  return role === "admin" || role === "moderator";
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, adminUid, targetUid, ...params } = body;

    if (!adminUid) {
      return NextResponse.json({ error: "Missing adminUid" }, { status: 400 });
    }

    // Verify admin/moderator role
    const isAdmin = await verifyAdmin(adminUid);
    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    switch (action) {
      case "resetHwidCounter": {
        if (!targetUid) {
          return NextResponse.json({ error: "Missing targetUid" }, { status: 400 });
        }
        await adminDb.collection("users").doc(targetUid).update({
          hwidChangeCount: 0,
          lastHwidChangeDate: null,
        });
        return NextResponse.json({ success: true, message: "HWID counter reset" });
      }

      case "extendExpiration": {
        if (!targetUid || !params.days) {
          return NextResponse.json({ error: "Missing targetUid or days" }, { status: 400 });
        }
        const days = parseInt(params.days, 10);
        if (isNaN(days) || days <= 0) {
          return NextResponse.json({ error: "Invalid days value" }, { status: 400 });
        }

        const userSnap = await adminDb.collection("users").doc(targetUid).get();
        if (!userSnap.exists) {
          return NextResponse.json({ error: "User not found" }, { status: 404 });
        }
        const userData = userSnap.data()!;
        const currentExp = userData.expirationDate || Date.now();
        const base = currentExp > Date.now() ? currentExp : Date.now();
        const newExp = base + days * 24 * 60 * 60 * 1000;

        await adminDb.collection("users").doc(targetUid).update({
          expirationDate: newExp,
        });
        return NextResponse.json({ success: true, message: `Expiration extended by ${days} days`, newExpiration: newExp });
      }

      case "assignSubscription": {
        if (!targetUid || !params.subscriptionType) {
          return NextResponse.json({ error: "Missing targetUid or subscriptionType" }, { status: 400 });
        }
        const subType = params.subscriptionType as SubscriptionType;
        const updates: Record<string, unknown> = {
          subscriptionType: subType,
          purchaseDate: Date.now(),
        };

        if (subType === "lifetime") {
          updates.expirationDate = null;
        } else if (subType === "1month") {
          updates.expirationDate = Date.now() + 30 * 24 * 60 * 60 * 1000;
        } else if (subType === "3months") {
          updates.expirationDate = Date.now() + 90 * 24 * 60 * 60 * 1000;
        }

        await adminDb.collection("users").doc(targetUid).update(updates);
        return NextResponse.json({ success: true, message: "Subscription assigned" });
      }

      case "editHwid": {
        if (!targetUid) {
          return NextResponse.json({ error: "Missing targetUid" }, { status: 400 });
        }
        await adminDb.collection("users").doc(targetUid).update({
          hwid: params.hwid || null,
        });
        return NextResponse.json({ success: true, message: "HWID updated" });
      }

      case "editUser": {
        if (!targetUid) {
          return NextResponse.json({ error: "Missing targetUid" }, { status: 400 });
        }
        const updateFields: Record<string, unknown> = {};

        if (params.role) updateFields.role = params.role as UserRole;
        if (params.subscriptionType !== undefined) {
          updateFields.subscriptionType = params.subscriptionType || null;
          if (!updateFields.subscriptionType) {
            // Clearing subscription
          } else if (updateFields.subscriptionType === "lifetime") {
            updateFields.expirationDate = null;
          }
        }
        if (params.hwid !== undefined) updateFields.hwid = params.hwid || null;
        if (params.purchaseDate !== undefined) updateFields.purchaseDate = params.purchaseDate;
        if (params.expirationDate !== undefined) updateFields.expirationDate = params.expirationDate;

        await adminDb.collection("users").doc(targetUid).update(updateFields);
        return NextResponse.json({ success: true, message: "User updated" });
      }

      case "createUser": {
        const { email, password, role, subscriptionType, expirationDate, hwid } = params;

        if (!email || !password) {
          return NextResponse.json({ error: "Missing email or password" }, { status: 400 });
        }

        // Create Firebase Auth user
        let firebaseUser;
        try {
          firebaseUser = await adminAuth.createUser({
            email,
            password,
            emailVerified: true, // Admin-created users are pre-verified
          });
        } catch (err: unknown) {
          const message = err instanceof Error ? err.message : "Failed to create auth user";
          return NextResponse.json({ error: message }, { status: 400 });
        }

        // Create Firestore user document
        const userDoc = {
          uid: firebaseUser.uid,
          email,
          role: (role as UserRole) || "user",
          createdAt: Date.now(),
          subscriptionType: (subscriptionType as SubscriptionType) || null,
          purchaseDate: subscriptionType ? Date.now() : null,
          expirationDate: expirationDate || null,
          hwid: hwid || null,
          hwidChangeCount: 0,
          lastHwidChangeDate: null,
        };

        await adminDb.collection("users").doc(firebaseUser.uid).set(userDoc);

        return NextResponse.json({
          success: true,
          message: "User created successfully",
          uid: firebaseUser.uid,
        });
      }

      default:
        return NextResponse.json({ error: "Unknown action" }, { status: 400 });
    }
  } catch (error) {
    console.error("Admin action error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
