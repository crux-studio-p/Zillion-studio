"use client";

import { useState, useTransition } from "react";
import { 
  Search, 
  Shield, 
  Trash2, 
  UserPlus, 
  MoreVertical, 
  Check, 
  Calendar,
  AlertTriangle
} from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { 
  AdminUserListItem, 
  AdminUserRole, 
  updateUserRoleAction, 
  deleteAdminUserAction 
} from "@/lib/actions/user.actions";
import { InviteUserModal } from "./InviteUserModal";

interface UsersTableProps {
  users: AdminUserListItem[];
  currentUserId: string;
  currentUserRole: string;
}

const ROLE_BADGES: Record<AdminUserRole, { label: string; color: string }> = {
  SuperAdmin: { label: "SuperAdmin", color: "bg-purple-500/10 text-purple-400 border-purple-500/20" },
  Admin: { label: "Admin", color: "bg-blue-500/10 text-blue-400 border-blue-500/20" },
  Editor: { label: "Editor", color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" },
  Support: { label: "Support", color: "bg-amber-500/10 text-amber-400 border-amber-500/20" },
  Developer: { label: "Developer", color: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20" },
};

export function UsersTable({ users, currentUserId, currentUserRole }: UsersTableProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const isSuperAdmin = currentUserRole === "SuperAdmin";

  const filteredUsers = users.filter((u) => {
    const q = searchQuery.toLowerCase();
    return (
      u.email.toLowerCase().includes(q) ||
      (u.name && u.name.toLowerCase().includes(q)) ||
      u.role.toLowerCase().includes(q)
    );
  });

  const handleRoleChange = (userId: string, newRole: AdminUserRole) => {
    startTransition(async () => {
      const res = await updateUserRoleAction({ userId, role: newRole });
      if (res.success) {
        toast.success(`Role updated to ${newRole}`);
        router.refresh();
      } else {
        toast.error(res.error || "Failed to update role");
      }
    });
  };

  const handleDelete = (userId: string, email: string) => {
    if (!confirm(`Are you sure you want to revoke access for ${email}?`)) return;

    startTransition(async () => {
      const res = await deleteAdminUserAction({ userId });
      if (res.success) {
        toast.success(`Access revoked for ${email}`);
        router.refresh();
      } else {
        toast.error(res.error || "Failed to delete user");
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Invite Button */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-[20px] font-semibold text-neutral-100 tracking-tight flex items-center gap-2">
            <Shield size={20} className="text-primary" /> Users & Access Control
          </h1>
          <p className="text-[13px] text-neutral-400 mt-1">
            Manage admin panel team members, credentials, and access roles.
          </p>
        </div>

        {(isSuperAdmin || currentUserRole === "Admin") && (
          <button
            onClick={() => setIsInviteOpen(true)}
            className="flex items-center gap-2 bg-primary text-primary-foreground font-semibold px-4 py-2 rounded-xl text-[13px] shadow-sm hover:opacity-95 transition-opacity"
          >
            <UserPlus size={15} /> Invite Team Member
          </button>
        )}
      </div>

      {/* Search Bar */}
      <div className="bg-[#181818] border border-white/5 p-3 rounded-2xl flex items-center gap-2 max-w-md">
        <Search size={15} className="text-neutral-500 ml-1.5 shrink-0" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by name, email or role..."
          className="bg-transparent border-none outline-none text-[13px] text-neutral-200 placeholder:text-neutral-500 w-full"
        />
      </div>

      {/* Users Table */}
      <div className="bg-[#1c1c1c] border border-white/5 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead>
              <tr className="border-b border-white/5 text-[12px] font-medium text-neutral-400 bg-[#161616]">
                <th className="py-3.5 px-5 font-semibold">User</th>
                <th className="py-3.5 px-5 font-semibold">Email</th>
                <th className="py-3.5 px-5 font-semibold">Role</th>
                <th className="py-3.5 px-5 font-semibold">Created</th>
                <th className="py-3.5 px-5 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="text-[13px] text-neutral-300 divide-y divide-white/5">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-neutral-500">
                    No users found matching your search.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => {
                  const isSelf = u.id === currentUserId;
                  const initials = (u.name || u.email)
                    .split(" ")
                    .map((w) => w[0])
                    .join("")
                    .slice(0, 2)
                    .toUpperCase();
                  const badge = ROLE_BADGES[u.role] || ROLE_BADGES.Support;

                  return (
                    <tr key={u.id} className="hover:bg-white/[0.02] transition-colors">
                      {/* Name & Avatar */}
                      <td className="py-3.5 px-5 font-medium text-neutral-200">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-neutral-800 border border-white/10 shrink-0 flex items-center justify-center text-[11px] font-bold text-neutral-200">
                            {initials}
                          </div>
                          <div>
                            <div className="font-semibold text-neutral-100 flex items-center gap-2">
                              <span>{u.name || "Admin"}</span>
                              {isSelf && (
                                <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
                                  You
                                </span>
                              )}
                            </div>
                            <span className="text-[11px] text-neutral-500">
                              {u.hasPassword ? "Password active" : "Pending password setup"}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Email */}
                      <td className="py-3.5 px-5 text-neutral-400 font-mono text-[12.5px]">
                        {u.email}
                      </td>

                      {/* Role */}
                      <td className="py-3.5 px-5">
                        {isSuperAdmin && !isSelf ? (
                          <select
                            value={u.role}
                            onChange={(e) => handleRoleChange(u.id, e.target.value as AdminUserRole)}
                            disabled={isPending}
                            className={`px-2.5 py-1 rounded-lg text-[11.5px] font-semibold border bg-[#141414] cursor-pointer outline-none transition-colors ${badge.color}`}
                          >
                            <option value="SuperAdmin">SuperAdmin</option>
                            <option value="Admin">Admin</option>
                            <option value="Editor">Editor</option>
                            <option value="Support">Support</option>
                            <option value="Developer">Developer</option>
                          </select>
                        ) : (
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${badge.color}`}
                          >
                            <Shield size={10} /> {u.role}
                          </span>
                        )}
                      </td>

                      {/* Created Date */}
                      <td className="py-3.5 px-5 text-[12px] text-neutral-400">
                        {new Date(u.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-5 text-right">
                        {isSuperAdmin && !isSelf && (
                          <button
                            onClick={() => handleDelete(u.id, u.email)}
                            disabled={isPending}
                            className="p-1.5 rounded-lg text-neutral-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                            title="Delete user"
                          >
                            <Trash2 size={15} />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invite User Modal */}
      <InviteUserModal
        isOpen={isInviteOpen}
        onClose={() => setIsInviteOpen(false)}
        onSuccess={() => router.refresh()}
      />
    </div>
  );
}
