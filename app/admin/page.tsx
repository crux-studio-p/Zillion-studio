import { MessageSquare, Users, MoreVertical, Search, Plus } from "lucide-react";
import { db } from "@/lib/db";
import { reviews, affiliateApplications } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import Link from "next/link";

export default async function AdminDashboard() {
  const pendingReviews = await db.select().from(reviews).where(eq(reviews.status, "Pending")).orderBy(desc(reviews.createdAt));
  const pendingAffiliates = await db.select().from(affiliateApplications).where(eq(affiliateApplications.status, "Pending")).orderBy(desc(affiliateApplications.createdAt));
  return (
    <div className="max-w-4xl space-y-10">
      <div>
        <h1 className="text-[20px] font-semibold text-neutral-100 tracking-tight">All modules</h1>
      </div>

      <div className="space-y-4">
        <h2 className="text-[14px] font-semibold text-neutral-100">Action needed</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Card 1: Reviews */}
          <Link href="/admin/reviews" className="bg-[#1c1c1c] border border-white/5 rounded-[14px] p-5 flex flex-col justify-between hover:bg-[#202020] transition-colors cursor-pointer group shadow-sm">
            <div className="flex justify-between items-start">
              <div className="w-12 h-9 bg-white/5 rounded-lg flex items-center justify-center text-neutral-300">
                <MessageSquare size={18} strokeWidth={2} />
              </div>
            </div>
            <div className="mt-6 flex justify-between items-center">
              <div>
                <h3 className="text-[14px] font-semibold text-neutral-200">Reviews</h3>
                <p className="text-[13px] text-muted-foreground mt-0.5">{pendingReviews.length} pending</p>
              </div>
              <div className="flex -space-x-1.5">
                {pendingReviews.slice(0, 2).map((r) => (
                  <div key={r.id} className="w-[26px] h-[26px] rounded-full border-[2px] border-[#1c1c1c] bg-neutral-800 flex items-center justify-center text-[9px] text-neutral-300 font-bold uppercase overflow-hidden">
                    {r.name.substring(0, 2)}
                  </div>
                ))}
                {pendingReviews.length > 2 && (
                  <div className="w-[26px] h-[26px] rounded-full border-[2px] border-[#1c1c1c] bg-neutral-700 flex items-center justify-center text-[9px] text-neutral-300 font-medium">+{pendingReviews.length - 2}</div>
                )}
              </div>
            </div>
          </Link>

          {/* Card 2: Affiliates */}
          <Link href="/admin/affiliates" className="bg-[#1c1c1c] border border-white/5 rounded-[14px] p-5 flex flex-col justify-between hover:bg-[#202020] transition-colors cursor-pointer group shadow-sm">
            <div className="flex justify-between items-start">
              <div className="w-12 h-9 bg-white/5 rounded-lg flex items-center justify-center text-neutral-300">
                <Users size={18} strokeWidth={2} />
              </div>
            </div>
            <div className="mt-6 flex justify-between items-center">
              <div>
                <h3 className="text-[14px] font-semibold text-neutral-200">Affiliate Queue</h3>
                <p className="text-[13px] text-muted-foreground mt-0.5">{pendingAffiliates.length} applications</p>
              </div>
              <div className="flex -space-x-1.5">
                {pendingAffiliates.slice(0, 2).map((a) => (
                  <div key={a.id} className="w-[26px] h-[26px] rounded-full border-[2px] border-[#1c1c1c] bg-neutral-800 flex items-center justify-center text-[9px] text-neutral-300 font-bold uppercase overflow-hidden">
                    {a.discordName.substring(0, 2)}
                  </div>
                ))}
                {pendingAffiliates.length > 2 && (
                  <div className="w-[26px] h-[26px] rounded-full border-[2px] border-[#1c1c1c] bg-neutral-700 flex items-center justify-center text-[9px] text-neutral-300 font-medium">+{pendingAffiliates.length - 2}</div>
                )}
              </div>
            </div>
          </Link>
        </div>
      </div>

      <div className="space-y-6 pt-4">
        <h2 className="text-[14px] font-semibold text-neutral-100">All activity</h2>
        
        {/* Tabs and Search */}
        <div className="flex items-center justify-between border-b border-white/5 pb-[13px]">
          <div className="flex items-center gap-5 text-[13px] font-medium text-muted-foreground">
            <button className="text-neutral-200 relative">
              View all
              <span className="absolute -bottom-[14px] left-0 right-0 h-[2px] bg-neutral-200 rounded-t-full"></span>
            </button>
            <button className="hover:text-neutral-300 transition-colors">Recent</button>
            <button className="hover:text-neutral-300 transition-colors">Favorites</button>
            <button className="hover:text-neutral-300 transition-colors">Shared</button>
            <button className="hover:text-neutral-300 transition-colors">Archived</button>
          </div>
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="Search..." 
              className="bg-transparent border border-white/10 rounded-[8px] pl-9 pr-4 py-1.5 text-[13px] text-neutral-200 focus:outline-none focus:border-white/20 placeholder:text-neutral-600 w-[180px] transition-colors"
            />
          </div>
        </div>

        {/* Empty State */}
        <div className="bg-[#181818] border border-white/5 rounded-2xl p-12 flex flex-col items-center justify-center min-h-[440px]">
          
          <div className="relative mb-6">
            <div className="w-[72px] h-[52px] bg-gradient-to-b from-[#e0e0e0] to-[#b3b3b3] rounded-lg shadow-xl relative z-10 flex items-center justify-center border-t border-white/60">
              <svg viewBox="0 0 24 24" className="w-6 h-6 text-neutral-800" fill="currentColor">
                <path d="M12 2l-9 4.5v11L12 22l9-4.5v-11L12 2zm0 2.4l6.4 3.2-2.1 1.1-6.4-3.2 2.1-1.1zm-7 4.7l6 3v7.3l-6-3V9.1zm7.5 10.3v-7.3l6-3v7.3l-6 3z" />
              </svg>
            </div>
            <div className="absolute -top-2 w-[52px] left-2.5 h-6 bg-white/20 rounded-t-md z-0"></div>
          </div>

          <h3 className="text-[15px] font-semibold text-neutral-200 mb-1.5">No projects found</h3>
          <p className="text-[13px] text-muted-foreground max-w-xs text-center leading-relaxed mb-6">
            Your search "Hardware 2.0" did not match any projects. Please try again.
          </p>
          <div className="flex items-center gap-3">
            <button className="px-4 py-2 bg-transparent border border-white/10 text-neutral-300 rounded-[8px] text-[13px] font-medium hover:bg-white/5 transition-colors">
              Clear search
            </button>
            <button className="px-4 py-2 bg-[#2a2a2a] border border-white/5 text-neutral-200 rounded-[8px] text-[13px] font-medium hover:bg-[#333] transition-colors flex items-center gap-2 shadow-sm">
              <Plus size={16} />
              New project
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
