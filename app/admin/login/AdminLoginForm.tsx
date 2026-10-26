"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  Lock, 
  Mail, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  Loader2, 
  ShieldCheck, 
  AlertCircle,
  ArrowLeft
} from "lucide-react";
import { toast } from "sonner";
import { loginAdminAction } from "@/lib/auth/admin-auth";

export function AdminLoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email.trim()) {
      setErrorMessage("Please enter your admin email address.");
      return;
    }

    if (!password) {
      setErrorMessage("Please enter your password.");
      return;
    }

    startTransition(async () => {
      const res = await loginAdminAction({
        email: email.trim(),
        password,
        rememberMe,
      });

      if (res.success) {
        toast.success("Authentication successful", {
          description: "Welcome to Zillion Studio Admin Portal.",
        });
        router.push("/admin");
        router.refresh();
      } else {
        setErrorMessage(res.error || "Invalid email or password.");
        toast.error("Access Denied", {
          description: res.error || "Please verify your credentials and try again.",
        });
      }
    });
  };

  return (
    <div className="w-full max-w-[420px] mx-auto">
      {/* Back to store link */}
      <div className="mb-8">
        <Link
          href="/store"
          className="inline-flex items-center gap-2 text-[12.5px] font-medium text-neutral-400 hover:text-neutral-100 transition-colors"
        >
          <ArrowLeft size={14} /> Back to store
        </Link>
      </div>

      {/* Main Card */}
      <div className="relative rounded-2xl bg-[#181818] border border-white/10 p-8 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.7)] backdrop-blur-md">
        
        {/* Ambient Top Glow Line */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-[1.5px] bg-gradient-to-r from-transparent via-primary to-transparent" />

        {/* Card Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center h-12 w-12 rounded-2xl bg-[#121212] border border-white/10 text-primary shadow-inner mb-4">
            <Lock size={20} strokeWidth={2.2} />
          </div>
          <h1 className="text-[22px] font-bold tracking-tight text-neutral-100">
            Admin Portal
          </h1>
          <p className="text-[13px] text-neutral-400 mt-1.5 leading-relaxed">
            Enter your credentials to manage resources, changelogs & store analytics.
          </p>
        </div>

        {/* Inline Error Alert */}
        {errorMessage && (
          <div className="mb-6 p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-start gap-2.5 text-[12.5px] leading-relaxed animate-in fade-in duration-200">
            <AlertCircle size={16} className="shrink-0 mt-0.5 text-red-400" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Email Field */}
          <div className="space-y-1.5">
            <label className="text-[12px] font-semibold text-neutral-300">
              Email Address
            </label>
            <div className="relative flex items-center">
              <Mail 
                size={16} 
                className="absolute left-3.5 text-neutral-500 pointer-events-none" 
              />
              <input
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errorMessage) setErrorMessage(null);
                }}
                placeholder="admin@example.com"
                className="w-full bg-[#121212] border border-white/10 rounded-xl pl-10 pr-3.5 py-2.5 text-[13.5px] text-neutral-100 placeholder:text-neutral-600 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-all font-sans"
              />
            </div>
          </div>

          {/* Password Field */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-[12px] font-semibold text-neutral-300">
                Password
              </label>
              <button
                type="button"
                onClick={() => {
                  toast.info("Password Reset", {
                    description: "To reset admin credentials, contact the system administrator.",
                  });
                }}
                className="text-[11.5px] text-neutral-400 hover:text-neutral-200 transition-colors"
              >
                Forgot password?
              </button>
            </div>
            <div className="relative flex items-center">
              <Lock 
                size={16} 
                className="absolute left-3.5 text-neutral-500 pointer-events-none" 
              />
              <input
                type={showPassword ? "text" : "password"}
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errorMessage) setErrorMessage(null);
                }}
                placeholder="••••••••••••"
                className="w-full bg-[#121212] border border-white/10 rounded-xl pl-10 pr-10 py-2.5 text-[13.5px] text-neutral-100 placeholder:text-neutral-600 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-all font-sans"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 p-1 text-neutral-500 hover:text-neutral-300 transition-colors"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Remember Me Checkbox */}
          <div className="flex items-center justify-between pt-1">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-4 w-4 rounded bg-[#121212] border-white/15 text-primary focus:ring-0 focus:ring-offset-0 transition-colors accent-primary cursor-pointer"
              />
              <span className="text-[12px] text-neutral-400 font-medium">
                Remember this device (30 days)
              </span>
            </label>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isPending}
            className="w-full mt-2 flex items-center justify-center gap-2 bg-primary text-primary-foreground font-semibold py-3 px-4 rounded-xl text-[13.5px] shadow-lg shadow-primary/20 hover:opacity-95 active:scale-[0.99] transition-all disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isPending ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>Verifying credentials...</span>
              </>
            ) : (
              <>
                <span>Sign In to Dashboard</span>
                <ArrowRight size={15} />
              </>
            )}
          </button>
        </form>

        {/* Security Badge Footer */}
        <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-center gap-2 text-[11px] text-neutral-500 font-medium">
          <ShieldCheck size={14} className="text-emerald-500 shrink-0" />
          <span>256-bit TLS Encrypted • Authorized Personnel Only</span>
        </div>
      </div>
    </div>
  );
}
