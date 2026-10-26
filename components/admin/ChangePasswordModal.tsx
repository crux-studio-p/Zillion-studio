"use client";

import { useState, useTransition } from "react";
import { 
  X, 
  Lock, 
  KeyRound, 
  Eye, 
  EyeOff, 
  Loader2, 
  Check, 
  ShieldCheck,
  AlertCircle 
} from "lucide-react";
import { toast } from "sonner";
import { changePasswordAction } from "@/lib/auth/admin-auth";

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  userEmail?: string;
}

export function ChangePasswordModal({ isOpen, onClose, userEmail }: ChangePasswordModalProps) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!currentPassword) {
      setErrorMessage("Please enter your current password.");
      return;
    }

    if (newPassword.length < 8) {
      setErrorMessage("New password must be at least 8 characters long.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage("New passwords do not match.");
      return;
    }

    startTransition(async () => {
      const res = await changePasswordAction({
        currentPassword,
        newPassword,
      });

      if (res.success) {
        toast.success("Password updated successfully", {
          description: "Use your new password the next time you sign in.",
        });
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        onClose();
      } else {
        setErrorMessage(res.error || "Failed to update password.");
        toast.error("Error updating password", {
          description: res.error,
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
      <div className="relative w-full max-w-[440px] bg-[#1a1a1a] border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-10 text-neutral-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-[#141414]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-primary/10 text-primary border border-primary/20">
              <KeyRound size={18} />
            </div>
            <div>
              <h3 className="text-[15px] font-semibold text-neutral-100">Change Password</h3>
              <p className="text-[12px] text-neutral-400 truncate max-w-[260px]">
                {userEmail || "Update account credentials"}
              </p>
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
          
          {errorMessage && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-start gap-2 text-[12.5px] leading-relaxed">
              <AlertCircle size={15} className="shrink-0 mt-0.5 text-red-400" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Current Password */}
          <div className="space-y-1.5">
            <label className="text-[12px] font-semibold text-neutral-300">Current Password</label>
            <div className="relative flex items-center">
              <Lock size={15} className="absolute left-3.5 text-neutral-500 pointer-events-none" />
              <input
                type={showCurrent ? "text" : "password"}
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter current password"
                className="w-full bg-[#121212] border border-white/10 rounded-xl pl-10 pr-10 py-2.5 text-[13px] text-neutral-100 placeholder:text-neutral-600 focus:outline-none focus:border-primary transition-colors font-mono"
              />
              <button
                type="button"
                onClick={() => setShowCurrent(!showCurrent)}
                className="absolute right-3 p-1 text-neutral-500 hover:text-neutral-300 transition-colors"
              >
                {showCurrent ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          {/* New Password */}
          <div className="space-y-1.5">
            <label className="text-[12px] font-semibold text-neutral-300">New Password</label>
            <div className="relative flex items-center">
              <Lock size={15} className="absolute left-3.5 text-neutral-500 pointer-events-none" />
              <input
                type={showNew ? "text" : "password"}
                required
                minLength={8}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Minimum 8 characters"
                className="w-full bg-[#121212] border border-white/10 rounded-xl pl-10 pr-10 py-2.5 text-[13px] text-neutral-100 placeholder:text-neutral-600 focus:outline-none focus:border-primary transition-colors font-mono"
              />
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                className="absolute right-3 p-1 text-neutral-500 hover:text-neutral-300 transition-colors"
              >
                {showNew ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          {/* Confirm New Password */}
          <div className="space-y-1.5">
            <label className="text-[12px] font-semibold text-neutral-300">Confirm New Password</label>
            <div className="relative flex items-center">
              <Lock size={15} className="absolute left-3.5 text-neutral-500 pointer-events-none" />
              <input
                type="password"
                required
                minLength={8}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter new password"
                className="w-full bg-[#121212] border border-white/10 rounded-xl pl-10 pr-3.5 py-2.5 text-[13px] text-neutral-100 placeholder:text-neutral-600 focus:outline-none focus:border-primary transition-colors font-mono"
              />
            </div>
          </div>

          {/* Buttons */}
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
                  <Loader2 size={15} className="animate-spin" /> Updating...
                </>
              ) : (
                <>
                  <Check size={15} strokeWidth={2.5} /> Update Password
                </>
              )}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
