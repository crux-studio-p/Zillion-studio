"use server";

import { db } from "@/lib/db";
import { affiliateApplications } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function submitApplication(data: typeof affiliateApplications.$inferInsert) {
  // Public action
  const result = await db.insert(affiliateApplications).values(data).returning();
  return { success: true, application: result[0] };
}

export async function updateApplicationStatus(id: string, status: "Approved" | "Rejected", email: string) {
  try {
    let emailResponse;

    if (status === "Approved") {
      emailResponse = await resend.emails.send({
        from: "Zillion Studios <onboarding@resend.dev>", 
        to: [email],
        subject: "Welcome to the Zillion Studios Affiliate Program!",
        html: "<p>Congratulations! Your affiliate application has been approved.</p><p>Please log into your dashboard to get your referral link.</p>"
      });
    } else if (status === "Rejected") {
      emailResponse = await resend.emails.send({
        from: "Zillion Studios <onboarding@resend.dev>",
        to: [email],
        subject: "Update on your Zillion Studios Affiliate Application",
        html: "<p>Thank you for applying. Unfortunately, we cannot accept your application at this time.</p>"
      });
    }

    if (emailResponse?.error) {
      console.error("[Resend API Error]:", emailResponse.error);
      return { success: false, error: emailResponse.error.message };
    }

    // Email succeeded (or no error returned), now update DB
    const result = await db.update(affiliateApplications).set({ status }).where(eq(affiliateApplications.id, id)).returning();
    
    revalidatePath("/admin/affiliates");
    return { success: true, application: result[0] };
  } catch (e: any) {
    console.error("Failed to process:", e);
    return { success: false, error: e.message || "Unknown error occurred while processing application." };
  }
}
