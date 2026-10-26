"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Home, FolderKanban, MessageSquare, Users, Settings, FileText, 
  ChevronDown, ExternalLink, HelpCircle, Menu, X, LogOut, KeyRound, Search
} from "lucide-react";
import { logoutAdminAction, AdminSession } from "@/lib/auth/admin-auth";
import { ChangePasswordModal } from "./ChangePasswordModal";

const NAV_ITEMS = [
  { label: "Dashboard", href: "/admin", icon: Home },
  { label: "Product Content", href: "/admin/products", icon: FolderKanban },
  { label: "Reviews", href: "/admin/reviews", icon: MessageSquare, count: 12 },
  { label: "Affiliate Queue", href: "/admin/affiliates", icon: Users, count: 5 },
  { label: "Blog", href: "/admin/blog", icon: FileText },
  { label: "Users & Roles", href: "/admin/users", icon: Settings },
];

export function AdminSidebar({ session }: { session?: AdminSession | null }) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);

  // Close sidebar on route change on mobile
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  const userName = session?.name || "Admin User";
  const userEmail = session?.email || "admin@example.com";
  const initials =
    userName
      .split(" ")
      .map((w) => w[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "AD";

  return (
    <>
      {/* Mobile Header & Toggle */}
      <div className="md:hidden fixed top-0 left-0 w-full h-14 bg-[#141414]/80 backdrop-blur-md border-b border-white/5 z-40 flex items-center px-4">
        <button 
          onClick={() => setIsOpen(true)}
          className="p-2 -ml-2 text-neutral-300 hover:text-white"
        >
          <Menu size={20} />
        </button>
        <span className="ml-2 font-semibold text-neutral-200">Admin</span>
      </div>

      {/* Backdrop */}
      {isOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black/60 z-40 backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed md:sticky top-0 left-0 z-50 h-[100dvh] bg-[#141414] border-r border-white/5 
        text-neutral-300 font-sans flex flex-col transition-transform duration-300 ease-in-out
        w-[66vw] md:w-[260px]
        ${isOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0
      `}>
        {/* Mobile close button inside sidebar */}
        <div className="md:hidden flex items-center justify-end p-4 border-b border-white/5">
          <button onClick={() => setIsOpen(false)} className="text-neutral-400 hover:text-white">
            <X size={20} />
          </button>
        </div>

        {/* User Profile Card */}
        <div 
          onClick={() => setIsChangePasswordOpen(true)}
          className="p-3.5 flex items-center gap-3 mt-2 hover:bg-white/5 rounded-xl mx-2 transition-colors cursor-pointer group"
          title="Click to change password"
        >
          <div className="w-9 h-9 rounded-full bg-neutral-800 border border-white/10 shrink-0 flex items-center justify-center text-[12px] font-bold text-neutral-200 group-hover:border-primary/40 transition-colors">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-semibold text-neutral-200 truncate group-hover:text-primary transition-colors">
              {userName}
            </p>
            <p className="text-[11.5px] text-muted-foreground truncate">{userEmail}</p>
          </div>
          {session?.role && (
            <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-primary/10 text-primary border border-primary/20 shrink-0">
              {session.role}
            </span>
          )}
        </div>

        {/* Quick Search / Command Palette Trigger */}
        <div className="px-2 pt-2 pb-0.5">
          <button
            type="button"
            onClick={() => window.dispatchEvent(new CustomEvent("open-admin-command-palette"))}
            className="flex items-center justify-between w-full px-3 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/5 text-[12.5px] text-neutral-400 hover:text-neutral-200 transition-all group select-none"
          >
            <div className="flex items-center gap-2.5">
              <Search size={14} className="text-neutral-500 group-hover:text-neutral-300 transition-colors" />
              <span>Search or jump to...</span>
            </div>
            <kbd className="text-[10px] font-mono bg-white/5 px-1.5 py-0.5 rounded border border-white/10 text-neutral-400 group-hover:text-neutral-300 shadow-xs">
              Ctrl K
            </kbd>
          </button>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
          <div className="space-y-[2px]">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center justify-between px-3 py-2 rounded-lg text-[13px] font-medium transition-colors ${
                    isActive 
                      ? "bg-white/10 text-neutral-100 font-semibold" 
                      : "text-neutral-400 hover:bg-white/5 hover:text-neutral-200"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon size={16} strokeWidth={isActive ? 2.5 : 2} className={isActive ? "text-neutral-100" : "text-muted-foreground"} />
                    {item.label}
                  </div>
                  {item.count && (
                    <span className={`text-[10px] px-2 py-[1px] rounded-full font-medium ${isActive ? 'bg-white/10 text-neutral-300' : 'bg-white/5 text-muted-foreground'}`}>
                      {item.count}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-3 border-t border-white/5 space-y-1.5">
          <button
            onClick={() => setIsChangePasswordOpen(true)}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-[12px] font-medium text-neutral-400 hover:text-neutral-100 hover:bg-white/5 transition-colors"
          >
            <KeyRound size={13} /> Change Password
          </button>
          <button
            onClick={() => logoutAdminAction()}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-[12px] font-medium text-neutral-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
          >
            <LogOut size={13} /> Sign Out
          </button>
          <div className="text-[10.5px] text-neutral-500 font-medium text-center pt-1">
            Zillion Studio Admin
          </div>
        </div>
      </aside>

      {/* Change Password Modal */}
      <ChangePasswordModal
        isOpen={isChangePasswordOpen}
        onClose={() => setIsChangePasswordOpen(false)}
        userEmail={userEmail}
      />
    </>
  );
}


