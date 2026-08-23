import React from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import { useSettings, imgUrl } from "@/lib/api";
import { Reveal } from "@/components/Reveal";

const SKILLS = [
  "Graphic Design",
  "Brand Identity",
  "Photography",
  "Videography",
  "Photo Retouching",
  "Video Editing",
  "Motion Graphics",
  "Social Media Design",
];

const TOOLS = [
  "Adobe Photoshop",
  "Adobe Illustrator",
  "Adobe Premiere Pro",
  "Adobe Lightroom",
  "CorelDraw",
  "Canva",
  "CapCut",
];

const EXPERIENCE = [
  {
    period: "2023 — Now",
    role: "Freelance Graphic Designer",
    place: "Freelance / Independent",
    description:
      "Creating visual designs for branding, social media, promotional materials, and various client projects with a focus on clean and engaging visual communication.",
  },
  {
    period: "Apr 2026 — Now",
    role: "Videographer & Photographer",
    place: "Freelance / Independent",
    description:
      "Creating photo and video documentation for events, engagements, and portraits, while editing visual content according to each client's needs.",
  },
  {
    period: "Nov 2025 — Apr 2026",
    role: "Multimedia Intern",
    place: "Orik's Video Shooting",
    description:
      "Handled video shooting, video editing, and supporting graphic design materials using Adobe Premiere Pro, CapCut, CorelDraw, and Canva.",
  },
];

export default function About() {
  const s = useSettings();

  return (
    <main
      className="pt-36 md:pt-44 pb-24"
      data-testid="about-page"
    >
      <div className="max-w-[1440px] mx-auto px-6 md:px-12">

        {/* =========================
            ABOUT HEADER
        ========================= */}

        <Reveal y={20}>
          <p className="text-xs md:text-sm tracking-[0.25em] uppercase font-semibold text-[#A970FF] mb-6">
            About
          </p>
        </Reveal>

        <Reveal y={24} delay={0.08}>
          <h1 className="font-display text-4xl md:text-6xl lg:text-7xl font-bold tracking-tighter max-w-5xl leading-[1.05]">
            Designer. Visual Storyteller.{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#8B35FF] to-[#A970FF]">
              Creative Problem Solver.
            </span>
          </h1>
        </Reveal>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-14 mt-20 md:mt-28">

          {/* =========================
              PORTRAIT
          ========================= */}

          <div className="lg:col-span-5">
            <div className="lg:sticky lg:top-32">

              <Reveal>
                <div
                  className="overflow-hidden border border-white/10 aspect-[3/4] bg-[#111116]"
                  data-testid="about-portrait"
                >
                  {s.portrait ? (
                    <img
                      src={imgUrl(s.portrait)}
                      alt="Portrait of the creative designer"
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full bg-[radial-gradient(circle_at_30%_30%,rgba(108,25,217,0.35),#08080B_70%)]" />
                  )}
                </div>
              </Reveal>

              <Reveal delay={0.1}>
                <div className="flex justify-between mt-4 text-xs text-[#9A9A9F] tracking-[0.2em] uppercase">
                  <span>{s.brand_name}</span>
                  <span>{s.location}</span>
                </div>
              </Reveal>

            </div>
          </div>

          {/* =========================
              CONTENT
          ========================= */}

          <div className="lg:col-span-7">

            {/* BIO */}

            <Reveal>
              <p
                className="text-lg md:text-xl text-[#C8C8CC] leading-relaxed"
                data-testid="about-bio"
              >
                {s.about_bio ||
                  "I'm a creative designer, photographer and videographer helping brands and individuals communicate through strong visual storytelling. My work combines graphic design, photography, videography and video editing to create visuals that are clean, engaging and purposeful."}
              </p>
            </Reveal>

            <Reveal delay={0.1}>
              <p className="text-[#9A9A9F] leading-relaxed mt-6 max-w-2xl">
                With a background in Visual Communication Design, I enjoy
                turning ideas into visual experiences — from branding and
                social media content to photography, event documentation and
                video production. I believe good design should be intentional,
                adaptable and communicate clearly.
              </p>
            </Reveal>

            {/* =========================
                EXPERIENCE
            ========================= */}

            <Reveal delay={0.15}>
              <h2 className="font-display text-2xl md:text-3xl font-semibold mt-16 mb-8">
                Experience
              </h2>
            </Reveal>

            {EXPERIENCE.map((e, i) => (
              <Reveal
                key={`${e.period}-${e.role}`}
                delay={0.05 * i}
              >
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 py-7 border-b border-white/10 group">

                  {/* PERIOD */}

                  <span className="sm:col-span-3 text-xs tracking-[0.15em] text-[#9A9A9F] uppercase pt-1">
                    {e.period}
                  </span>

                  {/* EXPERIENCE CONTENT */}

                  <div className="sm:col-span-9">

                    <p className="font-medium text-[#F5F5F5] group-hover:text-[#A970FF] transition-colors">
                      {e.role}
                    </p>

                    <p className="text-sm text-[#9A9A9F] mt-1">
                      {e.place}
                    </p>

                    <p className="text-sm text-[#9A9A9F] leading-relaxed mt-3 max-w-2xl">
                      {e.description}
                    </p>

                  </div>

                </div>
              </Reveal>
            ))}

            {/* =========================
                SKILLS
            ========================= */}

            <Reveal delay={0.1}>
              <h2 className="font-display text-2xl md:text-3xl font-semibold mt-16 mb-8">
                Skills
              </h2>
            </Reveal>

            <div
              className="flex flex-wrap gap-3"
              data-testid="about-skills"
            >
              {SKILLS.map((sk, i) => (
                <Reveal
                  key={sk}
                  delay={0.04 * i}
                  y={14}
                >
                  <span className="inline-block border border-white/10 hover:border-[#8B35FF] rounded-full px-5 py-2.5 text-sm text-[#C8C8CC] hover:text-white transition-colors cursor-default">
                    {sk}
                  </span>
                </Reveal>
              ))}
            </div>

            {/* =========================
                TOOLS
            ========================= */}

            <Reveal delay={0.1}>
              <h2 className="font-display text-2xl md:text-3xl font-semibold mt-16 mb-8">
                Tools
              </h2>
            </Reveal>

            <div
              className="grid grid-cols-2 md:grid-cols-3 gap-px bg-white/10 border border-white/10"
              data-testid="about-tools"
            >
              {TOOLS.map((t) => (
                <div
                  key={t}
                  className="bg-[#08080B] hover:bg-[#111116] transition-colors px-5 py-6 text-sm text-[#C8C8CC]"
                >
                  {t}
                </div>
              ))}
            </div>

            {/* =========================
                CTA
            ========================= */}

            <Reveal delay={0.15}>
              <Link
                to="/contact"
                data-testid="about-cta"
                className="group inline-flex items-center gap-2.5 mt-16 bg-[#6C19D9] hover:bg-[#8B35FF] text-white font-medium px-8 py-4 rounded-full transition-colors duration-300"
              >
                Let's Work Together

                <ArrowUpRight
                  size={16}
                  className="transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1"
                />
              </Link>
            </Reveal>

          </div>
        </div>
      </div>
    </main>
  );
}