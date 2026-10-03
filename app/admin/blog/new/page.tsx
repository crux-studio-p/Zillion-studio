"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Image as ImageIcon, Check } from "lucide-react";
import { createPost } from "@/lib/actions/blog.actions";

export default function NewBlogPostPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [category, setCategory] = useState("Updates");
  const [status, setStatus] = useState("Draft");
  const [content, setContent] = useState("");
  const [featuredImage, setFeaturedImage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Auto-generate slug from title if user hasn't typed a custom one
  useEffect(() => {
    if (title && !slug) {
      setSlug(title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, ""));
    }
  }, [title]);

  const handleSave = async (forceStatus?: "Draft" | "Published") => {
    if (!title || !slug || !content) {
      setError("Title, Slug, and Content are required.");
      return;
    }
    
    setIsLoading(true);
    setError("");

    try {
      const finalStatus = forceStatus || (status as "Draft" | "Published");
      const result = await createPost({
        title,
        slug,
        category,
        status: finalStatus,
        content,
        featuredImage: featuredImage || null,
      });

      if (result.success) {
        router.push("/admin/blog");
      } else {
        setError("Failed to save post.");
      }
    } catch (err) {
      console.error(err);
      setError("An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-6xl space-y-8 pb-20">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/5 pb-6">
        <div className="flex items-center gap-4">
          <Link href="/admin/blog" className="p-2 -ml-2 text-neutral-400 hover:text-white transition-colors rounded-lg hover:bg-white/5">
            <ArrowLeft size={18} />
          </Link>
          <div>
            <h1 className="text-[20px] font-semibold text-neutral-100 tracking-tight">Create New Post</h1>
            <p className="text-[13px] text-neutral-400 mt-1">Write and publish a new article to your blog.</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button 
            disabled={isLoading}
            onClick={() => handleSave("Draft")}
            className="px-4 py-2 text-[13px] font-semibold text-neutral-300 hover:text-white transition-colors disabled:opacity-50"
          >
            Save Draft
          </button>
          <button 
            disabled={isLoading}
            onClick={() => handleSave("Published")}
            className="flex items-center gap-2 bg-white text-black px-4 py-2 rounded-lg text-[13px] font-bold hover:bg-neutral-200 transition-colors shadow-sm disabled:opacity-50"
          >
            <Check size={16} strokeWidth={2.5} /> {isLoading ? "Saving..." : "Publish Post"}
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-500 px-4 py-3 rounded-xl text-sm font-medium">
          {error}
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Main Editor Area */}
        <div className="flex-1 space-y-6">
          <div className="space-y-2">
            <label className="text-[12px] font-semibold text-neutral-400 uppercase tracking-wider">Post Title</label>
            <input 
              type="text" 
              placeholder="e.g. Big Update: New Inventory UI Released"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-[#1c1c1c] border border-white/5 rounded-xl px-4 py-3 text-[15px] text-white placeholder:text-neutral-600 focus:outline-none focus:border-[#5cc8b8] transition-colors"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[12px] font-semibold text-neutral-400 uppercase tracking-wider">Content (Markdown)</label>
            <div className="bg-[#1c1c1c] border border-white/5 rounded-xl overflow-hidden focus-within:border-[#5cc8b8] transition-colors">
              <div className="flex items-center gap-2 border-b border-white/5 px-4 py-3 bg-white/[0.02]">
                <div className="text-[12px] font-medium text-neutral-500">
                  Markdown is supported. Use # for headings, ** for bold.
                </div>
              </div>
              <textarea 
                placeholder="Start writing your post here in markdown..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full bg-transparent p-4 min-h-[400px] text-[15px] leading-relaxed text-white placeholder:text-neutral-600 focus:outline-none resize-y font-mono"
              />
            </div>
          </div>
        </div>

        {/* Sidebar Settings */}
        <div className="w-full lg:w-[320px] space-y-6">
          {/* Post Settings */}
          <div className="bg-[#1c1c1c] border border-white/5 rounded-xl p-5 space-y-5 shadow-sm">
            <h3 className="text-[14px] font-semibold text-neutral-200">Post Settings</h3>
            
            <div className="space-y-2">
              <label className="text-[12px] font-medium text-neutral-400">URL Slug</label>
              <input 
                type="text" 
                placeholder="e.g. new-inventory-ui"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                className="w-full bg-black/40 border border-white/5 rounded-lg px-3 py-2.5 text-[13px] text-white placeholder:text-neutral-600 focus:outline-none focus:border-white/20 transition-colors"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[12px] font-medium text-neutral-400">Category</label>
              <select 
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-black/40 border border-white/5 rounded-lg px-3 py-2.5 text-[13px] text-white focus:outline-none focus:border-white/20 transition-colors appearance-none cursor-pointer"
              >
                <option value="Updates">Updates</option>
                <option value="Tutorials">Tutorials</option>
                <option value="Community">Community</option>
                <option value="Development">Development</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-[12px] font-medium text-neutral-400">Status</label>
              <select 
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full bg-black/40 border border-white/5 rounded-lg px-3 py-2.5 text-[13px] text-white focus:outline-none focus:border-white/20 transition-colors appearance-none cursor-pointer"
              >
                <option value="Draft">Draft</option>
                <option value="Published">Published</option>
              </select>
            </div>
          </div>

          {/* Featured Image */}
          <div className="bg-[#1c1c1c] border border-white/5 rounded-xl p-5 space-y-4 shadow-sm">
            <h3 className="text-[14px] font-semibold text-neutral-200">Featured Image URL</h3>
            <input 
                type="text" 
                placeholder="https://..."
                value={featuredImage}
                onChange={(e) => setFeaturedImage(e.target.value)}
                className="w-full bg-black/40 border border-white/5 rounded-lg px-3 py-2.5 text-[13px] text-white placeholder:text-neutral-600 focus:outline-none focus:border-white/20 transition-colors"
              />
              {featuredImage && (
                <div className="mt-4 rounded-lg overflow-hidden border border-white/10 aspect-video relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={featuredImage} alt="Preview" className="w-full h-full object-cover" />
                </div>
              )}
          </div>
        </div>
      </div>
    </div>
  );
}
