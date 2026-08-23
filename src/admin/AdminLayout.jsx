import React, { useState } from "react";
import { NavLink, Outlet, useNavigate, Link } from "react-router-dom";
import { LayoutDashboard, FolderOpen, Tags, Inbox, Settings, LogOut, ExternalLink, Menu, X } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

const NAV = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/admin/projects", label: "Projects", icon: FolderOpen },
  { to: "/admin/categories", label: "Categories", icon: Tags },
  { to: "/admin/messages", label: "Messages", icon: Inbox },
  { to: "/admin/settings", label: "Settings", icon: Settings },
];

function SideNav({ onNavigate }) {
  const { logout } = useAuth();
  const navigate = useNavigate();
  return (
    <div className="flex flex-col h-full">
      <Link to="/admin" className="font-display font-bold text-xl px-6 py-7 block">
        jeghout<span className="text-[#8B35FF]">.</span>
        <span className="block text-[10px] font-normal tracking-[0.3em] uppercase text-[#9A9A9F] mt-1">Studio Admin</span>
      </Link>
      <nav className="flex-1 px-3 space-y-1" aria-label="Admin navigation">
        {NAV.map((n) => (
          <NavLink
            key={n.to}
            to={n.to}
            end={n.end}
            onClick={onNavigate}
            data-testid={`admin-nav-${n.label.toLowerCase()}`}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 text-sm rounded-md transition-colors duration-200 ${
                isActive ? "bg-[#6C19D9]/15 text-white border-l-2 border-[#8B35FF]" : "text-[#9A9A9F] hover:text-white hover:bg-white/5"
              }`
            }
          >
            <n.icon size={16} />
            {n.label}
          </NavLink>
        ))}
      </nav>
      <div className="px-3 pb-6 space-y-1">
        <Link to="/" data-testid="admin-view-site" className="flex items-center gap-3 px-4 py-3 text-sm text-[#9A9A9F] hover:text-white hover:bg-white/5 rounded-md transition-colors">
          <ExternalLink size={16} /> View Site
        </Link>
        <button
          data-testid="admin-logout"
          onClick={() => {
            logout();
            navigate("/admin/login");
          }}
          className="w-full flex items-center gap-3 px-4 py-3 text-sm text-[#9A9A9F] hover:text-red-400 hover:bg-white/5 rounded-md transition-colors"
        >
          <LogOut size={16} /> Logout
        </button>
      </div>
    </div>
  );
}

export default function AdminLayout() {
  const [open, setOpen] = useState(false);
  return (
    <div className="min-h-screen bg-[#08080B] text-[#F5F5F5]" data-testid="admin-layout">
      {/* desktop sidebar */}
      <aside className="hidden lg:block w-64 fixed inset-y-0 left-0 bg-[#111116] border-r border-white/10 z-40">
        <SideNav />
      </aside>
      {/* mobile topbar */}
      <div className="lg:hidden sticky top-0 z-40 bg-[#111116]/95 backdrop-blur-xl border-b border-white/10 flex items-center justify-between px-5 py-4">
        <span className="font-display font-bold">Jeghout<span className="text-[#8B35FF]">.</span></span>
        <button onClick={() => setOpen(!open)} data-testid="admin-mobile-toggle" aria-label="Toggle admin menu" className="p-2">
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>
      {open && (
        <div className="lg:hidden fixed inset-0 z-30 bg-[#08080B] pt-16" data-testid="admin-mobile-nav">
          <SideNav onNavigate={() => setOpen(false)} />
        </div>
      )}
      <main className="lg:ml-64 p-6 md:p-10 min-h-screen">
        <Outlet />
      </main>
    </div>
  );
}
