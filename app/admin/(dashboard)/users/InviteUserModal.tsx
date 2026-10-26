"use client";

import { useState, useTransition } from "react";
import { 
  X, 
  UserPlus, 
  Mail, 
  User, 
  Lock, 
  Eye, 
  EyeOff, 
  Shield, 
  Loader2, 
  Check 
} from "lucide-react";
import { toast } from "sonner";
import { createAdminUserAction, AdminUserRole } from "@/lib/actions/user.actions";

interface InviteUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const ROLES: { value: AdminUserRole; label: string; desc: string }[] = [
  { value: "Admin", label: "Admin", desc: "Full store content & order management" },
  { value: "Editor", label: "Editor", desc: "Can manage products & publish blog posts" },
  { value: "Support", label: "Support", desc: "Can view orders & moderate reviews" },
  { value: "Developer", label: "Developer", desc: "API, webhook & technical configuration" },
  { value: "SuperAdmin", label: "SuperAdmin", desc: "Full access including user permissions" },
];

export function InviteUserModal({ isOpen, onClose, onSuccess }: InviteUserModalProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<AdminUserRole>("Admin");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isPending, startTransition] = useTransition();

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim()) {
      toast.error("Email address is required");
      return;
    }

    if (password.length < 8) {
      toast.error("Password must be at least 8 characters long");
      return;
    }

    startTransition(async () => {
      const res = await createAdminUserAction({
        name: name.trim(),
        email: email.trim(),
        role,
        password,
      });

      if (res.success) {
        toast.success(`User ${email} created successfully`, {
          description: `Assigned role: ${role}`,
        });
        setName("");
        setEmail("");
        setPassword("");
        setRole("Admin");
        onSuccess();
        onClose();
      } else {
        toast.error("Failed to create user", {
          description: res.error || "Please check details and try again.",
        });
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/70 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-[480px] bg-[#1a1a1a] border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-10 text-neutral-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-[#141414]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-primary/10 text-primary border border-primary/20">
              <UserPlus size={18} />
            </div>
            <div>
              <h3 className="text-[15px] font-semibold text-neutral-100">Invite Team Member</h3>
              <p className="text-[12px] text-neutral-400">Create an admin account with custom permissions</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          {/* Full Name */}
          <div className="space-y-1.5">
            <label className="text-[12px] font-semibold text-neutral-300">Full Name</label>
            <div className="relative flex items-center">
              <User size={15} className="absolute left-3.5 text-neutral-500 pointer-events-none" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Alex Morgan"
                className="w-full bg-[#121212] border border-white/10 rounded-xl pl-10 pr-3.5 py-2.5 text-[13px] text-neutral-100 placeholder:text-neutral-600 focus:outline-none focus:border-primary transition-colors"
              />
            </div>
          </div>

          {/* Email */}
          <div className="space-y-1.5">
            <label className="text-[12px] font-semibold text-neutral-300">Email Address</label>
            <div className="relative flex items-center">
              <Mail size={15} className="absolute left-3.5 text-neutral-500 pointer-events-none" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="alex@example.com"
                className="w-full bg-[#121212] border border-white/10 rounded-xl pl-10 pr-3.5 py-2.5 text-[13px] text-neutral-100 placeholder:text-neutral-600 focus:outline-none focus:border-primary transition-colors"
              />
            </div>
          </div>

          {/* Role Selector */}
          <div className="space-y-1.5">
            <label className="text-[12px] font-semibold text-neutral-300 flex items-center gap-1.5">
              <Shield size={14} className="text-primary" /> Role & Access Level
            </label>
            <div className="grid grid-cols-1 gap-2 pt-1">
              {ROLES.map((r) => (
                <label
                  key={r.value}
                  onClick={() => setRole(r.value)}
                  className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                    role === r.value
                      ? "bg-primary/10 border-primary/40 text-neutral-100"
                      : "bg-[#141414] border-white/5 text-neutral-400 hover:border-white/15"
                  }`}
                >
                  <div>
                    <span className="text-[13px] font-semibold text-neutral-200 block">{r.label}</span>
                    <span className="text-[11.5px] text-neutral-500">{r.desc}</span>
                  </div>
                  <input
                    type="radio"
                    name="role"
                    checked={role === r.value}
                    onChange={() => setRole(r.value)}
                    className="accent-primary cursor-pointer"
                  />
                </label>
              ))}
            </div>
          </div>

          {/* Initial Password */}
          <div className="space-y-1.5 pt-1">
            <label className="text-[12px] font-semibold text-neutral-300">Initial Password</label>
            <div className="relative flex items-center">
              <Lock size={15} className="absolute left-3.5 text-neutral-500 pointer-events-none" />
              <input
                type={showPassword ? "text" : "password"}
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimum 8 characters"
                className="w-full bg-[#121212] border border-white/10 rounded-xl pl-10 pr-10 py-2.5 text-[13px] text-neutral-100 placeholder:text-neutral-600 focus:outline-none focus:border-primary transition-colors font-mono"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 p-1 text-neutral-500 hover:text-neutral-300 transition-colors"
              >
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
            <p className="text-[11px] text-neutral-500">
              The user can change this password after signing in.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-[13px] font-medium text-neutral-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="flex items-center gap-2 bg-primary text-primary-foreground font-semibold px-5 py-2.5 rounded-xl text-[13px] shadow-sm hover:opacity-90 transition-all disabled:opacity-50"
            >
              {isPending ? (
                <>
                  <Loader2 size={15} className="animate-spin" /> Creating...
                </>
              ) : (
                <>
                  <Check size={15} strokeWidth={2.5} /> Create User
                </>
              )}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
