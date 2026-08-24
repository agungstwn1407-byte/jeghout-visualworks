import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight } from "lucide-react";

import { api, imgUrl, catLabel } from "@/lib/api";
import { Reveal, RevealImage, EASE } from "@/components/Reveal";
import ProjectCard from "@/components/ProjectCard";

/* =========================================================
   VIDEO EMBED URL
   Supports:
   - YouTube
   - YouTube Live
   - YouTube Shorts
   - youtu.be
   - Vimeo
   - Google Drive
========================================================= */

function embedUrl(url) {
  if (!url) return null;

  const value = String(url).trim();

  try {
    const parsed = new URL(value);
    const hostname = parsed.hostname.toLowerCase();
    const pathname = parsed.pathname;

    /* =====================================================
       YOUTUBE
    ===================================================== */

    if (
      hostname === "youtube.com" ||
      hostname === "www.youtube.com" ||
      hostname === "m.youtube.com"
    ) {
      /* Normal YouTube */
      if (pathname === "/watch") {
        const videoId = parsed.searchParams.get("v");

        if (videoId) {
          return `https://www.youtube.com/embed/${videoId}`;
        }
      }

      /* YouTube Live */
      if (pathname.startsWith("/live/")) {
        const videoId = pathname
          .replace("/live/", "")
          .split("/")[0];

        if (videoId) {
          return `https://www.youtube.com/embed/${videoId}`;
        }
      }

      /* YouTube Shorts */
      if (pathname.startsWith("/shorts/")) {
        const videoId = pathname
          .replace("/shorts/", "")
          .split("/")[0];

        if (videoId) {
          return `https://www.youtube.com/embed/${videoId}`;
        }
      }

      /* YouTube Embed */
      if (pathname.startsWith("/embed/")) {
        return value;
      }
    }

    /* =====================================================
       YOUTUBE SHORT URL
       https://youtu.be/VIDEO_ID
    ===================================================== */

    if (hostname === "youtu.be") {
      const videoId = pathname
        .replace("/", "")
        .split("/")[0];

      if (videoId) {
        return `https://www.youtube.com/embed/${videoId}`;
      }
    }

    /* =====================================================
       VIMEO
       https://vimeo.com/123456789
    ===================================================== */

    if (
      hostname === "vimeo.com" ||
      hostname.endsWith(".vimeo.com")
    ) {
      const parts = pathname
        .split("/")
        .filter(Boolean);

      const videoId = parts[parts.length - 1];

      if (
        videoId &&
        /^\d+$/.test(videoId)
      ) {
        return `https://player.vimeo.com/video/${videoId}`;
      }
    }

    /* =====================================================
       GOOGLE DRIVE
       https://drive.google.com/file/d/FILE_ID/preview
    ===================================================== */

    if (hostname === "drive.google.com") {
      const match = value.match(
        /\/file\/d\/([^/]+)/
      );

      if (match?.[1]) {
        return `https://drive.google.com/file/d/${match[1]}/preview`;
      }
    }
  } catch (error) {
    console.error(
      "Invalid video URL:",
      error
    );
  }

  return null;
}

/* =========================================================
   PROJECT DETAIL
========================================================= */

