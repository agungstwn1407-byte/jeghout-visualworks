import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FolderOpen, Eye, Star, Inbox, Plus } from "lucide-react";
import { api, imgUrl, catLabel } from "@/lib/api";

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [messages, setMessages] = useState([]);
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    api.get("/admin/stats").then((r) => setStats(r.data)).catch(() => {});
    api.get("/admin/messages").then((r) => setMessages(r.data.slice(0, 5))).catch(() => {});
    api.get("/admin/projects").then((r) => setProjects(r.data.slice(0, 5))).catch(() => {});
  }, []);

  const cards = [
    { label: "Total Projects", value: stats?.projects, icon: FolderOpen },
    { label: "Published", value: stats?.published, icon: Eye },
    { label: "Featured", value: stats?.featured, icon: Star },
    { label: "Unread Messages", value: stats?.unread_messages, icon: Inbox },
  ];

  return (
    <div data-testid="admin-dashboard" className="animate-[fadeIn_0.4s_ease]">
      <div className="flex items-center justify-between mb-10">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-[#9A9A9F] text-sm mt-1">Overview of your creative studio.</p>
        </div>
        <Link
          to="/admin/projects/new"
          data-testid="quick-add-project"
          className="inline-flex items-center gap-2 bg-[#6C19D9] hover:bg-[#8B35FF] text-white text-sm font-medium px-5 py-2.5 rounded-md transition-colors"
        >
          <Plus size={15} /> Add Project
        </Link>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
        {cards.map((c) => (
          <div key={c.label} className="bg-[#111116] border border-white/10 p-6 hover:border-[#6C19D9]/50 transition-colors" data-testid={`stat-${c.label.toLowerCase().replace(/\s/g, "-")}`}>
            <c.icon size={18} className="text-[#A970FF] mb-4" />
            <p className="font-display text-3xl font-bold">{c.value ?? "—"}</p>
            <p className="text-xs text-[#9A9A9F] mt-1 tracking-wide">{c.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        <div>
          <h2 className="text-sm font-semibold tracking-wide mb-4 text-[#C8C8CC]">Recent Projects</h2>
          <div className="bg-[#111116] border border-white/10 divide-y divide-white/5">
            {projects.map((p) => (
              <Link key={p.id} to={`/admin/projects/${p.id}`} className="flex items-center gap-4 p-4 hover:bg-white/[0.03] transition-colors">
                <img src={imgUrl(p.cover)} alt="" className="w-14 h-14 object-cover bg-[#08080B]" />
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{p.title}</p>
                  <p className="text-xs text-[#9A9A9F]">{catLabel(p.category)} — {p.year}</p>
                </div>
                {p.featured && <Star size={14} className="ml-auto text-[#A970FF] shrink-0" />}
              </Link>
            ))}
            {projects.length === 0 && <p className="p-6 text-sm text-[#9A9A9F]">No projects yet.</p>}
          </div>
        </div>
        <div>
          <h2 className="text-sm font-semibold tracking-wide mb-4 text-[#C8C8CC]">Latest Messages</h2>
          <div className="bg-[#111116] border border-white/10 divide-y divide-white/5">
            {messages.map((m) => (
              <Link key={m.id} to="/admin/messages" className="flex items-center gap-4 p-4 hover:bg-white/[0.03] transition-colors">
                <span className={`w-2 h-2 rounded-full shrink-0 ${m.status === "unread" ? "bg-[#8B35FF]" : "bg-white/20"}`} />
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{m.name} <span className="text-[#9A9A9F] font-normal">— {m.project_type || "General"}</span></p>
                  <p className="text-xs text-[#9A9A9F] truncate">{m.message}</p>
                </div>
              </Link>
            ))}
            {messages.length === 0 && <p className="p-6 text-sm text-[#9A9A9F]">No messages yet.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
