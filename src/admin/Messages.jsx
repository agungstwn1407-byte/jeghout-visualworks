import React, { useEffect, useState } from "react";
import { Trash2, MailOpen, Mail, Archive, ChevronDown } from "lucide-react";
import { toast } from "sonner";
import { api, formatApiError } from "@/lib/api";

const STATUS_STYLE = {
  unread: "bg-[#6C19D9]/20 text-[#A970FF] border-[#6C19D9]/40",
  read: "bg-white/5 text-[#C8C8CC] border-white/15",
  archived: "bg-white/5 text-[#9A9A9F] border-white/10",
};

export default function Messages() {
  const [messages, setMessages] = useState(null);
  const [openId, setOpenId] = useState(null);
  const [tab, setTab] = useState("all");

  const load = () => api.get("/admin/messages").then((r) => setMessages(r.data)).catch((e) => toast.error(formatApiError(e)));
  useEffect(() => {
    load();
  }, []);

  const setStatus = async (m, status) => {
    try {
      await api.patch(`/admin/messages/${m.id}`, { status });
      load();
    } catch (e) {
      toast.error(formatApiError(e));
    }
  };

  const remove = async (m) => {
    try {
      await api.delete(`/admin/messages/${m.id}`);
      toast.success("Message deleted");
      load();
    } catch (e) {
      toast.error(formatApiError(e));
    }
  };

  const filtered = (messages || []).filter((m) => tab === "all" || m.status === tab);

  return (
    <div data-testid="admin-messages">
      <h1 className="font-display text-3xl font-bold tracking-tight mb-2">Messages</h1>
      <p className="text-[#9A9A9F] text-sm mb-8">Inquiries from the contact form land here.</p>

      <div className="flex gap-2 mb-6">
        {["all", "unread", "read", "archived"].map((t) => (
          <button
            key={t}
            data-testid={`messages-tab-${t}`}
            onClick={() => setTab(t)}
            className={`text-xs uppercase tracking-wider px-4 py-2 rounded-full border transition-colors ${
              tab === t ? "border-[#8B35FF] text-white bg-[#6C19D9]/15" : "border-white/10 text-[#9A9A9F] hover:text-white"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {messages === null ? (
        <div className="space-y-3">{[...Array(3)].map((_, i) => <div key={i} className="h-20 bg-[#111116] animate-pulse" />)}</div>
      ) : filtered.length === 0 ? (
        <div className="bg-[#111116] border border-white/10 p-16 text-center" data-testid="messages-empty">
          <p className="text-[#9A9A9F]">No messages here yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((m) => (
            <div key={m.id} className="bg-[#111116] border border-white/10" data-testid={`message-${m.id}`}>
              <button
                className="w-full flex items-center gap-4 px-5 py-4 text-left hover:bg-white/[0.02] transition-colors"
                onClick={() => setOpenId(openId === m.id ? null : m.id)}
                data-testid={`message-toggle-${m.id}`}
              >
                <span className={`text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-full border shrink-0 ${STATUS_STYLE[m.status]}`}>
                  {m.status}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate">
                    {m.name} <span className="text-[#9A9A9F] font-normal">· {m.email}</span>
                  </p>
                  <p className="text-xs text-[#9A9A9F] truncate mt-0.5">{m.message}</p>
                </div>
                <div className="text-right shrink-0 hidden sm:block">
                  <p className="text-xs text-[#C8C8CC]">{m.project_type || "—"}</p>
                  <p className="text-[10px] text-[#9A9A9F] mt-0.5">{new Date(m.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</p>
                </div>
                <ChevronDown size={16} className={`text-[#9A9A9F] transition-transform ${openId === m.id ? "rotate-180" : ""}`} />
              </button>
              {openId === m.id && (
                <div className="px-5 pb-5 pt-1 border-t border-white/5">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs text-[#9A9A9F] my-4">
                    <div><span className="block uppercase tracking-wider text-[10px] mb-1">Company</span><span className="text-[#C8C8CC]">{m.company || "—"}</span></div>
                    <div><span className="block uppercase tracking-wider text-[10px] mb-1">Project Type</span><span className="text-[#C8C8CC]">{m.project_type || "—"}</span></div>
                    <div><span className="block uppercase tracking-wider text-[10px] mb-1">Budget</span><span className="text-[#C8C8CC]">{m.budget || "—"}</span></div>
                    <div><span className="block uppercase tracking-wider text-[10px] mb-1">Email</span><a className="text-[#A970FF]" href={`mailto:${m.email}`}>{m.email}</a></div>
                  </div>
                  <p className="text-sm text-[#C8C8CC] leading-relaxed whitespace-pre-wrap bg-[#08080B] border border-white/5 p-4">{m.message}</p>
                  <div className="flex gap-2 mt-4">
                    {m.status !== "read" && (
                      <button onClick={() => setStatus(m, "read")} data-testid={`message-read-${m.id}`} className="inline-flex items-center gap-1.5 text-xs border border-white/15 px-3 py-2 text-[#C8C8CC] hover:text-white transition-colors">
                        <MailOpen size={13} /> Mark Read
                      </button>
                    )}
                    {m.status !== "unread" && (
                      <button onClick={() => setStatus(m, "unread")} className="inline-flex items-center gap-1.5 text-xs border border-white/15 px-3 py-2 text-[#C8C8CC] hover:text-white transition-colors">
                        <Mail size={13} /> Mark Unread
                      </button>
                    )}
                    {m.status !== "archived" && (
                      <button onClick={() => setStatus(m, "archived")} data-testid={`message-archive-${m.id}`} className="inline-flex items-center gap-1.5 text-xs border border-white/15 px-3 py-2 text-[#C8C8CC] hover:text-white transition-colors">
                        <Archive size={13} /> Archive
                      </button>
                    )}
                    <button onClick={() => remove(m)} data-testid={`message-delete-${m.id}`} className="inline-flex items-center gap-1.5 text-xs border border-red-500/30 px-3 py-2 text-red-400 hover:bg-red-500/10 transition-colors ml-auto">
                      <Trash2 size={13} /> Delete
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
