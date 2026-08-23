import React, { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { api, formatApiError } from "@/lib/api";

export default function Categories() {
  const [cats, setCats] = useState(null);
  const [name, setName] = useState("");
  const [adding, setAdding] = useState(false);

  const load = () => api.get("/categories").then((r) => setCats(r.data)).catch(() => {});
  useEffect(() => {
    load();
  }, []);

  const add = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    setAdding(true);
    try {
      await api.post("/admin/categories", { name: name.trim() });
      toast.success("Category added");
      setName("");
      load();
    } catch (err) {
      toast.error(formatApiError(err));
    } finally {
      setAdding(false);
    }
  };

  const remove = async (c) => {
    try {
      await api.delete(`/admin/categories/${c.id}`);
      toast.success("Category removed");
      load();
    } catch (err) {
      toast.error(formatApiError(err));
    }
  };

  return (
    <div data-testid="admin-categories" className="max-w-2xl">
      <h1 className="font-display text-3xl font-bold tracking-tight mb-2">Categories</h1>
      <p className="text-[#9A9A9F] text-sm mb-8">Categories power the portfolio filter on the Work page.</p>

      <form onSubmit={add} className="flex gap-3 mb-8">
        <input
          data-testid="category-name-input"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="New category name"
          className="flex-1 bg-[#111116] border border-white/10 px-4 py-3 text-sm text-white placeholder:text-[#9A9A9F]/50 focus:outline-none focus:border-[#8B35FF] transition-colors"
        />
        <button type="submit" disabled={adding} data-testid="category-add-button"
          className="inline-flex items-center gap-2 bg-[#6C19D9] hover:bg-[#8B35FF] disabled:opacity-50 text-white text-sm font-medium px-5 transition-colors">
          <Plus size={15} /> Add
        </button>
      </form>

      <div className="bg-[#111116] border border-white/10 divide-y divide-white/5">
        {cats === null ? (
          <div className="p-6 text-sm text-[#9A9A9F]">Loading...</div>
        ) : cats.length === 0 ? (
          <p className="p-6 text-sm text-[#9A9A9F]">No categories yet.</p>
        ) : (
          cats.map((c) => (
            <div key={c.id} className="flex items-center justify-between px-5 py-4 hover:bg-white/[0.02] transition-colors" data-testid={`category-row-${c.slug}`}>
              <div>
                <p className="text-sm font-medium">{c.name}</p>
                <p className="text-xs text-[#9A9A9F]">/{c.slug}</p>
              </div>
              <button onClick={() => remove(c)} data-testid={`category-delete-${c.slug}`} className="p-2 text-[#9A9A9F] hover:text-red-400 transition-colors" aria-label={`Delete ${c.name}`}>
                <Trash2 size={15} />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
