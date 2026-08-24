import React from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight, Play } from "lucide-react";
import { imgUrl, catLabel } from "@/lib/api";

/* =========================================================
   GET YOUTUBE THUMBNAIL
========================================================= */

function getYouTubeThumbnail(url) {
  if (!url) return null;

  try {
    const parsed = new URL(url);
    const hostname = parsed.hostname.toLowerCase();
    const pathname = parsed.pathname;

    let videoId = null;

    /* =========================
       youtube.com/watch?v=
    ========================= */

    if (hostname.includes("youtube.com")) {
      if (pathname === "/watch") {
        videoId = parsed.searchParams.get("v");
      }

      /* =========================
         youtube.com/live/VIDEO_ID
      ========================= */

      if (pathname.startsWith("/live/")) {
        videoId = pathname
          .replace("/live/", "")
          .split("/")[0];
      }

      /* =========================
         youtube.com/shorts/VIDEO_ID
      ========================= */

      if (pathname.startsWith("/shorts/")) {
        videoId = pathname
          .replace("/shorts/", "")
          .split("/")[0];
      }

      /* =========================
         youtube.com/embed/VIDEO_ID
      ========================= */

      if (pathname.startsWith("/embed/")) {
        videoId = pathname
          .replace("/embed/", "")
          .split("/")[0];
      }
    }

    /* =========================
       youtu.be/VIDEO_ID
    ========================= */

    if (hostname === "youtu.be") {
      videoId = pathname
        .replace("/", "")
        .split("/")[0];
    }

    if (!videoId) {
      return null;
    }

    return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
  } catch (error) {
    console.error("Invalid YouTube URL:", error);
    return null;
  }
}

/* =========================================================
   PROJECT CARD
========================================================= */

export default function ProjectCard({
  project,
  aspect = "aspect-[4/5]",
}) {
  const youtubeThumbnail = getYouTubeThumbnail(
    project.video_url
  );

  /*
   * Jika project memiliki YouTube:
   * gunakan thumbnail YouTube.
   *
   * Jika tidak:
   * gunakan cover yang di-upload.
   */

  const previewImage =
    youtubeThumbnail || imgUrl(project.cover);

  return (
    <Link
      to={`/work/${project.slug}`}
      data-cursor="view"
      data-testid={`project-card-${project.slug}`}
      className="group block relative overflow-hidden bg-[#111116]"
      aria-label={`View project ${project.title}`}
    >
      {/* =====================================================
          PROJECT PREVIEW
      ===================================================== */}

      <div
        className={`${aspect} overflow-hidden bg-[#111116] flex items-center justify-center`}
      >
        <img
          src={previewImage}
          alt={project.title}
          loading="lazy"
          className="w-full h-full object-contain transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.03]"
          onError={(event) => {
            /*
             * Jika thumbnail YouTube gagal,
             * kembali menggunakan cover upload.
             */

            if (
              youtubeThumbnail &&
              event.currentTarget.src !==
                imgUrl(project.cover)
            ) {
              event.currentTarget.src =
                imgUrl(project.cover);
            }
          }}
        />
      </div>

      {/* =====================================================
          YOUTUBE PLAY INDICATOR
      ===================================================== */}

      {youtubeThumbnail && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-black/60 backdrop-blur-sm border border-white/20 flex items-center justify-center transition-all duration-500 group-hover:scale-110 group-hover:bg-[#6C19D9]/90">
            <Play
              size={18}
              className="text-white ml-0.5 fill-white"
            />
          </div>
        </div>
      )}

      {/* =====================================================
          HOVER OVERLAY
      ===================================================== */}

      <div className="absolute inset-0 bg-gradient-to-t from-[#08080B]/95 via-[#08080B]/25 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      {/* =====================================================
          PROJECT INFORMATION
      ===================================================== */}

      <div className="absolute inset-x-0 bottom-0 p-6 md:p-8 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]">
        <p className="text-[11px] tracking-[0.22em] uppercase font-semibold text-[#A970FF] mb-2">
          {catLabel(project.category)} — {project.year}
        </p>

        <div className="flex items-end justify-between gap-4">
          <h3 className="font-display text-xl md:text-2xl font-semibold text-white leading-snug">
            {project.title}
          </h3>

          <ArrowUpRight
            size={20}
            className="text-[#A970FF] shrink-0 mb-1"
          />
        </div>
      </div>

      {/* =====================================================
          TOP ACCENT LINE
      ===================================================== */}

      <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-[#6C19D9] to-[#A970FF] scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-500" />
    </Link>
  );
}