"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import { 
  Search, 
  Home, 
  FolderKanban, 
  MessageSquare, 
  Users, 
  FileText, 
  FilePlus, 
  Shield, 
  ExternalLink, 
  KeyRound, 
  LogOut, 
  Hexagon, 
  Sparkles, 
  ShoppingBag, 
  Layers,
  ArrowRight
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { logoutAdminAction } from "@/lib/auth/admin-auth";

export interface CommandItem {
  id: string;
  title: string;
  subtitle?: string;
  category: "AI & QUICK" | "NAVIGATION" | "ACTIONS" | "EXTERNAL";
  icon: any;
  iconColor?: string;
  shortcut?: string;
  perform: (router: any) => void;
}

export function AdminCommandPalette() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Command palette entries
  const commands: CommandItem[] = useMemo(() => [
    {
      id: "ai-assistant",
      title: "Zillion AI Assistant",
      subtitle: "Ask questions, generate release notes & analytics",
      category: "AI & QUICK",
      icon: Hexagon,
      iconColor: "text-blue-500 fill-blue-500",
      shortcut: "Tab",
      perform: (r) => {
        // Quick focus to AI or navigate to dashboard with AI prompt
        r.push("/admin?action=ai");
      },
    },
    {
      id: "nav-home",
      title: "Home Dashboard",
      category: "NAVIGATION",
      icon: Home,
      perform: (r) => r.push("/admin"),
    },
    {
      id: "nav-products",
      title: "Product Content & Changelogs",
      category: "NAVIGATION",
      icon: FolderKanban,
      perform: (r) => r.push("/admin/products"),
    },
    {
      id: "nav-reviews",
      title: "Customer Reviews",
      category: "NAVIGATION",
      icon: MessageSquare,
      perform: (r) => r.push("/admin/reviews"),
    },
    {
      id: "nav-affiliates",
      title: "Affiliate Application Queue",
      category: "NAVIGATION",
      icon: Users,
      perform: (r) => r.push("/admin/affiliates"),
    },
    {
      id: "nav-blog",
      title: "Blog & Announcements",
      category: "NAVIGATION",
      icon: FileText,
      perform: (r) => r.push("/admin/blog"),
    },
    {
      id: "nav-users",
      title: "Users & Access Control",
      category: "NAVIGATION",
      icon: Shield,
      perform: (r) => r.push("/admin/users"),
    },
    {
      id: "action-new-blog",
      title: "Create New Blog Post",
      category: "ACTIONS",
      icon: FilePlus,
      perform: (r) => r.push("/admin/blog/new"),
    },
    {
      id: "action-invite-user",
      title: "Invite New Team Member",
      category: "ACTIONS",
      icon: Users,
      perform: (r) => r.push("/admin/users"),
    },
    {
      id: "action-sign-out",
      title: "Sign Out of Admin Portal",
      category: "ACTIONS",
      icon: LogOut,
      iconColor: "text-red-400",
      perform: () => logoutAdminAction(),
    },
    {
      id: "ext-store",
      title: "View Live Public Storefront",
      category: "EXTERNAL",
      icon: ShoppingBag,
      perform: () => window.open("/store", "_blank"),
    },
    {
      id: "ext-keymaster",
      title: "Cfx.re Keymaster Portal",
      category: "EXTERNAL",
      icon: ExternalLink,
      perform: () => window.open("https://keymaster.fivem.net", "_blank"),
    },
    {
      id: "ext-tebex",
      title: "Tebex Creator Control Panel",
      category: "EXTERNAL",
      icon: ExternalLink,
      perform: () => window.open("https://creator.tebex.io", "_blank"),
    },
  ], []);

  // Filter commands
  const filteredCommands = useMemo(() => {
    if (!search.trim()) return commands;
    const q = search.toLowerCase();
    return commands.filter(
      (cmd) =>
        cmd.title.toLowerCase().includes(q) ||
        cmd.category.toLowerCase().includes(q) ||
        (cmd.subtitle && cmd.subtitle.toLowerCase().includes(q))
    );
  }, [commands, search]);

  // Group commands by category
  const grouped = useMemo(() => {
    const groups: { category: string; items: CommandItem[] }[] = [];
    const categoryOrder = ["AI & QUICK", "NAVIGATION", "ACTIONS", "EXTERNAL"];

    for (const cat of categoryOrder) {
      const items = filteredCommands.filter((c) => c.category === cat);
      if (items.length > 0) {
        groups.push({ category: cat, items });
      }
    }
    return groups;
  }, [filteredCommands]);

  // Global Ctrl+K / Cmd+K listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Toggle on Ctrl+K or Cmd+K
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsOpen((prev) => !prev);
        return;
      }

      // Close on Esc
      if (e.key === "Escape" && isOpen) {
        e.preventDefault();
        setIsOpen(false);
        return;
      }
    };

    const handleCustomOpen = () => {
      setIsOpen(true);
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("open-admin-command-palette", handleCustomOpen);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("open-admin-command-palette", handleCustomOpen);
    };
  }, [isOpen]);

  // Reset selection and focus on open
  useEffect(() => {
    if (isOpen) {
      setSearch("");
      setSelectedIndex(0);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    }
  }, [isOpen]);

  // Keep selected index in bounds
  useEffect(() => {
    if (selectedIndex >= filteredCommands.length) {
      setSelectedIndex(Math.max(0, filteredCommands.length - 1));
    }
  }, [filteredCommands.length, selectedIndex]);

  // Scroll active item into view
  useEffect(() => {
    if (listRef.current) {
      const activeEl = listRef.current.querySelector('[data-active="true"]') as HTMLElement;
      if (activeEl) {
        activeEl.scrollIntoView({ block: "nearest" });
      }
    }
  }, [selectedIndex]);

  // Handle arrow key navigation & Enter inside input
  const handleInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % filteredCommands.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filteredCommands.length) % filteredCommands.length);
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (filteredCommands[selectedIndex]) {
        executeCommand(filteredCommands[selectedIndex]);
      }
    } else if (e.key === "Tab") {
      // If on top AI command or Tab pressed, select AI
      const aiCmd = filteredCommands.find((c) => c.id === "ai-assistant");
      if (aiCmd) {
        e.preventDefault();
        executeCommand(aiCmd);
      }
    }
  };

  const executeCommand = (cmd: CommandItem) => {
    setIsOpen(false);
    cmd.perform(router);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center pt-24 sm:pt-32 px-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-black/75 backdrop-blur-sm"
          />

          {/* Palette Dialog */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -10 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full max-w-[560px] bg-[#161616] border border-white/10 rounded-[18px] shadow-[0_25px_70px_rgba(0,0,0,0.8)] overflow-hidden z-10 text-neutral-200"
          >
            {/* Search Input Bar (Matching Image Header) */}
            <div className="relative flex items-center justify-between px-4 py-3 border-b border-white/10 bg-[#141414]">
              <div className="flex items-center gap-2.5 flex-1 min-w-0">
                <input
                  ref={inputRef}
                  type="text"
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setSelectedIndex(0);
                  }}
                  onKeyDown={handleInputKeyDown}
                  placeholder="Search records, or jump to..."
                  className="w-full bg-transparent border-none outline-none text-[14.5px] text-neutral-100 placeholder:text-neutral-500 font-sans tracking-tight"
                />
              </div>

              {/* Right Tag / AI Badge (as in the screenshot: [⬡ blue AI] Tab) */}
              <div 
                onClick={() => {
                  const aiCmd = commands.find((c) => c.id === "ai-assistant");
                  if (aiCmd) executeCommand(aiCmd);
                }}
                className="flex items-center gap-2 pl-3 cursor-pointer shrink-0 select-none group"
              >
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[11.5px] font-semibold group-hover:bg-blue-500/15 transition-colors">
                  <Hexagon size={13} className="fill-blue-500 text-blue-500" />
                  <span>Zillion AI</span>
                </div>
                <kbd className="text-[10px] font-mono text-neutral-400 bg-white/5 border border-white/10 px-1.5 py-0.5 rounded shadow-xs">
                  Tab
                </kbd>
              </div>
            </div>

            {/* Results List */}
            <div 
              ref={listRef} 
              className="max-h-[360px] overflow-y-auto p-2 space-y-3.5 scrollbar-thin scrollbar-thumb-white/10"
            >
              {filteredCommands.length === 0 ? (
                <div className="py-12 text-center text-neutral-500 text-[13px]">
                  No matching records or commands for <span className="text-neutral-300">"{search}"</span>
                </div>
              ) : (
                grouped.map((group) => (
                  <div key={group.category} className="space-y-1">
                    {/* Category Header */}
                    <div className="px-3 pt-1 pb-1 text-[10.5px] font-bold uppercase tracking-wider text-neutral-500 select-none">
                      {group.category}
                    </div>

                    {/* Category Items */}
                    {group.items.map((item) => {
                      const globalIdx = filteredCommands.findIndex((c) => c.id === item.id);
                      const isSelected = globalIdx === selectedIndex;
                      const Icon = item.icon;

                      return (
                        <div
                          key={item.id}
                          data-active={isSelected}
                          onClick={() => executeCommand(item)}
                          onMouseEnter={() => setSelectedIndex(globalIdx)}
                          className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl cursor-pointer transition-colors text-[13.5px] select-none ${
                            isSelected
                              ? "bg-white/[0.08] text-white"
                              : "text-neutral-300 hover:bg-white/[0.04]"
                          }`}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <Icon 
                              size={16} 
                              className={`shrink-0 ${
                                item.iconColor 
                                  ? item.iconColor 
                                  : isSelected ? "text-neutral-100" : "text-neutral-400"
                              }`} 
                            />
                            <div className="truncate">
                              <span className="font-medium text-[13.5px]">{item.title}</span>
                              {item.subtitle && (
                                <span className="text-[11px] text-neutral-500 ml-2 hidden sm:inline">
                                  {item.subtitle}
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            {item.shortcut && (
                              <kbd className="text-[10px] font-mono text-neutral-400 bg-white/5 border border-white/10 px-1.5 py-0.5 rounded">
                                {item.shortcut}
                              </kbd>
                            )}
                            {isSelected && (
                              <span className="text-[11px] font-medium text-neutral-400 hidden sm:inline-flex items-center gap-1">
                                Jump to <ArrowRight size={11} />
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ))
              )}
            </div>

            {/* Footer Navigation Hints */}
            <div className="px-4 py-2.5 bg-[#121212] border-t border-white/5 flex items-center justify-between text-[11px] text-neutral-500 select-none">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10 font-mono text-[10px]">↑</kbd>
                  <kbd className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10 font-mono text-[10px]">↓</kbd>
                  <span>Navigate</span>
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10 font-mono text-[10px]">↵</kbd>
                  <span>Select</span>
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10 font-mono text-[10px]">esc</kbd>
                  <span>Close</span>
                </span>
              </div>

              <div className="text-[10.5px] text-neutral-500 font-mono">
                Zillion Studio
              </div>
            </div>

          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
