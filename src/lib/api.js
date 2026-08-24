import axios from "axios";
import { useEffect, useState } from "react";

/**
 * =========================================================
 * BACKEND URL
 * =========================================================
 *
 * LOCAL:
 *   http://localhost:5173
 *   -> backend otomatis ke http://127.0.0.1:8000
 *
 * VERCEL:
 *   Gunakan VITE_BACKEND_URL dari Environment Variables.
 *
 * Contoh:
 *   VITE_BACKEND_URL=https://backend-domain-kamu.vercel.app
 *
 */

const ENV_BACKEND_URL =
  import.meta.env.VITE_BACKEND_URL?.trim() || "";

export const BACKEND_URL =
  ENV_BACKEND_URL ||
  (import.meta.env.DEV
    ? "http://127.0.0.1:8000"
    : "");


/**
 * =========================================================
 * AXIOS INSTANCE
 * =========================================================
 */

export const api = axios.create({
  baseURL: `${BACKEND_URL}/api`,
  timeout: 15000,
});


/**
 * =========================================================
 * AUTH TOKEN
 * =========================================================
 */

api.interceptors.request.use(
  (config) => {
    const token =
      localStorage.getItem("jv_token");

    if (token) {
      config.headers =
        config.headers || {};

      config.headers.Authorization =
        `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);


/**
 * =========================================================
 * RESPONSE INTERCEPTOR
 * =========================================================
 *
 * Jika token sudah expired / tidak valid,
 * hapus token agar user bisa login kembali.
 */

api.interceptors.response.use(
  (response) => response,

  (error) => {
    if (error?.response?.status === 401) {
      const requestUrl =
        error?.config?.url || "";

      // Jangan menghapus token saat request login gagal.
      if (!requestUrl.includes("/auth/login")) {
        localStorage.removeItem("jv_token");
      }
    }

    return Promise.reject(error);
  }
);


/**
 * =========================================================
 * IMAGE URL
 * =========================================================
 */

export const imgUrl = (path) => {
  if (!path) {
    return "";
  }

  if (
    path.startsWith("http://") ||
    path.startsWith("https://") ||
    path.startsWith("data:")
  ) {
    return path;
  }

  // Pastikan tidak menghasilkan //
  if (
    BACKEND_URL.endsWith("/") &&
    path.startsWith("/")
  ) {
    return `${BACKEND_URL}${path.slice(1)}`;
  }

  if (
    !BACKEND_URL.endsWith("/") &&
    !path.startsWith("/")
  ) {
    return `${BACKEND_URL}/${path}`;
  }

  return `${BACKEND_URL}${path}`;
};


/**
 * =========================================================
 * API ERROR FORMATTER
 * =========================================================
 */

export function formatApiError(error) {
  const responseData =
    error?.response?.data;

  const detail =
    responseData?.detail;

  if (typeof detail === "string") {
    return detail;
  }

  if (Array.isArray(detail)) {
    return detail
      .map(
        (item) =>
          item?.msg ||
          JSON.stringify(item)
      )
      .join(" ");
  }

  if (
    responseData &&
    typeof responseData === "string"
  ) {
    return responseData;
  }

  if (error?.code === "ERR_NETWORK") {
    return (
      "Backend tidak dapat dihubungi. " +
      "Pastikan FastAPI berjalan di " +
      "http://127.0.0.1:8000"
    );
  }

  return (
    error?.message ||
    "Something went wrong"
  );
}


/**
 * =========================================================
 * DEFAULT SETTINGS
 * =========================================================
 */

const DEFAULT_SETTINGS = {
  brand_name:
    "Jeghout Visualworks",

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

  about_bio:
    "",
};


/**
 * =========================================================
 * SETTINGS HOOK
 * =========================================================
 */

export function useSettings() {
  const [settings, setSettings] =
    useState(DEFAULT_SETTINGS);

  useEffect(() => {
    let mounted = true;

    api
      .get("/settings")
      .then((response) => {
        if (!mounted) {
          return;
        }

        setSettings({
          ...DEFAULT_SETTINGS,
          ...(response.data || {}),
        });
      })
      .catch((error) => {
        console.error(
          "Failed to load settings:",
          error
        );
      });

    return () => {
      mounted = false;
    };
  }, []);

  return settings;
}


/**
 * =========================================================
 * CATEGORY LABELS
 * =========================================================
 */

export const CATEGORY_LABELS = {
  "graphic-design":
    "Graphic Design",

  photography:
    "Photography",

  video:
    "Video",

  branding:
    "Branding",

  "social-media":
    "Social Media",

  "live-streaming":
    "Live Streaming",
};


/**
 * =========================================================
 * CATEGORY HELPER
 * =========================================================
 */

export const catLabel = (slug) => {
  return (
    CATEGORY_LABELS[slug] ||
    slug
  );
};


/**
 * =========================================================
 * DEBUG INFO
 * =========================================================
 *
 * Akan terlihat di browser console.
 */

if (import.meta.env.DEV) {
  console.log(
    "[Jeghout API]",
    BACKEND_URL
  );

  console.log(
    "[Jeghout API Base]",
    `${BACKEND_URL}/api`
  );
}