export default function ProjectDetail() {
  const { slug } = useParams();

  /*
   * undefined = loading
   * null = project not found
   * object = project ditemukan
   */

  const [p, setP] = useState(undefined);

  /* =======================================================
     LOAD PROJECT
  ======================================================= */

  useEffect(() => {
    setP(undefined);

    api
      .get(`/projects/${slug}`)
      .then((response) => {
        setP(response.data);
      })
      .catch((error) => {
        console.error(
          "Failed to load project:",
          error
        );

        setP(null);
      });
  }, [slug]);

  /* =======================================================
     PAGE TITLE
  ======================================================= */

  useEffect(() => {
    if (p) {
      document.title =
        p.seo_title ||
        `${p.title} — Jeghout Visualworks`;
    }

    return () => {
      document.title =
        "Jeghout Visualworks";
    };
  }, [p]);

  /* =======================================================
     LOADING
  ======================================================= */

  if (p === undefined) {
    return (
      <main
        className="
          pt-40
          pb-24
          max-w-[1440px]
          mx-auto
          px-6
          md:px-12
        "
        data-testid="project-loading"
      >
        <div
          className="
            h-4
            w-40
            bg-[#111116]
            animate-pulse
            mb-6
          "
        />

        <div
          className="
            h-14
            w-2/3
            bg-[#111116]
            animate-pulse
            mb-14
          "
        />

        <div
          className="
            w-full
            h-[50vh]
            bg-[#111116]
            animate-pulse
          "
        />
      </main>
    );
  }

  /* =======================================================
     PROJECT NOT FOUND
  ======================================================= */

  if (p === null) {
    return (
      <main
        className="
          pt-44
          pb-32
          text-center
          px-6
        "
        data-testid="project-not-found"
      >
        <p
          className="
            font-display
            text-6xl
            md:text-8xl
            font-bold
            text-stroke
          "
        >
          404
        </p>

        <h1
          className="
            font-display
            text-2xl
            md:text-3xl
            font-semibold
            mt-6
          "
        >
          Project not found
        </h1>

        <p
          className="
            text-[#9A9A9F]
            mt-3
            text-sm
          "
        >
          It may have been unpublished
          or removed.
        </p>

        <Link
          to="/work"
          className="
            inline-flex
            items-center
            gap-2
            mt-8
            text-sm
            text-[#A970FF]
            hover:text-white
            transition-colors
          "
        >
          <ArrowLeft size={15} />
          Back to all work
        </Link>
      </main>
    );
  }

  /* =======================================================
     VIDEO
  ======================================================= */

  const video = embedUrl(p.video_url);

  /*
   * Detect Google Drive.
   */

  const isGoogleDriveVideo =
    video?.includes("drive.google.com");

  /*
   * Metadata video.
   */

  const videoWidth =
    Number(p.video_width);

  const videoHeight =
    Number(p.video_height);

  const parsedAspectRatio =
    p.video_aspect_ratio ||
    (
      videoWidth > 0 &&
      videoHeight > 0
        ? `${videoWidth} / ${videoHeight}`
        : null
    );

  /*
   * Google Drive selalu menggunakan 16:9.
   *
   * Ini mencegah metadata backend yang salah
   * membuat frame menjadi terlalu pendek.
   */

  const videoAspectRatio =
    isGoogleDriveVideo
      ? "16 / 9"
      : parsedAspectRatio || "16 / 9";

  /* =======================================================
     MAIN
  ======================================================= */

  return (
    <main
      className="pb-24"
      data-testid="project-detail"
    >
      {/* ===================================================
          HEADER
      =================================================== */}

      <div
        className="
          max-w-[1440px]
          mx-auto
          px-6
          md:px-12
          pt-36
          md:pt-44
        "
      >
        {/* BACK */}

        <motion.div
          initial={{
            opacity: 0,
            y: 16,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: 0.6,
            ease: EASE,
          }}
        >
          <Link
            to="/work"
            data-testid="back-to-work"
            className="
              inline-flex
              items-center
              gap-2
              text-xs
              tracking-[0.2em]
              uppercase
              text-[#9A9A9F]
              hover:text-white
              transition-colors
              mb-10
            "
          >
            <ArrowLeft size={14} />
            All Work
          </Link>
        </motion.div>

        {/* CATEGORY */}

        <motion.p
          initial={{
            opacity: 0,
            y: 20,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            delay: 0.08,
            duration: 0.6,
            ease: EASE,
          }}
          className="
            text-xs
            md:text-sm
            tracking-[0.25em]
            uppercase
            font-semibold
            text-[#A970FF]
          "
        >
          {catLabel(p.category)} — {p.year}
        </motion.p>

        {/* TITLE */}

        <motion.h1
          initial={{
            opacity: 0,
            y: 20,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            delay: 0.16,
            duration: 0.7,
            ease: EASE,
          }}
          className="
            font-display
            text-4xl
            md:text-6xl
            lg:text-7xl
            font-bold
            tracking-tighter
            mt-4
            max-w-4xl
            leading-[1.05]
          "
          data-testid="project-title"
        >
          {p.title}
        </motion.h1>

        {/* PROJECT META */}

        <motion.div
          initial={{
            opacity: 0,
            y: 20,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            delay: 0.26,
            duration: 0.7,
            ease: EASE,
          }}
          className="
            grid
            grid-cols-2
            md:grid-cols-4
            gap-8
            mt-12
            pb-12
            border-b
            border-white/10
          "
          data-testid="project-meta"
        >
          {/* CLIENT */}

          <div>
            <p
              className="
                text-[10px]
                tracking-[0.25em]
                uppercase
                text-[#9A9A9F]
                mb-2
              "
            >
              Client
            </p>

            <p
              className="
                text-sm
                text-[#F5F5F5]
              "
            >
              {p.client || "—"}
            </p>
          </div>

          {/* YEAR */}

          <div>
            <p
              className="
                text-[10px]
                tracking-[0.25em]
                uppercase
                text-[#9A9A9F]
                mb-2
              "
            >
              Year
            </p>

            <p
              className="
                text-sm
                text-[#F5F5F5]
              "
            >
              {p.year || "—"}
            </p>
          </div>

          {/* ROLE */}

          <div>
            <p
              className="
                text-[10px]
                tracking-[0.25em]
                uppercase
                text-[#9A9A9F]
                mb-2
              "
            >
              My Role
            </p>

            <p
              className="
                text-sm
                text-[#F5F5F5]
              "
            >
              {p.role || "—"}
            </p>
          </div>

          {/* TOOLS */}

          <div>
            <p
              className="
                text-[10px]
                tracking-[0.25em]
                uppercase
                text-[#9A9A9F]
                mb-2
              "
            >
              Tools
            </p>

            <div
              className="
                flex
                flex-wrap
                gap-1.5
              "
            >
              {(p.tools || []).map(
                (tool) => (
                  <span
                    key={tool}
                    className="
                      text-[11px]
                      border
                      border-white/10
                      rounded-full
                      px-2.5
                      py-1
                      text-[#C8C8CC]
                    "
                  >
                    {tool}
                  </span>
                )
              )}
            </div>
          </div>
        </motion.div>
      </div>

      {/* ===================================================
          HERO / COVER
      =================================================== */}

      <div
        className="
          max-w-[1440px]
          mx-auto
          px-6
          md:px-12
          mt-14
        "
      >
        <div
          className="
            overflow-hidden
            bg-[#111116]
          "
          data-testid="project-hero-image"
        >
          <motion.img
            src={imgUrl(p.cover)}
            alt={p.title}
            className="
              block
              w-full
              h-auto
              object-contain
            "
            initial={{
              opacity: 0,
              scale: 1.02,
            }}
            animate={{
              opacity: 1,
              scale: 1,
            }}
            transition={{
              duration: 0.8,
              ease: EASE,
            }}
          />
        </div>
      </div>

      {/* ===================================================
          PROJECT OVERVIEW
      =================================================== */}

      <div
        className="
          max-w-[1440px]
          mx-auto
          px-6
          md:px-12
          mt-20
          grid
          grid-cols-1
          md:grid-cols-12
          gap-10
        "
      >
        <Reveal className="md:col-span-4">
          <p
            className="
              text-xs
              tracking-[0.25em]
              uppercase
              font-semibold
              text-[#A970FF]
            "
          >
            Project Overview
          </p>
        </Reveal>

        <Reveal
          delay={0.1}
          className="md:col-span-8"
        >
          <p
            className="
              text-lg
              md:text-xl
              text-[#C8C8CC]
              leading-relaxed
              max-w-3xl
            "
            data-testid="project-description"
          >
            {p.description}
          </p>
        </Reveal>
      </div>

      {/* ===================================================
          VIDEO
      =================================================== */}

      {video && (
        <div
          className="
            max-w-[1440px]
            mx-auto
            px-6
            md:px-12
            mt-20
          "
        >
          <Reveal>
            <div
              className="
                relative
                w-full
                bg-[#111116]
                border
                border-white/10
                overflow-hidden
              "
              style={{
                aspectRatio: videoAspectRatio,
              }}
              data-testid="project-video"
            >
              {isGoogleDriveVideo ? (
                /*
                 * GOOGLE DRIVE
                 *
                 * Iframe dibuat sedikit lebih tinggi
                 * agar player Drive tidak memotong
                 * bagian bawah video.
                 */

                <iframe
                  src={video}
                  title={`${p.title} video`}
                  className="
                    absolute
                    left-0
                    top-[-1px]
                    w-full
                    h-[calc(100%+2px)]
                    border-0
                  "
                  loading="lazy"
                  allow="
                    accelerometer;
                    autoplay;
                    clipboard-write;
                    encrypted-media;
                    gyroscope;
                    picture-in-picture;
                    fullscreen
                  "
                  allowFullScreen
                />
              ) : (
                /*
                 * YOUTUBE / VIMEO
                 */

                <iframe
                  src={video}
                  title={`${p.title} video`}
                  className="
                    absolute
                    inset-0
                    w-full
                    h-full
                    border-0
                  "
                  loading="lazy"
                  allow="
                    accelerometer;
                    autoplay;
                    clipboard-write;
                    encrypted-media;
                    gyroscope;
                    picture-in-picture;
                    fullscreen
                  "
                  allowFullScreen
                />
              )}
            </div>
          </Reveal>
        </div>
      )}

      {/* ===================================================
          GALLERY
      =================================================== */}

      {p.gallery?.length > 0 && (
        <div
          className="
            max-w-[1440px]
            mx-auto
            px-6
            md:px-12
            mt-20
          "
          data-testid="project-gallery"
        >
          <div
            className="
              columns-2
              gap-3
              md:gap-6
            "
          >
            {p.gallery.map(
              (image, index) => (
                <div
                  key={index}
                  className="
                    break-inside-avoid
                    mb-3
                    md:mb-6
                  "
                >
                  <RevealImage
                    src={imgUrl(image)}
                    alt={`${p.title} — image ${index + 1}`}
                    className="
                      block
                      w-full
                      h-auto
                      object-contain
                    "
                  />
                </div>
              )
            )}
          </div>
        </div>
      )}

      {/* ===================================================
          MORE PROJECTS
      =================================================== */}

      {p.related?.length > 0 && (
        <div
          className="
            max-w-[1440px]
            mx-auto
            px-6
            md:px-12
            mt-28
            md:mt-36
          "
          data-testid="more-projects"
        >
          <div
            className="
              flex
              items-end
              justify-between
              mb-12
            "
          >
            <h2
              className="
                font-display
                text-3xl
                md:text-5xl
                font-bold
                tracking-tighter
              "
            >
              More Projects
            </h2>

            <Link
              to="/work"
              data-testid="view-all-link"
              className="
                group
                hidden
                sm:inline-flex
                items-center
                gap-2
                text-sm
                text-[#C8C8CC]
                hover:text-white
                transition-colors
              "
            >
              View All Projects

              <ArrowRight
                size={15}
                className="
                  text-[#A970FF]
                  transition-transform
                  duration-300
                  group-hover:translate-x-1.5
                "
              />
            </Link>
          </div>

          <div
            className="
              grid
              grid-cols-1
              md:grid-cols-3
              gap-6
            "
          >
            {p.related
              .slice(0, 3)
              .map(
                (related, index) => (
                  <Reveal
                    key={related.id}
                    delay={index * 0.1}
                  >
                    <ProjectCard
                      project={related}
                      aspect="aspect-[4/3]"
                    />
                  </Reveal>
                )
              )}
          </div>
        </div>
      )}
    </main>
  );
}