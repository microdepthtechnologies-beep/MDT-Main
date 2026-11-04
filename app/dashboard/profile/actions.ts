"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { getDb } from "@/lib/mongodb";
import type { ProfileResult } from "@/lib/dashboard-types";

export async function saveProfile(form: FormData): Promise<ProfileResult> {
  const session = await auth();
  if (!session?.user?.email) return { ok: false, message: "Please sign in again before saving your profile." };
  const name = String(form.get("name") || "").trim();
  const company = String(form.get("company") || "").trim();
  const phone = String(form.get("phone") || "").trim();
  if (name.length < 2 || name.length > 120 || company.length > 160 || phone.length > 40) {
    return { ok: false, message: "Enter a name of 2–120 characters and check your contact details." };
  }
  try {
    const db = await getDb();
    const result = await db.collection("accounts").updateOne(
      { email: session.user.email },
      { $set: { name, company, phone, updatedAt: new Date() } },
    );
    if (!result.matchedCount) return { ok: false, message: "We couldn’t find your account. Please contact our team." };
  } catch {
    return { ok: false, message: "We couldn’t save your details. Please try again." };
  }
  revalidatePath("/dashboard", "layout");
  return { ok: true, message: "Your profile has been saved." };
}
