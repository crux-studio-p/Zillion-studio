import { Plus, Search, MoreVertical } from "lucide-react";

export default function ProductsAdminPage() {
  return (
    <div className="max-w-6xl space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[20px] font-semibold text-neutral-100 tracking-tight">Product Content</h1>
          <p className="text-[13px] text-neutral-400 mt-1">Manage custom changelogs and metadata for Tebex products.</p>
        </div>
        <button className="flex items-center gap-2 bg-card text-foreground px-4 py-2 rounded-lg text-[13px] font-semibold hover:bg-neutral-200 transition-colors">
          <Plus size={16} /> Sync from Tebex
        </button>
      </div>

      <div className="bg-[#1c1c1c] border border-white/5 rounded-[14px] overflow-hidden shadow-sm">
        <div className="p-4 border-b border-white/5 flex items-center justify-between bg-[#181818]">
          <div className="flex items-center gap-2 bg-[#141414] border border-white/10 rounded-lg px-3 py-1.5 w-64">
            <Search size={14} className="text-muted-foreground" />
            <input type="text" placeholder="Search products..." className="bg-transparent border-none outline-none text-[13px] text-neutral-200 placeholder:text-neutral-600 w-full" />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse whitespace-nowrap">
          <thead>
            <tr className="border-b border-white/5 text-[12px] font-medium text-muted-foreground bg-[#181818]">
              <th className="py-3 px-5 font-medium">Product Name</th>
              <th className="py-3 px-5 font-medium">Tebex ID</th>
              <th className="py-3 px-5 font-medium">Category</th>
              <th className="py-3 px-5 font-medium">Changelogs</th>
              <th className="py-3 px-5 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="text-[13px] text-neutral-300">
            {[1, 2, 3, 4, 5].map((i) => (
              <tr key={i} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                <td className="py-3 px-5 font-medium text-neutral-200 flex items-center gap-3">
                  <div className="w-8 h-8 rounded bg-neutral-800 shrink-0" />
                  Zillion Product {i}
                </td>
                <td className="py-3 px-5 text-muted-foreground">pkg_8{i}293{i}</td>
                <td className="py-3 px-5">UI / HUD</td>
                <td className="py-3 px-5">
                  <span className="bg-white/10 text-neutral-300 px-2 py-0.5 rounded-full text-[11px] font-medium">{i + 2} entries</span>
                </td>
                <td className="py-3 px-5 text-right">
                  <button className="text-muted-foreground hover:text-white transition-colors">
                    <MoreVertical size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
