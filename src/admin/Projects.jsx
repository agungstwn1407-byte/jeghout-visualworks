import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Pencil, Trash2, Star, Eye, EyeOff, ArrowUp, ArrowDown, X } from "lucide-react";
import { toast } from "sonner";
import { api, imgUrl, catLabel, formatApiError } from "@/lib/api";
import { AnimatePresence, motion } from "framer-motion";

export default function Projects() {
  const [projects, setProjects] = useState(null);
  const [deleting, setDeleting] = useState(null);

  const load = () => api.get("/admin/projects").then((r) => setProjects(r.data)).catch((e) => toast.error(formatApiError(e)));
  useEffect(() => {
    load();
  }, []);

  const patch = async (p, changes, msg) => {
    try {
      await api.put(`/admin/projects/${p.id}`, { ...p, ...changes });
      toast.success(msg);
      load();
    } catch (e) {
      toast.error(formatApiError(e));
    }
  };

  const move = async (p, dir) => {
    await patch(p, { order: (p.order || 0) + dir }, "Order updated");
  };

  const confirmDelete = async () => {
    try {
      await api.delete(`/admin/projects/${deleting.id}`);
      toast.success("Project deleted");
      setDeleting(null);
      load();
    } catch (e) {
      toast.error(formatApiError(e));
    }
  };

  return (
    <div data-testid="admin-projects">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight">Projects</h1>
          <p className="text-[#9A9A9F] text-sm mt-1">Manage your portfolio — published & featured projects appear on the site automatically.</p>
        </div>
        <Link
          to="/admin/projects/new"
          data-testid="add-project-button"
          className="inline-flex items-center gap-2 bg-[#6C19D9] hover:bg-[#8B35FF] text-white text-sm font-medium px-5 py-2.5 rounded-md transition-colors"
        >
          <Plus size={15} /> Add New Project
        </Link>
      </div>

      {projects === null ? (
        <div className="space-y-3">{[...Array(5)].map((_, i) => <div key={i} className="h-16 bg-[#111116] animate-pulse" />)}</div>
      ) : projects.length === 0 ? (
        <div className="bg-[#111116] border border-white/10 p-16 text-center" data-testid="admin-projects-empty">
          <p className="text-[#9A9A9F]">No projects yet. Add your first one.</p>
        </div>
      ) : (
        <div className="bg-[#111116] border border-white/10 overflow-x-auto">
          <table className="w-full text-left text-sm min-w-[760px]">
            <thead>
              <tr className="text-[#9A9A9F] border-b border-white/10 text-xs uppercase tracking-wider">
                <th className="py-4 px-5 font-medium">Project</th>
                <th className="py-4 px-4 font-medium">Category</th>
                <th className="py-4 px-4 font-medium">Year</th>
                <th className="py-4 px-4 font-medium">Status</th>
                <th className="py-4 px-4 font-medium">Order</th>
                <th className="py-4 px-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {projects.map((p) => (
                <tr key={p.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors" data-testid={`project-row-${p.slug}`}>
                  <td className="py-3 px-5">
                    <div className="flex items-center gap-3">
                      <img src={imgUrl(p.cover)} alt="" className="w-12 h-12 object-cover bg-[#08080B]" />
                      <span className="font-medium">{p.title}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-[#C8C8CC]">{catLabel(p.category)}</td>
                  <td className="py-3 px-4 text-[#C8C8CC]">{p.year}</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => patch(p, { published: !p.published }, p.published ? "Unpublished" : "Published")}
                        data-testid={`toggle-publish-${p.slug}`}
                        title={p.published ? "Unpublish" : "Publish"}
                        className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-full border transition-colors ${
                          p.published ? "border-emerald-500/40 text-emerald-400" : "border-white/15 text-[#9A9A9F] hover:text-white"
                        }`}
                      >
                        {p.published ? <Eye size={12} /> : <EyeOff size={12} />}
                        {p.published ? "Live" : "Draft"}
                      </button>
                      <button
                        onClick={() => patch(p, { featured: !p.featured }, p.featured ? "Removed from featured" : "Marked as featured")}
                        data-testid={`toggle-featured-${p.slug}`}
                        title="Toggle featured"
                        className={`p-1.5 rounded-full border transition-colors ${
                          p.featured ? "border-[#8B35FF]/60 text-[#A970FF]" : "border-white/15 text-[#9A9A9F] hover:text-white"
                        }`}
                      >
                        <Star size={13} fill={p.featured ? "currentColor" : "none"} />
                      </button>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-1">
                      <button onClick={() => move(p, -1)} data-testid={`move-up-${p.slug}`} className="p-1 text-[#9A9A9F] hover:text-white transition-colors" aria-label="Move up"><ArrowUp size={14} /></button>
                      <button onClick={() => move(p, 1)} data-testid={`move-down-${p.slug}`} className="p-1 text-[#9A9A9F] hover:text-white transition-colors" aria-label="Move down"><ArrowDown size={14} /></button>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center justify-end gap-1">
                      <Link to={`/admin/projects/${p.id}`} data-testid={`edit-project-${p.slug}`} className="p-2 text-[#9A9A9F] hover:text-white transition-colors" aria-label={`Edit ${p.title}`}>
                        <Pencil size={15} />
                      </Link>
                      <button onClick={() => setDeleting(p)} data-testid={`delete-project-${p.slug}`} className="p-2 text-[#9A9A9F] hover:text-red-400 transition-colors" aria-label={`Delete ${p.title}`}>
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <AnimatePresence>
        {deleting && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center px-6"
            onClick={() => setDeleting(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="bg-[#111116] border border-white/10 p-8 max-w-sm w-full"
              onClick={(e) => e.stopPropagation()}
              data-testid="delete-confirm-modal"
            >
              <div className="flex justify-between items-start mb-4">
                <h3 className="font-display text-lg font-semibold">Delete project?</h3>
                <button onClick={() => setDeleting(null)} aria-label="Close" className="text-[#9A9A9F] hover:text-white"><X size={18} /></button>
              </div>
              <p className="text-sm text-[#9A9A9F] leading-relaxed">"{deleting.title}" will be permanently removed from your portfolio.</p>
              <div className="flex gap-3 mt-6">
                <button onClick={() => setDeleting(null)} className="flex-1 border border-white/15 text-sm py-2.5 hover:bg-white/5 transition-colors">Cancel</button>
                <button onClick={confirmDelete} data-testid="confirm-delete-button" className="flex-1 bg-red-500/90 hover:bg-red-500 text-white text-sm py-2.5 transition-colors">Delete</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
