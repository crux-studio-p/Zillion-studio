import { Plus, Edit2, Trash2, Globe } from "lucide-react";
import Link from "next/link";
import { db } from "@/lib/db";
import { blogPosts } from "@/lib/db/schema";
import { desc } from "drizzle-orm";
import { deletePost, publishPost } from "@/lib/actions/blog.actions";

export default async function BlogAdminPage() {
  const posts = await db.select().from(blogPosts).orderBy(desc(blogPosts.createdAt));

  return (
    <div className="max-w-6xl space-y-8 pb-20">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[20px] font-semibold text-neutral-100 tracking-tight">Blog Manager</h1>
          <p className="text-[13px] text-neutral-400 mt-1">Create and manage content for the storefront blog.</p>
        </div>
        <Link 
          href="/admin/blog/new"
          className="flex items-center gap-2 bg-white text-black px-4 py-2 rounded-lg text-[13px] font-bold hover:bg-neutral-200 transition-colors shadow-sm"
        >
          <Plus size={16} strokeWidth={2.5} /> New Post
        </Link>
      </div>

      <div className="grid gap-4">
        {posts.length === 0 ? (
          <div className="bg-[#1c1c1c] border border-white/5 rounded-[14px] p-12 flex flex-col items-center justify-center text-center shadow-sm">
            <h3 className="text-[15px] font-semibold text-neutral-200">No blog posts yet</h3>
            <p className="text-[13px] text-neutral-500 mt-1 mb-4">You haven't written any articles for the store.</p>
            <Link 
              href="/admin/blog/new"
              className="bg-white/10 text-white px-4 py-2 rounded-lg text-[12px] font-medium hover:bg-white/20 transition-colors"
            >
              Write your first post
            </Link>
          </div>
        ) : (
          posts.map((post) => (
            <div key={post.id} className="bg-[#1c1c1c] border border-white/5 rounded-[14px] p-5 flex items-center justify-between hover:border-white/10 transition-colors group shadow-sm">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h3 className="text-[14px] font-semibold text-neutral-200">{post.title}</h3>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    post.status === "Published" ? "bg-green-500/10 text-green-500" : "bg-neutral-800 text-neutral-400"
                  }`}>
                    {post.status}
                  </span>
                </div>
                <p className="text-[12px] text-muted-foreground">
                  {post.createdAt.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })} • /{post.slug}
                </p>
              </div>
              
              <div className="flex items-center gap-2 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                {post.status === "Draft" && (
                  <form action={async () => {
                    "use server";
                    await publishPost(post.id);
                  }}>
                    <button type="submit" title="Publish" className="p-2 text-neutral-400 hover:text-[#5cc8b8] transition-colors">
                      <Globe size={16} />
                    </button>
                  </form>
                )}
                <Link href={`/admin/blog/${post.id}`} title="Edit" className="p-2 text-neutral-400 hover:text-white transition-colors">
                  <Edit2 size={16} />
                </Link>
                <form action={async () => {
                  "use server";
                  await deletePost(post.id);
                }}>
                  <button type="submit" title="Delete" className="p-2 text-neutral-400 hover:text-red-500 transition-colors">
                    <Trash2 size={16} />
                  </button>
                </form>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
