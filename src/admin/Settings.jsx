import React, { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Upload } from "lucide-react";
import { api, imgUrl, formatApiError } from "@/lib/api";

const inp = "w-full bg-[#08080B] border border-white/10 px-4 py-3 text-sm text-white placeholder:text-[#9A9A9F]/50 focus:outline-none focus:border-[#8B35FF] transition-colors";
const lbl = "block text-[10px] tracking-[0.25em] uppercase text-[#9A9A9F] mb-2";

export default function Settings() {
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);
  const fileRef = useRef(null);

  useEffect(() => {
    api.get("/settings").then((r) => setForm(r.data)).catch((e) => toast.error(formatApiError(e)));
  }, []);

  if (!form) return <div className="h-64 bg-[#111116] animate-pulse" data-testid="settings-loading" />;

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const uploadPortrait = async (files) => {
    if (!files?.length) return;
    const fd = new FormData();
    fd.append("files", files[0]);
    try {
      const { data } = await api.post("/admin/upload", fd);
      setForm((f) => ({ ...f, portrait: data.urls[0] }));
      toast.success("Portrait uploaded — save to apply");
    } catch (e) {
      toast.error(formatApiError(e));
    }
  };

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put("/admin/settings", form);
      toast.success("Settings saved");
    } catch (err) {
      toast.error(formatApiError(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div data-testid="admin-settings" className="max-w-2xl">
      <h1 className="font-display text-3xl font-bold tracking-tight mb-2">Settings</h1>
      <p className="text-[#9A9A9F] text-sm mb-8">Brand identity, contact info and social links shown across the site.</p>

      <form onSubmit={save} className="space-y-6">
        <div className="bg-[#111116] border border-white/10 p-6 space-y-5">
          <div>
            <label className={lbl} htmlFor="s-brand">Brand Name</label>
            <input id="s-brand" data-testid="settings-brand-name" className={inp} value={form.brand_name || ""} onChange={set("brand_name")} />
          </div>
          <div>
            <label className={lbl} htmlFor="s-tagline">Tagline</label>
            <input id="s-tagline" className={inp} value={form.tagline || ""} onChange={set("tagline")} />
          </div>
          <div>
            <label className={lbl} htmlFor="s-email">Contact Email</label>
            <input id="s-email" className={inp} value={form.email || ""} onChange={set("email")} />
          </div>
          <div>
            <label className={lbl} htmlFor="s-location">Location</label>
            <input id="s-location" className={inp} value={form.location || ""} onChange={set("location")} />
          </div>
        </div>

        <div className="bg-[#111116] border border-white/10 p-6 space-y-5">
          <div>
            <label className={lbl} htmlFor="s-ig">Instagram URL</label>
            <input id="s-ig" className={inp} value={form.instagram || ""} onChange={set("instagram")} />
          </div>
          <div>
            <label className={lbl} htmlFor="s-be">Behance URL</label>
            <input id="s-be" className={inp} value={form.behance || ""} onChange={set("behance")} />
          </div>
          <div>
            <label className={lbl} htmlFor="s-li">LinkedIn URL</label>
            <input id="s-li" className={inp} value={form.linkedin || ""} onChange={set("linkedin")} />
          </div>
        </div>

        <div className="bg-[#111116] border border-white/10 p-6">
          <span className={lbl}>About Page Portrait</span>
          {form.portrait && (
            <img src={imgUrl(form.portrait)} alt="Portrait preview" className="w-32 aspect-[3/4] object-cover border border-white/10 mb-4" />
          )}
          <button
            type="button"
            data-testid="settings-portrait-upload"
            onClick={() => fileRef.current?.click()}
            className="inline-flex items-center gap-2 border border-dashed border-white/15 hover:border-[#8B35FF] text-sm text-[#C8C8CC] px-5 py-3 transition-colors"
          >
            <Upload size={14} /> {form.portrait ? "Replace portrait" : "Upload portrait"}
          </button>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => { uploadPortrait(e.target.files); e.target.value = ""; }} />
        </div>

        <div className="bg-[#111116] border border-white/10 p-6">
          <label className={lbl} htmlFor="s-bio">About Bio (first paragraph)</label>
          <textarea id="s-bio" rows={4} className={`${inp} resize-none`} value={form.about_bio || ""} onChange={set("about_bio")} placeholder="Leave empty to use the default bio" />
        </div>

        <button type="submit" disabled={saving} data-testid="settings-save-button"
          className="bg-[#6C19D9] hover:bg-[#8B35FF] disabled:opacity-50 text-white font-medium px-8 py-3.5 transition-colors duration-300">
          {saving ? "Saving..." : "Save Settings"}
        </button>
      </form>
    </div>
  );
}
