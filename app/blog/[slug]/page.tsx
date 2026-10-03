import { db } from "@/lib/db";
import { blogPosts } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { BlogArticleClient } from "./BlogArticleClient";

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await db.select().from(blogPosts).where(eq(blogPosts.slug, slug)).limit(1);

  if (!post.length) {
    notFound();
  }

  return <BlogArticleClient post={post[0]} />;
}
