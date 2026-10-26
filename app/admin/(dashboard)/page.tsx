import { MessageSquare, Users, MoreVertical, Search, Plus } from "lucide-react";
import { db } from "@/lib/db";
import { reviews, affiliateApplications } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import Link from "next/link";

export default async function AdminDashboard() {
  const pendingReviews = await db.select().from(reviews).where(eq(reviews.status, "Pending")).orderBy(desc(reviews.createdAt));
  const pendingAffiliates = await db.select().from(affiliateApplications).where(eq(affiliateApplications.status, "Pending")).orderBy(desc(affiliateApplications.createdAt));

  const allReviews = await db.select().from(reviews).orderBy(desc(reviews.createdAt)).limit(5);
  const allAffiliates = await db.select().from(affiliateApplications).orderBy(desc(affiliateApplications.createdAt)).limit(5);

  const activities = [
    ...allReviews.map(r => ({ type: 'review' as const, date: r.createdAt, data: r })),
    ...allAffiliates.map(a => ({ type: 'affiliate' as const, date: a.createdAt, data: a }))
  ].sort((a, b) => b.date.getTime() - a.date.getTime()).slice(0, 10);

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
        <h2 className="text-[14px] font-semibold text-neutral-100">Recent activity</h2>
        
        {/* Tabs and Search */}
        <div className="flex items-center justify-between border-b border-white/5 pb-[13px]">
          <div className="flex items-center gap-5 text-[13px] font-medium text-muted-foreground overflow-x-auto whitespace-nowrap no-scrollbar pr-4">
            <button className="text-neutral-200 relative">
              All
              <span className="absolute -bottom-[14px] left-0 right-0 h-[2px] bg-neutral-200 rounded-t-full"></span>
            </button>
            <button className="hover:text-neutral-300 transition-colors">Reviews</button>
            <button className="hover:text-neutral-300 transition-colors">Affiliates</button>
          </div>
          <div className="relative hidden md:block shrink-0">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="Search activity..." 
              className="bg-transparent border border-white/10 rounded-[8px] pl-9 pr-4 py-1.5 text-[13px] text-neutral-200 focus:outline-none focus:border-white/20 placeholder:text-neutral-600 w-[180px] transition-colors"
            />
          </div>
        </div>

        {activities.length === 0 ? (
          <div className="bg-[#181818] border border-white/5 rounded-2xl p-12 flex flex-col items-center justify-center min-h-[300px] shadow-sm">
            <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center text-neutral-400 mb-4 border border-white/10">
              <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-[15px] font-semibold text-neutral-200 mb-1.5">No recent activity</h3>
            <p className="text-[13px] text-muted-foreground max-w-xs text-center leading-relaxed">
              When customers submit reviews or affiliate applications, they will appear here.
            </p>
          </div>
        ) : (
          <div className="bg-[#1c1c1c] border border-white/5 rounded-[14px] overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse whitespace-nowrap">
                <thead>
                  <tr className="border-b border-white/5 text-[12px] font-medium text-muted-foreground bg-[#181818]">
                    <th className="py-3 px-5 font-medium">Event</th>
                    <th className="py-3 px-5 font-medium">Source</th>
                    <th className="py-3 px-5 font-medium">Status</th>
                    <th className="py-3 px-5 font-medium text-right">Date</th>
                  </tr>
                </thead>
                <tbody className="text-[13px] text-neutral-300">
                  {activities.map((item, idx) => (
                    <tr key={idx} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                      <td className="py-3 px-5 font-medium text-neutral-200 flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-neutral-800 flex items-center justify-center text-[10px] font-bold text-neutral-300 uppercase shrink-0">
                          {item.type === 'review' ? (item.data as any).name.substring(0,2) : (item.data as any).discordName.substring(0,2)}
                        </div>
                        <div>
                          <div>{item.type === 'review' ? `Review from ${(item.data as any).name}` : `Affiliate App from ${(item.data as any).discordName}`}</div>
                          <div className="text-[11px] text-muted-foreground font-normal">
                            {item.type === 'review' ? 'Product Review' : 'Partnership Request'}
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-5 text-neutral-400">
                        {item.type === 'review' ? 'Storefront' : 'Affiliate Form'}
                      </td>
                      <td className="py-3 px-5">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          (item.data as any).status === 'Approved' ? 'bg-green-500/10 text-green-500' : 
                          (item.data as any).status === 'Rejected' ? 'bg-red-500/10 text-red-500' : 'bg-yellow-500/10 text-yellow-500'
                        }`}>
                          {(item.data as any).status}
                        </span>
                      </td>
                      <td className="py-3 px-5 text-right text-muted-foreground">
                        {item.date.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
