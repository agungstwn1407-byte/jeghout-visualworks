import React from "react";
import { Link } from "react-router-dom";
import { useSettings } from "@/lib/api";

function InstagramIcon({ size = 16 }) {
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
      <circle
        cx="17.5"
        cy="6.5"
        r="1"
        fill="currentColor"
      />
    </svg>
  );
}

function BehanceIcon({ size = 16 }) {
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

function LinkedinIcon({ size = 16 }) {
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

function MailIcon({ size = 16 }) {
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

export default function Footer() {
  const s = useSettings();

  const settings = s || {};

  return (
    <footer
      data-testid="footer"
      className="relative border-t border-white/10 mt-8"
    >
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#6C19D9] to-transparent" />

      <div className="max-w-[1440px] mx-auto px-6 md:px-12 py-16 md:py-20">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12">

          {/* Brand */}
          <div className="md:col-span-5">
            <p className="font-display font-bold text-2xl">
              Jeghout
              <span className="text-[#8B35FF]">.</span>
            </p>

            <p className="text-[#9A9A9F] text-sm mt-3 max-w-xs leading-relaxed">
              {settings.tagline ||
                "Crafting bold, meaningful visual experiences."}
            </p>
          </div>

          {/* Navigation */}
          <div className="md:col-span-3">
            <p className="text-xs tracking-[0.2em] uppercase text-[#9A9A9F] mb-5">
              Navigate
            </p>

            <div className="flex flex-col gap-3">
              {["Work", "About", "Services", "Contact"].map((label) => (
                <Link
                  key={label}
                  to={`/${label.toLowerCase()}`}
                  className="text-sm text-[#C8C8CC] hover:text-white transition-colors w-fit"
                >
                  {label}
                </Link>
              ))}
            </div>
          </div>

          {/* Connect */}
          <div className="md:col-span-4">
            <p className="text-xs tracking-[0.2em] uppercase text-[#9A9A9F] mb-5">
              Connect
            </p>

            <div className="flex items-center gap-4">

              {/* Instagram */}
              <a
                data-testid="social-instagram"
                href={settings.instagram || "#"}
                target="_blank"
                rel="noreferrer"
                aria-label="Instagram"
                className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-[#C8C8CC] hover:text-white hover:border-[#8B35FF] transition-colors"
              >
                <InstagramIcon size={16} />
              </a>

              {/* Behance */}
              <a
                data-testid="social-behance"
                href={settings.behance || "#"}
                target="_blank"
                rel="noreferrer"
                aria-label="Behance"
                className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-[#C8C8CC] hover:text-white hover:border-[#8B35FF] transition-colors"
              >
                <BehanceIcon size={16} />
              </a>

              {/* LinkedIn */}
              <a
                data-testid="social-linkedin"
                href={settings.linkedin || "#"}
                target="_blank"
                rel="noreferrer"
                aria-label="LinkedIn"
                className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-[#C8C8CC] hover:text-white hover:border-[#8B35FF] transition-colors"
              >
                <LinkedinIcon size={16} />
              </a>

              {/* Email */}
              <a
                data-testid="social-email"
                href={`mailto:${settings.email || ""}`}
                aria-label="Email"
                className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-[#C8C8CC] hover:text-white hover:border-[#8B35FF] transition-colors"
              >
                <MailIcon size={16} />
              </a>

            </div>

            {/* Email */}
            {settings.email && (
              <a
                href={`mailto:${settings.email}`}
                className="block mt-5 text-sm text-[#C8C8CC] hover:text-[#A970FF] transition-colors"
              >
                {settings.email}
              </a>
            )}
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-14 pt-6 border-t border-white/5 flex flex-col md:flex-row justify-between gap-3 text-xs text-[#9A9A9F]">
          <p>
            © 2026 {settings.brand_name || "Jeghout"}. All Rights Reserved.
          </p>

          <p>
            {settings.location || "Indonesia"}
          </p>
        </div>
      </div>
    </footer>
  );
}