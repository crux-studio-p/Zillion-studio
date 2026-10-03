"use server";

import { db } from "@/lib/db";
import { blogPosts } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function createPost(data: typeof blogPosts.$inferInsert) {
  const result = await db.insert(blogPosts).values(data).returning();
  revalidatePath("/admin/blog");
  revalidatePath("/blog");
  return { success: true, post: result[0] };
}

export async function updatePost(id: string, data: Partial<typeof blogPosts.$inferInsert>) {
  const result = await db.update(blogPosts).set(data).where(eq(blogPosts.id, id)).returning();
  revalidatePath("/admin/blog");
  if (data.slug) {
    revalidatePath(`/blog/${data.slug}`);
  }
  revalidatePath("/blog");
  return { success: true, post: result[0] };
}

export async function deletePost(id: string) {
  await db.delete(blogPosts).where(eq(blogPosts.id, id));
  revalidatePath("/admin/blog");
  revalidatePath("/blog");
  return { success: true };
}

export async function publishPost(id: string) {
  const result = await db.update(blogPosts).set({ status: "Published" }).where(eq(blogPosts.id, id)).returning();
  revalidatePath("/admin/blog");
  revalidatePath("/blog");
  return { success: true, post: result[0] };
}
