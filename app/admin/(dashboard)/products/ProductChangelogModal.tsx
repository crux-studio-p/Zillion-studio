"use client";

import { useState, useEffect, useTransition } from "react";
import { 
  X, 
  Plus, 
  Trash2, 
  Edit3, 
  History, 
  Calendar, 
  Tag, 
  Loader2, 
  Check, 
  Sparkles, 
  AlertCircle,
  ExternalLink
} from "lucide-react";
import { toast } from "sonner";
import { 
  getChangelogsByPackageId, 
  createChangelog, 
  updateChangelog, 
  deleteChangelog,
  importLegacyChangelogs
} from "@/lib/actions/changelog.actions";
import { ProductChangelog } from "@/lib/db/schema";

interface ProductChangelogModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: {
    id: number;
    name: string;
    categoryName?: string;
    description?: string;
  };
  onSuccess: () => void;
}

export function ProductChangelogModal({
  isOpen,
  onClose,
  product,
  onSuccess,
}: ProductChangelogModalProps) {
  const [changelogs, setChangelogs] = useState<ProductChangelog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  // Mode: "list" | "create" | "edit"
  const [viewMode, setViewMode] = useState<"list" | "create" | "edit">("list");
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form fields
  const [version, setVersion] = useState("");
  const [releaseDate, setReleaseDate] = useState("");
  const [title, setTitle] = useState("");
  const [changes, setChanges] = useState<string[]>([""]);

  const packageIdStr = product.id.toString();

  // Load changelogs on open
  useEffect(() => {
    if (isOpen) {
      loadChangelogs();
      resetForm();
      setViewMode("list");
    }
  }, [isOpen, product.id]);

  const loadChangelogs = async () => {
    setIsLoading(true);
    try {
      const data = await getChangelogsByPackageId(packageIdStr);
      setChangelogs(data);
    } catch {
      toast.error("Failed to load changelogs");
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    const today = new Date().toISOString().split("T")[0];
    setVersion("");
    setReleaseDate(today);
    setTitle("");
    setChanges([""]);
    setEditingId(null);
  };

  const handleOpenCreate = () => {
    resetForm();
    // Guess next version from latest, or default v1.0.0
    if (changelogs.length > 0) {
      const latest = changelogs[0].version.replace(/^v/i, "");
      const parts = latest.split(".").map(Number);
      if (parts.length === 3 && !parts.some(isNaN)) {
        setVersion(`v${parts[0]}.${parts[1]}.${parts[2] + 1}`);
      } else {
        setVersion("v1.0.0");
      }
    } else {
      setVersion("v1.0.0");
    }
    setViewMode("create");
  };

  const handleOpenEdit = (entry: ProductChangelog) => {
    setEditingId(entry.id);
    setVersion(entry.version);
    setReleaseDate(entry.releaseDate);
    setTitle(entry.title || "");
    setChanges(entry.changes && entry.changes.length > 0 ? [...entry.changes] : [""]);
    setViewMode("edit");
  };

  const handleAddChangeBullet = () => {
    setChanges((prev) => [...prev, ""]);
  };

  const handleRemoveChangeBullet = (index: number) => {
    setChanges((prev) => prev.filter((_, i) => i !== index));
  };

  const handleBulletChange = (index: number, val: string) => {
    setChanges((prev) => {
      const copy = [...prev];
      copy[index] = val;
      return copy;
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!version.trim()) {
      toast.error("Version is required (e.g. v1.2.0)");
      return;
    }

    if (!releaseDate.trim()) {
      toast.error("Release date is required");
      return;
    }

    const filteredChanges = changes.map((c) => c.trim()).filter((c) => c.length > 0);
    if (filteredChanges.length === 0) {
      toast.error("Please add at least one change bullet point");
      return;
    }

    startTransition(async () => {
      if (viewMode === "edit" && editingId) {
        const res = await updateChangelog(editingId, {
          tebexPackageId: packageIdStr,
          version: version.trim(),
          releaseDate: releaseDate.trim(),
          title: title.trim(),
          changes: filteredChanges,
        });

        if (res.success) {
          toast.success("Changelog release updated");
          await loadChangelogs();
          setViewMode("list");
          onSuccess();
        } else {
          toast.error(res.error || "Failed to update changelog");
        }
      } else {
        const res = await createChangelog({
          tebexPackageId: packageIdStr,
          version: version.trim(),
          releaseDate: releaseDate.trim(),
          title: title.trim(),
          changes: filteredChanges,
        });

        if (res.success) {
          toast.success("New release version added to PostgreSQL");
          await loadChangelogs();
          setViewMode("list");
          onSuccess();
        } else {
          toast.error(res.error || "Failed to create changelog");
        }
      }
    });
  };

  const handleDelete = async (id: string, ver: string) => {
    if (!confirm(`Are you sure you want to delete release ${ver}?`)) return;

    startTransition(async () => {
      const res = await deleteChangelog(id, packageIdStr);
      if (res.success) {
        toast.success(`Deleted release ${ver}`);
        await loadChangelogs();
        onSuccess();
      } else {
        toast.error(res.error || "Failed to delete release");
      }
    });
  };

  const handleImportLegacy = async () => {
    if (!product.description) {
      toast.error("No description available for this package");
      return;
    }

    startTransition(async () => {
      const res = await importLegacyChangelogs(packageIdStr, product.description || "");
      if (res.success) {
        toast.success(res.message);
        await loadChangelogs();
        onSuccess();
      } else {
        toast.error(res.message);
      }
    });
  };

  if (!isOpen) return null;

  const hasLegacyInDesc =
    changelogs.length === 0 &&
    product.description &&
    /\[\[changelog\]\]/i.test(product.description);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/70 backdrop-blur-xs transition-opacity" 
        onClick={onClose} 
      />

      {/* Modal Container */}
      <div className="relative flex flex-col w-full max-w-2xl max-h-[90vh] bg-[#1a1a1a] border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-10 text-neutral-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-[#141414]">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-primary/10 text-primary border border-primary/20">
              <History size={18} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-[15px] font-semibold text-neutral-100 truncate max-w-[340px]">
                  {product.name}
                </h3>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-white/5 text-neutral-400 border border-white/5">
                  ID: {product.id}
                </span>
              </div>
              <p className="text-[12px] text-neutral-400">
                PostgreSQL Version History & Changelog Manager
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

        {/* Action Header / Sub-nav */}
        <div className="flex items-center justify-between px-6 py-3 border-b border-white/5 bg-[#181818] text-[13px]">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode("list")}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                viewMode === "list"
                  ? "bg-white/10 text-neutral-100"
                  : "text-neutral-400 hover:text-neutral-200"
              }`}
            >
              Releases ({changelogs.length})
            </button>
            <button
              onClick={handleOpenCreate}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-colors ${
                viewMode === "create"
                  ? "bg-primary text-primary-foreground font-semibold"
                  : "text-neutral-400 hover:text-neutral-200"
              }`}
            >
              <Plus size={14} /> New Release
            </button>
          </div>

          {changelogs.length > 0 && (
            <span className="text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full">
              Latest: {changelogs[0].version}
            </span>
          )}
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* Legacy Import Suggestion Banner */}
          {hasLegacyInDesc && viewMode === "list" && (
            <div className="flex items-start justify-between gap-4 p-4 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-300">
              <div className="flex items-start gap-2.5 text-[12.5px] leading-relaxed">
                <Sparkles size={16} className="mt-0.5 text-purple-400 shrink-0" />
                <div>
                  <p className="font-semibold text-purple-200">
                    Legacy description changelog detected!
                  </p>
                  <p className="text-purple-300/80 mt-0.5">
                    This product has release notes inside its Tebex description. You can automatically import them directly into PostgreSQL.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleImportLegacy}
                disabled={isPending}
                className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-semibold text-[12px] shadow-sm transition-colors disabled:opacity-50"
              >
                {isPending ? <Loader2 size={13} className="animate-spin" /> : <Sparkles size={13} />}
                Import Now
              </button>
            </div>
          )}

          {/* VIEW: List Releases */}
          {viewMode === "list" && (
            <div>
              {isLoading ? (
                <div className="py-16 flex flex-col items-center justify-center text-neutral-400 gap-2">
                  <Loader2 size={24} className="animate-spin text-primary" />
                  <span className="text-[13px]">Loading release records...</span>
                </div>
              ) : changelogs.length === 0 ? (
                <div className="py-14 flex flex-col items-center justify-center text-center p-6 border border-dashed border-white/10 rounded-2xl bg-white/[0.02]">
                  <div className="h-12 w-12 rounded-full bg-white/5 flex items-center justify-center text-neutral-400 mb-3">
                    <History size={20} />
                  </div>
                  <h4 className="text-[15px] font-semibold text-neutral-200">No changelogs recorded yet</h4>
                  <p className="text-[12.5px] text-neutral-400 max-w-sm mt-1 mb-5">
                    Add the first release entry for {product.name} to display version history and badges on the store page.
                  </p>
                  <button
                    onClick={handleOpenCreate}
                    className="flex items-center gap-2 bg-primary text-primary-foreground font-semibold px-4 py-2 rounded-xl text-[13px] hover:opacity-90 transition-opacity"
                  >
                    <Plus size={15} /> Add First Release
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {changelogs.map((item, idx) => (
                    <div 
                      key={item.id}
                      className="p-4 rounded-xl bg-[#141414] border border-white/5 hover:border-white/10 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-4 mb-2.5">
                        <div className="flex flex-wrap items-center gap-2.5">
                          <span className="inline-flex items-center gap-1 font-bold font-mono text-[13px] text-primary bg-primary/10 border border-primary/20 px-2.5 py-0.5 rounded-lg">
                            <Tag size={12} />
                            {item.version}
                          </span>
                          <span className="inline-flex items-center gap-1 text-[12px] text-neutral-400 font-medium">
                            <Calendar size={12} />
                            {item.releaseDate}
                          </span>
                          {idx === 0 && (
                            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                              Latest Version
                            </span>
                          )}
                        </div>

                        {/* Action buttons */}
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleOpenEdit(item)}
                            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-white/5 transition-colors"
                            title="Edit release"
                          >
                            <Edit3 size={15} />
                          </button>
                          <button
                            onClick={() => handleDelete(item.id, item.version)}
                            className="p-1.5 rounded-lg text-neutral-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                            title="Delete release"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </div>

                      {item.title && (
                        <p className="text-[13px] font-semibold text-neutral-200 mb-2">
                          {item.title}
                        </p>
                      )}

                      {/* Changes list */}
                      {item.changes && item.changes.length > 0 ? (
                        <ul className="space-y-1.5 pl-1">
                          {item.changes.map((change, cIdx) => (
                            <li key={cIdx} className="flex items-start gap-2 text-[12.5px] text-neutral-300">
                              <span className="h-1.5 w-1.5 rounded-full bg-primary shrink-0 mt-1.5" />
                              <span>{change}</span>
                            </li>
                          ))}
                        </ul>
                      ) : item.bodyHtml ? (
                        <div 
                          className="text-[12.5px] text-neutral-400 prose prose-invert max-w-none"
                          dangerouslySetInnerHTML={{ __html: item.bodyHtml }}
                        />
                      ) : (
                        <p className="text-[12px] text-neutral-500 italic">No notes recorded.</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* VIEW: Create or Edit Form */}
          {(viewMode === "create" || viewMode === "edit") && (
            <form onSubmit={handleSave} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Version Field */}
                <div className="space-y-1.5">
                  <label className="text-[12.5px] font-medium text-neutral-300 flex items-center gap-1.5">
                    <Tag size={13} className="text-primary" /> Version Tag
                  </label>
                  <input
                    type="text"
                    required
                    value={version}
                    onChange={(e) => setVersion(e.target.value)}
                    placeholder="e.g. v1.2.0"
                    className="w-full bg-[#141414] border border-white/10 rounded-xl px-3.5 py-2 text-[13.5px] text-neutral-100 placeholder:text-neutral-600 focus:outline-none focus:border-primary transition-colors font-mono"
                  />
                  <p className="text-[11px] text-neutral-500">Must be a valid semver tag (e.g. v1.0.0, v2.1.0).</p>
                </div>

                {/* Release Date Field */}
                <div className="space-y-1.5">
                  <label className="text-[12.5px] font-medium text-neutral-300 flex items-center gap-1.5">
                    <Calendar size={13} className="text-primary" /> Release Date
                  </label>
                  <input
                    type="date"
                    required
                    value={releaseDate}
                    onChange={(e) => setReleaseDate(e.target.value)}
                    className="w-full bg-[#141414] border border-white/10 rounded-xl px-3.5 py-2 text-[13.5px] text-neutral-100 placeholder:text-neutral-600 focus:outline-none focus:border-primary transition-colors"
                  />
                  <p className="text-[11px] text-neutral-500">Date when this version was published.</p>
                </div>

              </div>

              {/* Release Title (Optional) */}
              <div className="space-y-1.5">
                <label className="text-[12.5px] font-medium text-neutral-300">
                  Release Title <span className="text-neutral-500">(Optional)</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. QBox Support & Performance Optimization"
                  className="w-full bg-[#141414] border border-white/10 rounded-xl px-3.5 py-2 text-[13.5px] text-neutral-100 placeholder:text-neutral-600 focus:outline-none focus:border-primary transition-colors"
                />
              </div>

              {/* Dynamic Changes Bullet Points */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="text-[12.5px] font-medium text-neutral-300">
                    Changes & Release Notes
                  </label>
                  <button
                    type="button"
                    onClick={handleAddChangeBullet}
                    className="flex items-center gap-1 text-[12px] text-primary hover:underline font-semibold"
                  >
                    <Plus size={13} /> Add Item
                  </button>
                </div>

                <div className="space-y-2">
                  {changes.map((bullet, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-primary shrink-0" />
                      <input
                        type="text"
                        value={bullet}
                        onChange={(e) => handleBulletChange(idx, e.target.value)}
                        placeholder={`Change bullet #${idx + 1} (e.g. Fixed resmon spike on login)`}
                        className="flex-1 bg-[#141414] border border-white/10 rounded-xl px-3 py-2 text-[13px] text-neutral-100 placeholder:text-neutral-600 focus:outline-none focus:border-primary transition-colors"
                      />
                      {changes.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveChangeBullet(idx)}
                          className="p-2 text-neutral-500 hover:text-red-400 rounded-lg hover:bg-white/5 transition-colors"
                        >
                          <X size={15} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Form Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setViewMode("list")}
                  className="px-4 py-2 rounded-xl text-[13px] font-medium text-neutral-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="flex items-center gap-2 bg-primary text-primary-foreground font-semibold px-5 py-2 rounded-xl text-[13px] hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  {isPending ? (
                    <>
                      <Loader2 size={15} className="animate-spin" /> Saving...
                    </>
                  ) : (
                    <>
                      <Check size={15} strokeWidth={2.5} />
                      {viewMode === "edit" ? "Save Changes" : "Create Release"}
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

        </div>
      </div>
    </div>
  );
}
