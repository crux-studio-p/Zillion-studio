"use client";

import { useState } from "react";
import { Check, X, Search, Eye } from "lucide-react";
import { updateApplicationStatus } from "@/lib/actions/affiliate.actions";

export function AffiliatesTable({ applications }: { applications: any[] }) {
  const [selectedApp, setSelectedApp] = useState<any | null>(null);

  const handleUpdateStatus = async (id: string, status: "Approved" | "Rejected", email: string) => {
    const result = await updateApplicationStatus(id, status, email);
    if (!result.success) {
      alert(`Failed to ${status.toLowerCase()} application:\n${result.error}`);
    } else {
      if (selectedApp?.id === id) setSelectedApp(null);
    }
  };

  return (
    <>
      <div className="bg-[#1c1c1c] border border-white/5 rounded-[14px] overflow-hidden shadow-sm">
        <div className="p-4 border-b border-white/5 flex items-center justify-between bg-[#181818]">
          <div className="flex gap-2">
            <button className="bg-white/10 text-white px-3 py-1 rounded-md text-[12px] font-medium">All Applications</button>
          </div>
          <div className="flex items-center gap-2 bg-[#141414] border border-white/10 rounded-lg px-3 py-1.5 w-64">
            <Search size={14} className="text-muted-foreground" />
            <input type="text" placeholder="Search applicants..." className="bg-transparent border-none outline-none text-[13px] text-neutral-200 placeholder:text-neutral-600 w-full" />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse whitespace-nowrap">
          <thead>
            <tr className="border-b border-white/5 text-[12px] font-medium text-muted-foreground bg-[#181818]">
              <th className="py-3 px-5 font-medium">Applicant</th>
              <th className="py-3 px-5 font-medium">Platform</th>
              <th className="py-3 px-5 font-medium">Audience Size</th>
              <th className="py-3 px-5 font-medium">Applied</th>
              <th className="py-3 px-5 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="text-[13px] text-neutral-300">
            {applications.map((app) => (
              <tr key={app.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                <td className="py-3 px-5 font-medium text-neutral-200">
                  <div className="flex items-center gap-2 mb-1">
                    {app.discordName}
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                      app.status === 'Approved' ? 'bg-green-500/10 text-green-500' : 
                      app.status === 'Rejected' ? 'bg-red-500/10 text-red-500' : 'bg-neutral-800 text-neutral-400'
                    }`}>
                      {app.status}
                    </span>
                  </div>
                  <div className="text-[11px] text-muted-foreground font-normal">{app.email}</div>
                </td>
                <td className="py-3 px-5 text-neutral-400">{app.communityName || "-"}</td>
                <td className="py-3 px-5">{app.reach || "-"}</td>
                <td className="py-3 px-5 text-muted-foreground">
                  {app.createdAt.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                </td>
                <td className="py-3 px-5 text-right">
                  <div className="flex justify-end gap-3">
                    <button 
                      onClick={() => setSelectedApp(app)}
                      className="bg-white/5 text-neutral-300 px-3 py-1.5 rounded text-[11px] font-medium hover:bg-white/10 transition-colors" 
                    >
                      View Details
                    </button>
                    {app.status === "Pending" && (
                      <>
                        <button 
                          onClick={() => handleUpdateStatus(app.id, "Approved", app.email)}
                          className="bg-[#5cc8b8]/10 text-[#5cc8b8] px-3 py-1.5 rounded text-[11px] font-medium hover:bg-[#5cc8b8]/20 transition-colors" 
                        >
                          Approve
                        </button>
                        <button 
                          onClick={() => handleUpdateStatus(app.id, "Rejected", app.email)}
                          className="bg-red-500/10 text-red-500 px-3 py-1.5 rounded text-[11px] font-medium hover:bg-red-500/20 transition-colors" 
                        >
                          Reject
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {applications.length === 0 && (
              <tr>
                <td colSpan={5} className="py-12 text-center text-muted-foreground">
                  No applications found.
                </td>
              </tr>
            )}
          </tbody>
          </table>
        </div>
      </div>

      {/* Modal Popup */}
      {selectedApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setSelectedApp(null)}>
          <div className="bg-[#1c1c1c] border border-white/10 rounded-2xl p-6 max-w-2xl w-full max-h-[85vh] overflow-y-auto shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-xl font-semibold text-white">Application Details</h2>
                <p className="text-sm text-neutral-400 mt-1">Submitted on {selectedApp.createdAt.toLocaleDateString()}</p>
              </div>
              <button onClick={() => setSelectedApp(null)} className="text-neutral-400 hover:text-white p-1 rounded-md transition-colors bg-white/5 hover:bg-white/10">
                <X size={18} />
              </button>
            </div>

            <div className="space-y-5 text-sm">
              <div className="grid grid-cols-2 gap-4 bg-white/5 p-4 rounded-xl border border-white/5">
                <div>
                  <div className="text-neutral-500 mb-1 font-medium">Discord Name</div>
                  <div className="text-neutral-200">{selectedApp.discordName}</div>
                </div>
                <div>
                  <div className="text-neutral-500 mb-1 font-medium">Email</div>
                  <div className="text-neutral-200">{selectedApp.email}</div>
                </div>
                <div>
                  <div className="text-neutral-500 mb-1 font-medium">Community Name</div>
                  <div className="text-neutral-200">{selectedApp.communityName || "-"}</div>
                </div>
                <div>
                  <div className="text-neutral-500 mb-1 font-medium">Audience Reach</div>
                  <div className="text-neutral-200">{selectedApp.reach || "-"}</div>
                </div>
                <div>
                  <div className="text-neutral-500 mb-1 font-medium">Coupon Split</div>
                  <div className="text-neutral-200">{selectedApp.couponSplit}</div>
                </div>
                <div>
                  <div className="text-neutral-500 mb-1 font-medium">Pref. Code Name</div>
                  <div className="text-neutral-200">{selectedApp.preferredCodeName || "-"}</div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <div className="text-neutral-500 mb-1.5 font-medium">Social / Store Links</div>
                  <div className="text-neutral-200 bg-black/40 p-3 rounded-lg border border-white/5 break-words">
                    {selectedApp.socialLinks}
                  </div>
                </div>
                <div>
                  <div className="text-neutral-500 mb-1.5 font-medium">Wallet ID</div>
                  <div className="text-neutral-200 bg-black/40 p-3 rounded-lg border border-white/5 break-words">
                    {selectedApp.walletId}
                  </div>
                </div>
                <div>
                  <div className="text-neutral-500 mb-1.5 font-medium">Reselling Experience</div>
                  <div className="text-neutral-200 bg-black/40 p-3 rounded-lg border border-white/5 whitespace-pre-wrap">
                    {selectedApp.experience}
                  </div>
                </div>
                <div>
                  <div className="text-neutral-500 mb-1.5 font-medium">Why Resell Zillion?</div>
                  <div className="text-neutral-200 bg-black/40 p-3 rounded-lg border border-white/5 whitespace-pre-wrap">
                    {selectedApp.whyResell}
                  </div>
                </div>
                {selectedApp.additionalInfo && (
                  <div>
                    <div className="text-neutral-500 mb-1.5 font-medium">Additional Info</div>
                    <div className="text-neutral-200 bg-black/40 p-3 rounded-lg border border-white/5 whitespace-pre-wrap">
                      {selectedApp.additionalInfo}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {selectedApp.status === "Pending" && (
              <div className="flex gap-3 mt-8 pt-6 border-t border-white/10">
                <button 
                  onClick={() => handleUpdateStatus(selectedApp.id, "Approved", selectedApp.email)}
                  className="flex-1 bg-[#5cc8b8] text-black font-medium py-2.5 rounded-lg hover:bg-[#4eb3a3] transition-colors"
                >
                  Approve Application
                </button>
                <button 
                  onClick={() => handleUpdateStatus(selectedApp.id, "Rejected", selectedApp.email)}
                  className="flex-1 border border-red-500/30 text-red-400 font-medium py-2.5 rounded-lg hover:bg-red-500/10 transition-colors"
                >
                  Reject
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
