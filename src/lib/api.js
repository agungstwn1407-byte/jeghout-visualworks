import axios from "axios";
import { useEffect, useState } from "react";

/*
 * Vite menggunakan import.meta.env
 * bukan process.env
 *
 * Buat file .env di root project jika ingin menggunakan backend:
 *
 * VITE_BACKEND_URL=http://localhost:8000
 */

export const BACKEND_URL =
  import.meta.env.VITE_BACKEND_URL || "http://localhost:8000";

export const api = axios.create({
  baseURL: `${BACKEND_URL}/api`,
  timeout: 10000,
});

/*
 * Attach authentication token
 */
api.interceptors.request.use(
  (cfg) => {
    const token = localStorage.getItem("jv_token");

    if (token) {
      cfg.headers = cfg.headers || {};
      cfg.headers.Authorization = `Bearer ${token}`;
    }

    return cfg;
  },
  (error) => Promise.reject(error)
);

/*
 * Image URL helper
 */
export const imgUrl = (p) => {
  if (!p) return "";

  if (p.startsWith("http")) {
    return p;
  }

  return `${BACKEND_URL}${p}`;
};

/*
 * API error formatter
 */
export function formatApiError(err) {
  const detail = err?.response?.data?.detail;

  if (typeof detail === "string") {
    return detail;
  }

  if (Array.isArray(detail)) {
    return detail
      .map((e) => e?.msg || JSON.stringify(e))
      .join(" ");
  }

  return err?.message || "Something went wrong";
}

/*
 * Default website settings
 */
const DEFAULT_SETTINGS = {
  brand_name: "Jeghout Visualworks",

  tagline:
    "Creative Designer, Photographer & Video Editor",

  email:
    "hello@visualworks.id",

  instagram:
    "https://instagram.com/Jeghout.visualworks",

  behance:
    "https://behance.net/Jeghout",

  linkedin:
    "https://linkedin.com/in/Jeghout",

  location:
    "Jakarta, Indonesia",

  portrait:
    "",
};

/*
 * Website settings hook
 */
export function useSettings() {
  const [settings, setSettings] =
    useState(DEFAULT_SETTINGS);

  useEffect(() => {
    let mounted = true;

    api
      .get("/settings")
      .then((response) => {
        if (!mounted) return;

        setSettings({
          ...DEFAULT_SETTINGS,
          ...(response.data || {}),
        });
      })
      .catch(() => {
        /*
         * Backend unavailable.
         *
         * Keep DEFAULT_SETTINGS so the frontend
         * can still render normally.
         */
      });

    return () => {
      mounted = false;
    };
  }, []);

  return settings;
}

/*
 * Portfolio categories
 */
export const CATEGORY_LABELS = {
  "graphic-design": "Graphic Design",
  photography: "Photography",
  video: "Video",
  branding: "Branding",
  "social-media": "Social Media",

  // NEW CATEGORY
  "live-streaming": "Live Streaming",
};

/*
 * Convert category slug to readable label
 */
export const catLabel = (slug) => {
  return CATEGORY_LABELS[slug] || slug;
};