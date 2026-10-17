import { AdminSidebar } from "@/components/admin/AdminSidebar";

export const dynamic = "force-dynamic";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-[100dvh] bg-[#141414] text-neutral-200 antialiased font-sans selection:bg-white/20">
      <AdminSidebar />
      <main className="flex-1 overflow-y-auto p-4 pt-20 md:p-12 md:pt-12 w-full max-w-full">
        {children}
      </main>
    </div>
  );
}
