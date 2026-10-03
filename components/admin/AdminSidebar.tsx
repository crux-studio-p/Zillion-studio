"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Home, FolderKanban, MessageSquare, Users, Settings, FileText, 
  ChevronDown, ExternalLink, HelpCircle
} from "lucide-react";

const NAV_ITEMS = [
  { label: "Dashboard", href: "/admin", icon: Home },
  { label: "Product Content", href: "/admin/products", icon: FolderKanban },
  { label: "Reviews", href: "/admin/reviews", icon: MessageSquare, count: 12 },
  { label: "Affiliate Queue", href: "/admin/affiliates", icon: Users, count: 5 },
  { label: "Blog", href: "/admin/blog", icon: FileText },
  { label: "Users & Roles", href: "/admin/users", icon: Settings },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-[260px] flex flex-col bg-[#141414] border-r border-white/5 text-neutral-300 h-screen sticky top-0 font-sans">
      <div className="p-4 flex items-center gap-3 mt-2 cursor-pointer hover:bg-white/5 rounded-lg mx-2">
        <div className="w-9 h-9 rounded-full bg-neutral-800 shrink-0 flex items-center justify-center text-[12px] font-bold text-neutral-300">
          SD
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-semibold text-neutral-200 truncate">Sidak Dhingra</p>
          <p className="text-[12px] text-muted-foreground truncate">sidak@zillion.studio</p>
        </div>
        <ChevronDown size={14} className="text-muted-foreground shrink-0" />
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        <div className="space-y-[2px]">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center justify-between px-3 py-2 rounded-lg text-[13px] font-medium ${
                  isActive 
                    ? "bg-white/5 text-neutral-200" 
                    : "text-neutral-400 hover:bg-white/5 hover:text-neutral-200"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon size={16} strokeWidth={isActive ? 2.5 : 2} className={isActive ? "text-neutral-300" : "text-muted-foreground"} />
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

      <div className="p-3 border-t border-white/5">
        <div className="text-[11px] text-muted-foreground font-medium text-center py-2">
          Zillion Studio Admin
        </div>
      </div>
    </aside>
  );
}
