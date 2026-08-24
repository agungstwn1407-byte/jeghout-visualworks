import React from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight, Play } from "lucide-react";
import { imgUrl, catLabel } from "@/lib/api";

/* =========================================================
   GET YOUTUBE VIDEO ID
========================================================= */

function getYouTubeVideoId(url) {
  if (!url) return null;

  try {
    const parsed = new URL(url);

    const hostname = parsed.hostname.toLowerCase();
    const pathname = parsed.pathname;

    /* =====================================================
       youtube.com/watch?v=VIDEO_ID
    ===================================================== */

    if (
      hostname === "youtube.com" ||
      hostname === "www.youtube.com" ||
      hostname === "m.youtube.com"
    ) {
      if (pathname === "/watch") {
        return parsed.searchParams.get("v");
      }

      /* ===================================================
         youtube.com/live/VIDEO_ID
      =================================================== */

      if (pathname.startsWith("/live/")) {
        return pathname
          .replace("/live/", "")
          .split("/")[0];
      }

      /* ===================================================
         youtube.com/shorts/VIDEO_ID
      =================================================== */

      if (pathname.startsWith("/shorts/")) {
        return pathname
          .replace("/shorts/", "")
          .split("/")[0];
      }

      /* ===================================================
         youtube.com/embed/VIDEO_ID
      =================================================== */

      if (pathname.startsWith("/embed/")) {
        return pathname
          .replace("/embed/", "")
          .split("/")[0];
      }
    }

    /* =====================================================
       youtu.be/VIDEO_ID
    ===================================================== */

    if (hostname === "youtu.be") {
      return pathname
        .replace("/", "")
        .split("/")[0];
    }

  } catch (error) {
    console.error(
      "Invalid YouTube URL:",
      error
    );
  }

  return null;
}

/* =========================================================
   GET YOUTUBE THUMBNAIL
========================================================= */

function getYouTubeThumbnail(url) {
  const videoId = getYouTubeVideoId(url);

  if (!videoId) {
    return null;
  }

  return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
}

/* =========================================================
   PROJECT CARD
========================================================= */

export default function ProjectCard({
  project,
}) {
  /* =======================================================
     COVER
  ======================================================= */

  const coverImage = imgUrl(project.cover);

  /* =======================================================
     YOUTUBE
  ======================================================= */

  const youtubeThumbnail =
    getYouTubeThumbnail(
      project.video_url
    );

  /*
   * Jika ada YouTube:
   * gunakan thumbnail YouTube.
   *
   * Jika tidak:
   * gunakan cover yang di-upload.
   */

  const previewImage =
    youtubeThumbnail || coverImage;

  return (
    <Link
      to={`/work/${project.slug}`}
      data-cursor="view"
      data-testid={`project-card-${project.slug}`}
      className="group block relative overflow-hidden bg-[#111116]"
      aria-label={`View project ${project.title}`}
    >

      {/* ===================================================
          PREVIEW IMAGE
      =================================================== */}

      <div className="relative w-full overflow-hidden bg-[#111116]">

        <img
          src={previewImage}
          alt={project.title}
          loading="lazy"
          className="
            block
            w-full
            h-auto
            object-contain
            transition-transform
            duration-700
            ease-[cubic-bezier(0.22,1,0.36,1)]
            group-hover:scale-[1.03]
          "
          onError={(event) => {

            /*
             * Jika thumbnail YouTube gagal,
             * gunakan cover upload.
             */

            if (
              youtubeThumbnail &&
              event.currentTarget.src !== coverImage
            ) {
              event.currentTarget.src =
                coverImage;
            }

          }}
        />

        {/* =================================================
            YOUTUBE PLAY BUTTON
        ================================================= */}

        {youtubeThumbnail && (
          <div
            className="
              absolute
              inset-0
              flex
              items-center
              justify-center
              pointer-events-none
            "
          >
            <div
              className="
                w-12
                h-12
                md:w-14
                md:h-14
                rounded-full
                bg-black/60
                backdrop-blur-sm
                border
                border-white/20
                flex
                items-center
                justify-center
                transition-all
                duration-500
                group-hover:scale-110
                group-hover:bg-[#6C19D9]/90
              "
            >
              <Play
                size={18}
                className="
                  text-white
                  ml-0.5
                  fill-white
                "
              />
            </div>
          </div>
        )}

        {/* =================================================
            HOVER GRADIENT
        ================================================= */}

        <div
          className="
            absolute
            inset-0
            bg-gradient-to-t
            from-[#08080B]/95
            via-[#08080B]/25
            to-transparent
            opacity-0
            group-hover:opacity-100
            transition-opacity
            duration-500
          "
        />

        {/* =================================================
            PROJECT INFORMATION
        ================================================= */}

        <div
          className="
            absolute
            inset-x-0
            bottom-0
            p-6
            md:p-8
            translate-y-4
            opacity-0
            group-hover:translate-y-0
            group-hover:opacity-100
            transition-all
            duration-500
            ease-[cubic-bezier(0.22,1,0.36,1)]
          "
        >

          {/* Category */}

          <p
            className="
              text-[11px]
              tracking-[0.22em]
              uppercase
              font-semibold
              text-[#A970FF]
              mb-2
            "
          >
            {catLabel(project.category)} —{" "}
            {project.year}
          </p>

          {/* Title + Arrow */}

          <div
            className="
              flex
              items-end
              justify-between
              gap-4
            "
          >

            <h3
              className="
                font-display
                text-xl
                md:text-2xl
                font-semibold
                text-white
                leading-snug
              "
            >
              {project.title}
            </h3>

            <ArrowUpRight
              size={20}
              className="
                text-[#A970FF]
                shrink-0
                mb-1
              "
            />

          </div>

        </div>

        {/* =================================================
            TOP PURPLE LINE
        ================================================= */}

        <div
          className="
            absolute
            top-0
            left-0
            w-full
            h-[2px]
            bg-gradient-to-r
            from-[#6C19D9]
            to-[#A970FF]
            scale-x-0
            group-hover:scale-x-100
            origin-left
            transition-transform
            duration-500
          "
        />

      </div>
    </Link>
  );
}