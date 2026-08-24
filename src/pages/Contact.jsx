import React, { useState } from "react";
import { Send, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { api, useSettings, formatApiError } from "@/lib/api";
import { Reveal } from "@/components/Reveal";

const PROJECT_TYPES = [
  "Graphic Design",
  "Branding & Visual Identity",
  "Social Media Design",
  "Photography",
  "Video Editing",
  "Creative Content",
  "Other",
];

const BUDGETS = [
  "Di bawah Rp200.000",
  "Rp200.000 — Rp500.000",
  "Rp500.000 — Rp1.500.000",
  "Rp1.500.000+",
  "Let's discuss",
];

const inputCls =
  "w-full bg-transparent border-b border-white/15 py-4 text-white placeholder:text-[#9A9A9F]/60 focus:outline-none focus:border-[#8B35FF] transition-colors duration-300";

/* =========================
   SOCIAL ICONS
========================= */

function InstagramIcon({ size = 15 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <rect
        x="3"
        y="3"
        width="18"
        height="18"
        rx="5"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <circle
        cx="12"
        cy="12"
        r="4"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" />
    </svg>
  );
}

function BehanceIcon({ size = 15 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path d="M8.4 5.2c2.7 0 4.4 1.2 4.4 3.2 0 1.2-.7 2.2-1.8 2.7 1.5.4 2.4 1.5 2.4 3.1 0 2.6-2.1 4-5.1 4H3V5.2h5.4Zm-.5 5c1.3 0 2-.5 2-1.5s-.7-1.4-2-1.4H5.6v2.9h2.3Zm.2 5.7c1.5 0 2.3-.6 2.3-1.8s-.8-1.8-2.3-1.8H5.6v3.6h2.5ZM15.1 9.2h5.2v1.2h-5.2V9.2Zm.2 2.1c.5-1.7 2-2.8 4.1-2.8 2.8 0 4.3 1.9 4.3 4.8v.6h-6.5c.2 1.3 1 2 2.3 2 1 0 1.7-.4 2.1-1.1l1.8 1c-.8 1.5-2.2 2.3-4 2.3-2.8 0-4.7-1.8-4.7-4.7 0-.7.1-1.4.6-2.1Zm1.9.9h4.1c-.1-1.1-.8-1.7-2-1.7-1.1 0-1.9.6-2.1 1.7Z" />
    </svg>
  );
}

function LinkedinIcon({ size = 15 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path d="M5.2 7.1A2.1 2.1 0 1 0 5.2 3a2.1 2.1 0 0 0 0 4.1ZM3.4 21h3.6V9H3.4v12ZM9.2 9v12h3.6v-6.2c0-1.6.3-3.2 2.3-3.2 2 0 2 1.8 2 3.3V21h3.6v-6.8c0-3.3-.7-5.8-4.7-5.8-1.9 0-3.2 1-3.7 1.9h-.1V9H9.2Z" />
    </svg>
  );
}

function MailIcon({ size = 15 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <rect
        x="3"
        y="5"
        width="18"
        height="14"
        rx="2"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path
        d="m4 7 8 6 8-6"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/* =========================
   CONTACT PAGE
========================= */

export default function Contact() {
  const s = useSettings();

  const settings = s || {};

  const [form, setForm] = useState({
    name: "",
    email: "",
    company: "",
    project_type: "",
    budget: "",
    message: "",
  });

  const [state, setState] = useState("idle");
  const [error, setError] = useState("");

  const set = (key) => (event) => {
    setForm({
      ...form,
      [key]: event.target.value,
    });
  };

  const submit = async (event) => {
    event.preventDefault();

    setError("");
    setState("sending");

    try {
      await api.post("/messages", form);

      setState("sent");

      toast.success(
        "Inquiry sent — I'll get back to you soon."
      );
    } catch (err) {
      setState("idle");
      setError(formatApiError(err));

      toast.error(
        "Failed to send inquiry. Please try again."
      );
    }
  };

  const socials = [
    {
      component: InstagramIcon,
      label: "Instagram",
      href: settings.instagram || "#",
      tid: "contact-instagram",
    },
    {
      component: BehanceIcon,
      label: "Behance",
      href: settings.behance || "#",
      tid: "contact-behance",
    },
    {
      component: LinkedinIcon,
      label: "LinkedIn",
      href: settings.linkedin || "#",
      tid: "contact-linkedin",
    },
    {
      component: MailIcon,
      label: "Email",
      href: `mailto:${settings.email || ""}`,
      tid: "contact-mail",
    },
  ];

  return (
    <main
      className="pt-36 md:pt-44 pb-24"
      data-testid="contact-page"
    >
      <div className="max-w-[1440px] mx-auto px-6 md:px-12">

        {/* Header */}
        <Reveal y={20}>
          <p className="text-xs md:text-sm tracking-[0.25em] uppercase font-semibold text-[#A970FF] mb-6">
            Contact
          </p>
        </Reveal>

        <Reveal y={24} delay={0.08}>
          <h1 className="font-display text-4xl md:text-6xl lg:text-7xl font-bold tracking-tighter leading-[1.05]">
            Have a project{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#8B35FF] to-[#A970FF]">
              in mind?
            </span>
          </h1>
        </Reveal>

        <Reveal y={20} delay={0.16}>
          <p className="text-[#9A9A9F] mt-6 text-base md:text-lg">
            Let's create something visually memorable.
          </p>
        </Reveal>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 mt-16 md:mt-24">

          {/* =========================
              FORM
          ========================= */}

          <div className="lg:col-span-7">

            {state === "sent" ? (
              <Reveal>
                <div
                  className="border border-[#6C19D9]/40 bg-[#6C19D9]/10 px-8 py-14 text-center"
                  data-testid="contact-success"
                >
                  <CheckCircle2
                    size={40}
                    className="text-[#A970FF] mx-auto mb-5"
                    strokeWidth={1.5}
                  />

                  <h2 className="font-display text-2xl md:text-3xl font-semibold">
                    Inquiry sent.
                  </h2>

                  <p className="text-[#9A9A9F] mt-3 text-sm max-w-sm mx-auto leading-relaxed">
                    Thanks for reaching out — I usually reply within
                    24 hours.
                  </p>

                  <button
                    onClick={() => {
                      setForm({
                        name: "",
                        email: "",
                        company: "",
                        project_type: "",
                        budget: "",
                        message: "",
                      });

                      setState("idle");
                    }}
                    data-testid="contact-send-another"
                    className="mt-8 text-sm text-[#A970FF] hover:text-white transition-colors underline underline-offset-4"
                  >
                    Send another inquiry
                  </button>
                </div>
              </Reveal>
            ) : (
              <Reveal delay={0.1}>
                <form
                  onSubmit={submit}
                  className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-8"
                  data-testid="contact-form"
                >

                  {/* Name */}
                  <div>
                    <label
                      htmlFor="c-name"
                      className="text-[10px] tracking-[0.25em] uppercase text-[#9A9A9F]"
                    >
                      Name *
                    </label>

                    <input
                      id="c-name"
                      data-testid="contact-name-input"
                      required
                      value={form.name}
                      onChange={set("name")}
                      placeholder="Your name"
                      className={inputCls}
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label
                      htmlFor="c-email"
                      className="text-[10px] tracking-[0.25em] uppercase text-[#9A9A9F]"
                    >
                      Email *
                    </label>

                    <input
                      id="c-email"
                      data-testid="contact-email-input"
                      required
                      type="email"
                      value={form.email}
                      onChange={set("email")}
                      placeholder="you@brand.com"
                      className={inputCls}
                    />
                  </div>

                  {/* Company */}
                  <div>
                    <label
                      htmlFor="c-company"
                      className="text-[10px] tracking-[0.25em] uppercase text-[#9A9A9F]"
                    >
                      Company / Brand
                    </label>

                    <input
                      id="c-company"
                      data-testid="contact-company-input"
                      value={form.company}
                      onChange={set("company")}
                      placeholder="Brand name"
                      className={inputCls}
                    />
                  </div>

                  {/* Project Type */}
                  <div>
                    <label
                      htmlFor="c-type"
                      className="text-[10px] tracking-[0.25em] uppercase text-[#9A9A9F]"
                    >
                      Project Type
                    </label>

                    <select
                      id="c-type"
                      data-testid="contact-type-select"
                      value={form.project_type}
                      onChange={set("project_type")}
                      className={`${inputCls} jw-select appearance-none cursor-pointer`}
                    >
                      <option value="">
                        Select a type
                      </option>

                      {PROJECT_TYPES.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Budget */}
                  <div className="md:col-span-2">
                    <label
                      htmlFor="c-budget"
                      className="text-[10px] tracking-[0.25em] uppercase text-[#9A9A9F]"
                    >
                      Budget
                    </label>

                    <select
                      id="c-budget"
                      data-testid="contact-budget-select"
                      value={form.budget}
                      onChange={set("budget")}
                      className={`${inputCls} jw-select appearance-none cursor-pointer`}
                    >
                      <option value="">
                        Select a range
                      </option>

                      {BUDGETS.map((budget) => (
                        <option key={budget} value={budget}>
                          {budget}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Message */}
                  <div className="md:col-span-2">
                    <label
                      htmlFor="c-message"
                      className="text-[10px] tracking-[0.25em] uppercase text-[#9A9A9F]"
                    >
                      Message *
                    </label>

                    <textarea
                      id="c-message"
                      data-testid="contact-message-input"
                      required
                      rows={5}
                      value={form.message}
                      onChange={set("message")}
                      placeholder="Tell me about your project..."
                      className={`${inputCls} resize-none`}
                    />
                  </div>

                  {/* Error */}
                  {error && (
                    <p
                      className="md:col-span-2 text-sm text-red-400"
                      data-testid="contact-error"
                    >
                      {error}
                    </p>
                  )}

                  {/* Submit */}
                  <div className="md:col-span-2 pt-2">
                    <button
                      type="submit"
                      disabled={state === "sending"}
                      data-testid="contact-submit-button"
                      className="group inline-flex items-center gap-2.5 bg-[#6C19D9] hover:bg-[#8B35FF] disabled:opacity-50 text-white font-medium px-9 py-4 rounded-full transition-colors duration-300 hover:shadow-[0_0_40px_rgba(139,53,255,0.3)]"
                    >
                      {state === "sending"
                        ? "Sending..."
                        : "Send Inquiry"}

                      <Send
                        size={15}
                        className="transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-0.5"
                      />
                    </button>
                  </div>
                </form>
              </Reveal>
            )}
          </div>

          {/* =========================
              SIDE INFORMATION
          ========================= */}

          <div className="lg:col-span-5">
            <Reveal delay={0.2}>
              <div className="border border-white/10 p-8 md:p-10 bg-[#111116]/50">

                {/* Direct */}
                <p className="text-[10px] tracking-[0.25em] uppercase text-[#9A9A9F] mb-3">
                  Direct
                </p>

                <a
                  href={`mailto:${settings.email || ""}`}
                  data-testid="contact-email-link"
                  className="font-display text-xl md:text-2xl font-semibold hover:text-[#A970FF] transition-colors break-all"
                >
                  {settings.email || "hello@Jeghout.com"}
                </a>

                {/* Socials */}
                <p className="text-[10px] tracking-[0.25em] uppercase text-[#9A9A9F] mt-10 mb-4">
                  Socials
                </p>

                <div className="flex flex-col gap-4">
                  {socials.map((social) => {
                    const Icon = social.component;

                    return (
                      <a
                        key={social.label}
                        data-testid={social.tid}
                        href={social.href}
                        target="_blank"
                        rel="noreferrer"
                        className="group flex items-center gap-4 text-sm text-[#C8C8CC] hover:text-white transition-colors"
                      >
                        <span className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center group-hover:border-[#8B35FF] group-hover:text-[#A970FF] transition-colors">
                          <Icon size={15} />
                        </span>

                        {social.label}
                      </a>
                    );
                  })}
                </div>

                {/* Location */}
                <p className="text-[10px] tracking-[0.25em] uppercase text-[#9A9A9F] mt-10 mb-2">
                  Based in
                </p>

                <p className="text-sm text-[#C8C8CC]">
                  {settings.location || "Indonesia"} — working worldwide
                </p>

              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </main>
  );
}