import { db } from "@/lib/db";
import { blogPosts } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { EditBlogForm } from "./EditBlogForm";

export default async function EditPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const post = await db.select().from(blogPosts).where(eq(blogPosts.id, id)).limit(1);

  if (!post.length) {
    notFound();
  }

  return <EditBlogForm post={post[0]} />;
}
