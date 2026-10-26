import { db } from "@/lib/db";
import { reviews } from "@/lib/db/schema";
import { desc } from "drizzle-orm";
import { Check, X, Star, Trash2 } from "lucide-react";
import { approveReview, toggleFeatured, deleteReview } from "@/lib/actions/review.actions";

export default async function ReviewsAdminPage() {
  const allReviews = await db.select().from(reviews).orderBy(desc(reviews.createdAt));

  return (
    <div className="max-w-6xl space-y-8 pb-20">
      <div>
        <h1 className="text-[20px] font-semibold text-neutral-100 tracking-tight">Reviews Manager</h1>
        <p className="text-[13px] text-neutral-400 mt-1">Moderate customer reviews submitted from the store.</p>
      </div>

      <div className="grid gap-4">
        {allReviews.length === 0 ? (
          <div className="bg-[#1c1c1c] border border-white/5 rounded-[14px] p-12 flex flex-col items-center justify-center text-center shadow-sm">
            <h3 className="text-[15px] font-semibold text-neutral-200">No reviews yet</h3>
            <p className="text-[13px] text-neutral-500 mt-1 mb-4">When customers submit reviews, they will appear here for moderation.</p>
          </div>
        ) : (
          allReviews.map((review) => (
            <div key={review.id} className="bg-[#1c1c1c] border border-white/5 rounded-[14px] p-5 flex flex-col md:flex-row gap-6 hover:border-white/10 transition-colors group shadow-sm">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-[15px] font-bold text-neutral-200">{review.name}</h3>
                  <div className="flex gap-0.5 text-yellow-400">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={12} fill={i < review.rating ? "currentColor" : "none"} className={i >= review.rating ? "text-neutral-700" : ""} />
                    ))}
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    review.status === "Approved" ? "bg-green-500/10 text-green-500" :
                    review.status === "Rejected" ? "bg-red-500/10 text-red-500" :
                    "bg-yellow-500/10 text-yellow-500"
                  }`}>
                    {review.status}
                  </span>
                  {review.featured && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-purple-500/10 text-purple-400 flex items-center gap-1">
                      <Star size={10} fill="currentColor" /> Featured
                    </span>
                  )}
                </div>
                
                <p className="text-[13.5px] text-neutral-400 leading-relaxed mb-3">"{review.text}"</p>
                <div className="text-[12px] text-neutral-500 font-medium">
                  Submitted {new Date(review.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  {review.tebexPackageId && ` • Product ID: ${review.tebexPackageId}`}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-row md:flex-col items-center justify-end gap-2 shrink-0 border-t border-white/5 pt-4 md:pt-0 md:border-t-0 md:border-l md:pl-6">
                
                {review.status !== "Approved" && (
                  <form action={approveReview.bind(null, review.id, "Approved")} className="w-full">
                    <button type="submit" className="w-full flex items-center justify-center gap-2 bg-green-500/10 hover:bg-green-500/20 text-green-500 px-4 py-2 rounded-lg text-[12px] font-bold transition-colors">
                      <Check size={14} strokeWidth={3} /> Approve
                    </button>
                  </form>
                )}

                {review.status !== "Rejected" && (
                  <form action={approveReview.bind(null, review.id, "Rejected")} className="w-full">
                    <button type="submit" className="w-full flex items-center justify-center gap-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 px-4 py-2 rounded-lg text-[12px] font-bold transition-colors">
                      <X size={14} strokeWidth={3} /> Reject
                    </button>
                  </form>
                )}

                {review.status === "Approved" && (
                  <form action={toggleFeatured.bind(null, review.id, !review.featured)} className="w-full">
                    <button type="submit" className={`w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-[12px] font-bold transition-colors ${
                      review.featured 
                        ? "bg-purple-500/20 text-purple-400 hover:bg-purple-500/30" 
                        : "bg-white/5 text-neutral-300 hover:bg-white/10"
                    }`}>
                      <Star size={14} fill={review.featured ? "currentColor" : "none"} /> {review.featured ? "Unfeature" : "Feature"}
                    </button>
                  </form>
                )}

                <form action={deleteReview.bind(null, review.id)} className="w-full mt-2">
                  <button type="submit" className="w-full flex items-center justify-center gap-2 bg-transparent text-neutral-500 hover:text-red-400 px-4 py-2 rounded-lg text-[12px] font-bold transition-colors">
                    <Trash2 size={14} /> Delete
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
