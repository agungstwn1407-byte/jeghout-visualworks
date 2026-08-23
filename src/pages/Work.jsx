import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { api } from "@/lib/api";
import { Reveal, EASE } from "@/components/Reveal";
import ProjectCard from "@/components/ProjectCard";

const ASPECTS = [
  "aspect-[4/5]",
  "aspect-[4/3]",
  "aspect-square",
  "aspect-[3/4]",
  "aspect-[16/10]",
  "aspect-[4/5]",
];

export default function Work() {
  const [projects, setProjects] = useState(null);
  const [cats, setCats] = useState([]);
  const [params, setParams] = useSearchParams();

  const filter = params.get("cat") || "all";

  useEffect(() => {
    /*
     * ==================================================
     * LOAD PROJECTS
     * ==================================================
     *
     * Backend mengembalikan:
     *
     * {
     *   value: [...],
     *   Count: 21
     * }
     *
     * Jadi kita ambil data dari r.data.value.
     */

    api
      .get("/projects")
      .then((r) => {
        const data = r.data;

        const projectList = Array.isArray(data)
          ? data
          : Array.isArray(data?.value)
            ? data.value
            : [];

        setProjects(projectList);
      })
      .catch((error) => {
        console.error("Failed to load projects:", error);
        setProjects([]);
      });

    /*
     * ==================================================
     * LOAD CATEGORIES
     * ==================================================
     */

    api
      .get("/categories")
      .then((r) => {
        const data = r.data;

        /*
         * Backend mengembalikan:
         *
         * {
         *   value: [...],
         *   Count: 6
         * }
         */

        const apiCategories = Array.isArray(data)
          ? data
          : Array.isArray(data?.value)
            ? data.value
            : [];

        /*
         * Pastikan Live Streaming selalu tersedia.
         */

        const hasLiveStreaming = apiCategories.some(
          (category) =>
            category.slug === "live-streaming"
        );

        if (!hasLiveStreaming) {
          apiCategories.push({
            slug: "live-streaming",
            name: "Live Streaming",
          });
        }

        setCats(apiCategories);
      })
      .catch((error) => {
        console.error(
          "Failed to load categories:",
          error
        );

        /*
         * Jika API categories gagal,
         * tetap tampilkan kategori default.
         */

        setCats([
          {
            slug: "graphic-design",
            name: "Graphic Design",
          },
          {
            slug: "photography",
            name: "Photography",
          },
          {
            slug: "video",
            name: "Video",
          },
          {
            slug: "branding",
            name: "Branding",
          },
          {
            slug: "social-media",
            name: "Social Media",
          },
          {
            slug: "live-streaming",
            name: "Live Streaming",
          },
        ]);
      });
  }, []);

  /*
   * ==================================================
   * FILTER PROJECTS
   * ==================================================
   */

  const filtered = useMemo(() => {
    if (!projects) {
      return [];
    }

    /*
     * Tampilkan semua project
     */

    if (filter === "all") {
      return projects;
    }

    /*
     * Filter berdasarkan slug kategori
     */

    return projects.filter(
      (project) =>
        project.category === filter
    );
  }, [projects, filter]);

  return (
    <main
      className="pt-36 md:pt-44 pb-24"
      data-testid="work-page"
    >
      <div className="max-w-[1440px] mx-auto px-6 md:px-12">

        {/* ==================================================
            HEADER
        ================================================== */}

        <Reveal y={20}>
          <p className="text-xs md:text-sm tracking-[0.25em] uppercase font-semibold text-[#A970FF] mb-5">
            Portfolio
          </p>
        </Reveal>

        <Reveal y={24} delay={0.08}>
          <h1 className="font-display text-4xl md:text-6xl lg:text-7xl font-bold tracking-tighter">
            Selected Work
          </h1>
        </Reveal>

        <Reveal y={20} delay={0.16}>
          <p className="text-[#9A9A9F] mt-5 max-w-lg text-sm md:text-base leading-relaxed">
            Branding, graphic design, photography,
            videography, live streaming and film —
            every project crafted with intention.
          </p>
        </Reveal>

        {/* ==================================================
            FILTERS
        ================================================== */}

        <Reveal y={16} delay={0.22}>
          <div
            className="flex flex-wrap gap-x-8 gap-y-4 mt-14 mb-14"
            role="tablist"
            aria-label="Filter projects by category"
          >
            {[
              {
                slug: "all",
                name: "All",
              },
              ...cats,
            ].map((category) => {
              const active =
                filter === category.slug;

              return (
                <button
                  key={category.slug}
                  type="button"
                  data-testid={`filter-${category.slug}`}
                  role="tab"
                  aria-selected={active}
                  onClick={() => {
                    if (
                      category.slug === "all"
                    ) {
                      setParams({});
                    } else {
                      setParams({
                        cat: category.slug,
                      });
                    }
                  }}
                  className={`relative text-xs md:text-sm tracking-[0.18em] uppercase font-semibold pb-2 transition-colors duration-300 ${
                    active
                      ? "text-white"
                      : "text-[#9A9A9F] hover:text-[#C8C8CC]"
                  }`}
                >
                  {category.name}

                  {active && (
                    <motion.span
                      layoutId="cat-underline"
                      className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[#6C19D9] to-[#A970FF]"
                      transition={{
                        duration: 0.4,
                        ease: EASE,
                      }}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </Reveal>

        {/* ==================================================
            PROJECT GRID
        ================================================== */}

        {projects === null ? (

          /*
           * ==================================================
           * LOADING STATE
           * ==================================================
           */

          <div
            className="columns-1 sm:columns-2 lg:columns-3 gap-6"
            data-testid="work-loading"
          >
            {ASPECTS.map(
              (aspect, index) => (
                <div
                  key={index}
                  className={`mb-6 break-inside-avoid bg-[#111116] animate-pulse ${aspect}`}
                />
              )
            )}
          </div>

        ) : filtered.length === 0 ? (

          /*
           * ==================================================
           * EMPTY STATE
           * ==================================================
           */

          <div
            className="py-28 text-center"
            data-testid="work-empty"
          >
            <p className="font-display text-2xl text-[#C8C8CC]">
              New projects are coming soon.
            </p>

            <p className="text-[#9A9A9F] text-sm mt-3">
              Try another category in the meantime.
            </p>
          </div>

        ) : (

          /*
           * ==================================================
           * PROJECT GRID
           * ==================================================
           */

          <div
            className="columns-1 sm:columns-2 lg:columns-3 gap-6"
            data-testid="work-grid"
          >
            <AnimatePresence mode="popLayout">
              {filtered.map(
                (project, index) => (
                  <motion.div
                    key={project.id}
                    initial={{
                      opacity: 0,
                      scale: 0.96,
                    }}
                    animate={{
                      opacity: 1,
                      scale: 1,
                    }}
                    exit={{
                      opacity: 0,
                      scale: 0.96,
                    }}
                    transition={{
                      duration: 0.5,
                      ease: EASE,
                      delay:
                        index * 0.04,
                    }}
                    className="mb-6 break-inside-avoid"
                  >
                    <ProjectCard
                      project={project}
                      aspect={
                        ASPECTS[
                          index %
                            ASPECTS.length
                        ]
                      }
                    />
                  </motion.div>
                )
              )}
            </AnimatePresence>
          </div>
        )}
      </div>
    </main>
  );
}