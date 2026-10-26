import { getAdminSession } from "@/lib/auth/admin-auth";
import { redirect } from "next/navigation";
import { AdminLoginForm } from "./AdminLoginForm";

export const dynamic = "force-dynamic";

export default async function AdminLoginPage() {
  const session = await getAdminSession();

  if (session) {
    redirect("/admin");
  }

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center p-4 bg-[#101010] text-neutral-200 overflow-hidden font-sans selection:bg-primary/20 selection:text-primary">
      {/* Background Subtle Ambient Lights */}
      <div className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 w-[600px] h-[500px] bg-primary/5 rounded-full blur-[140px] opacity-60" />
      <div className="pointer-events-none absolute -bottom-40 left-1/2 -translate-x-1/2 w-[500px] h-[400px] bg-white/[0.02] rounded-full blur-[120px]" />

      {/* Login Card Form */}
      <div className="relative z-10 w-full">
        <AdminLoginForm />
      </div>
    </div>
  );
}
