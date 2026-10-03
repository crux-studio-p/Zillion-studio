import { db } from "@/lib/db";
import { blogPosts } from "@/lib/db/schema";
import { desc, eq } from "drizzle-orm";
import { BlogClientWrapper } from "./BlogClientWrapper";

export const revalidate = 60; // Optional cache revalidation

export default async function BlogPage() {
  const posts = await db.select().from(blogPosts).where(eq(blogPosts.status, "Published")).orderBy(desc(blogPosts.createdAt));
  
  return <BlogClientWrapper posts={posts} />;
}
