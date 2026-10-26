import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminCommandPalette } from "@/components/admin/AdminCommandPalette";
import { getAdminSession } from "@/lib/auth/admin-auth";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getAdminSession();

  if (!session) {
    redirect("/admin/login");
  }

  return (
    <div className="flex min-h-[100dvh] bg-[#141414] text-neutral-200 antialiased font-sans selection:bg-white/20">
      <AdminSidebar session={session} />
      <main className="flex-1 overflow-y-auto p-4 pt-20 md:p-12 md:pt-12 w-full max-w-full">
        {children}
      </main>
      <AdminCommandPalette />
    </div>
  );
}
