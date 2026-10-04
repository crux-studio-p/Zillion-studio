import { Plus, MoreVertical, Shield } from "lucide-react";

export default function UsersAdminPage() {
  return (
    <div className="max-w-6xl space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[20px] font-semibold text-neutral-100 tracking-tight">Users & Roles</h1>
          <p className="text-[13px] text-neutral-400 mt-1">Manage admin panel access and permissions.</p>
        </div>
        <button className="flex items-center gap-2 bg-card text-foreground px-4 py-2 rounded-lg text-[13px] font-semibold hover:bg-neutral-200 transition-colors">
          <Plus size={16} /> Invite User
        </button>
      </div>

      <div className="bg-[#1c1c1c] border border-white/5 rounded-[14px] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse whitespace-nowrap">
          <thead>
            <tr className="border-b border-white/5 text-[12px] font-medium text-muted-foreground bg-[#181818]">
              <th className="py-3 px-5 font-medium">User</th>
              <th className="py-3 px-5 font-medium">Email</th>
              <th className="py-3 px-5 font-medium">Role</th>
              <th className="py-3 px-5 font-medium">Status</th>
              <th className="py-3 px-5 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="text-[13px] text-neutral-300">
            <tr className="border-b border-white/5 hover:bg-white/5 transition-colors">
              <td className="py-3 px-5 font-medium text-neutral-200 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-neutral-800 flex items-center justify-center text-[10px] font-bold">SD</div>
                Sidak Dhingra (You)
              </td>
              <td className="py-3 px-5 text-neutral-400">sidak@zillion.studio</td>
              <td className="py-3 px-5">
                <span className="flex items-center gap-1.5 bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded-full text-[11px] font-medium w-fit">
                  <Shield size={12} /> Owner
                </span>
              </td>
              <td className="py-3 px-5 text-green-500 font-medium text-[12px]">Active</td>
              <td className="py-3 px-5 text-right">
                <button className="text-muted-foreground hover:text-white transition-colors">
                  <MoreVertical size={16} />
                </button>
              </td>
            </tr>
            <tr className="border-b border-white/5 hover:bg-white/5 transition-colors">
              <td className="py-3 px-5 font-medium text-neutral-200 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-neutral-800 flex items-center justify-center text-[10px] font-bold">SM</div>
                Staff Member
              </td>
              <td className="py-3 px-5 text-neutral-400">staff@untitled.com</td>
              <td className="py-3 px-5">
                <span className="bg-white/10 text-neutral-300 px-2 py-0.5 rounded-full text-[11px] font-medium w-fit">
                  Moderator
                </span>
              </td>
              <td className="py-3 px-5 text-muted-foreground text-[12px]">Invited</td>
              <td className="py-3 px-5 text-right">
                <button className="text-muted-foreground hover:text-white transition-colors">
                  <MoreVertical size={16} />
                </button>
              </td>
            </tr>
          </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
