"use server";

import { db } from "@/lib/db";
import { reviews } from "@/lib/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function submitReview(data: typeof reviews.$inferInsert) {
  // Public action
  const result = await db.insert(reviews).values(data).returning();
  // We don't revalidate aggressively immediately since it needs approval to be visible anyway
  return { success: true, review: result[0] };
}

export async function approveReview(id: string, status: "Approved" | "Rejected") {
  const result = await db.update(reviews).set({ status }).where(eq(reviews.id, id)).returning();
  revalidatePath("/admin/reviews");
  if (result[0]?.tebexPackageId) {
    revalidatePath(`/store/${result[0].tebexPackageId}`);
  }
  revalidatePath("/");
}

export async function toggleFeatured(id: string, featured: boolean) {
  await db.update(reviews).set({ featured }).where(eq(reviews.id, id)).returning();
  revalidatePath("/admin/reviews");
  revalidatePath("/");
}

export async function deleteReview(id: string) {
  const result = await db.delete(reviews).where(eq(reviews.id, id)).returning();
  revalidatePath("/admin/reviews");
  if (result[0]?.tebexPackageId) {
    revalidatePath(`/store/${result[0].tebexPackageId}`);
  }
  revalidatePath("/");
}

export async function getApprovedReviews(tebexPackageId: string) {
  return await db
    .select()
    .from(reviews)
    .where(
      and(
        eq(reviews.tebexPackageId, tebexPackageId),
        eq(reviews.status, "Approved")
      )
    )
    .orderBy(desc(reviews.createdAt));
}
