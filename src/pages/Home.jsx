import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { ArrowRight, ArrowUpRight, ArrowDown } from "lucide-react";
import { api, imgUrl, catLabel } from "@/lib/api";
import { Reveal, EASE } from "@/components/Reveal";
import ProjectCard from "@/components/ProjectCard";
import Marquee from "@/components/Marquee";

const HEADLINE = ["Creative Visuals", "That Make Brands", "Stand Out."];
const GRID_SPANS = [
  { span: "md:col-span-7", aspect: "aspect-[4/3]" },
  { span: "md:col-span-5", aspect: "aspect-[4/5]" },
  { span: "md:col-span-5", aspect: "aspect-square" },
  { span: "md:col-span-7", aspect: "aspect-[16/10]" },
  { span: "md:col-span-6", aspect: "aspect-[4/3]" },
  { span: "md:col-span-6", aspect: "aspect-[4/5]" },
];

const CHAPTERS = [
  { n: "01", title: "Design That Speaks", desc: "Brand identities, posters and social visuals built on strong typography and intentional restraint — every element earns its place." },
  { n: "02", title: "Frames With Feeling", desc: "Portrait, product and editorial photography shot with cinematic light and graded in deep, quiet tones." },
  { n: "03", title: "Stories In Motion", desc: "Video editing and motion graphics with rhythm-driven cuts, seamless transitions and premium color." },
];

function ParallaxThumb({ src, alt, className, mx, my, factor, delay }) {
  const x = useTransform(mx, (v) => v * factor);
  const y = useTransform(my, (v) => v * factor);
  return (
    <motion.div
      initial={{ opacity: 0, y: 40, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay, duration: 0.9, ease: EASE }}
      style={{ x, y }}
      className={`absolute overflow-hidden shadow-2xl shadow-black/60 border border-white/10 ${className}`}
    >
      <img src={src} alt={alt} className="w-full h-full object-cover" loading="eager" />
    </motion.div>
  );
}

export default function Home() {
  const [featured, setFeatured] = useState(null);
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const smx = useSpring(mx, { stiffness: 50, damping: 20 });
  const smy = useSpring(my, { stiffness: 50, damping: 20 });

  useEffect(() => {
    api.get("/projects", { params: { featured: true, limit: 6 } }).then((r) => setFeatured(r.data)).catch(() => setFeatured([]));
  }, []);

  const onMouseMove = (e) => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const r = e.currentTarget.getBoundingClientRect();
    mx.set(((e.clientX - r.left) / r.width - 0.5) * 24);
    my.set(((e.clientY - r.top) / r.height - 0.5) * 24);
  };

  const thumbs = (featured || []).slice(0, 4);

  return (
    <main data-testid="home-page">
      {/* ---------- HERO ---------- */}
      <section
        data-testid="hero"
        onMouseMove={onMouseMove}
        className="relative min-h-screen flex items-center overflow-hidden pt-28 pb-16"
      >
        {/* ambient purple glows */}
        <div className="pointer-events-none absolute -top-40 right-[-10%] w-[42rem] h-[42rem] rounded-full bg-[radial-gradient(circle,rgba(108,25,217,0.16),transparent_60%)] animate-drift" />
        <div className="pointer-events-none absolute bottom-[-20%] left-[-12%] w-[36rem] h-[36rem] rounded-full bg-[radial-gradient(circle,rgba(139,53,255,0.09),transparent_60%)] animate-drift-slow" />
        {/* floating decoratives */}
        <div className="pointer-events-none absolute top-32 left-[8%] hidden lg:block animate-floaty">
          <div className="w-16 h-px bg-[#A970FF]/50" />
          <p className="text-[10px] tracking-[0.3em] text-[#9A9A9F] mt-3 uppercase">Est. 2021</p>
        </div>
        <div className="pointer-events-none absolute bottom-40 right-[6%] hidden lg:block animate-floaty" style={{ animationDelay: "1.2s" }}>
          <div className="w-2 h-2 rounded-full bg-[#8B35FF]/70" />
        </div>

        <div className="max-w-[1440px] mx-auto px-6 md:px-12 w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.6, ease: EASE }}
              className="inline-flex items-center gap-2.5 border border-white/10 rounded-full px-4 py-2 mb-8"
              data-testid="availability-badge"
            >
              <span className="w-2 h-2 rounded-full bg-[#8B35FF] animate-pulse-dot" />
              <span className="text-xs tracking-wide text-[#C8C8CC]">Available for freelance projects</span>
            </motion.div>

            <h1 className="font-display font-bold text-5xl md:text-6xl lg:text-7xl xl:text-[5.2rem] leading-[1.04] tracking-tighter" data-testid="hero-headline">
              {HEADLINE.map((line, i) => (
                <span key={i} className="block overflow-hidden pb-1">
                  <motion.span
                    className="block"
                    initial={{ y: "110%" }}
                    animate={{ y: 0 }}
                    transition={{ delay: 0.25 + i * 0.1, duration: 0.9, ease: EASE }}
                  >
                    {i === 2 ? (
                      <>
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#8B35FF] to-[#A970FF]">Stand Out</span>.
                      </>
                    ) : (
                      line
                    )}
                  </motion.span>
                </span>
              ))}
            </h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.7, ease: EASE }}
              className="mt-7 text-base md:text-lg text-[#9A9A9F] max-w-xl leading-relaxed"
              data-testid="hero-subtitle"
            >
              Graphic Designer, Photographer &amp; Video Editor creating bold, meaningful and visually engaging experiences.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.7, ease: EASE }}
              className="mt-10 flex flex-wrap items-center gap-4"
            >
              <Link
                to="/work"
                data-testid="hero-cta-work"
                className="group inline-flex items-center gap-2.5 bg-[#6C19D9] hover:bg-[#8B35FF] text-white font-medium px-8 py-4 rounded-full transition-colors duration-300 hover:shadow-[0_0_40px_rgba(139,53,255,0.3)]"
              >
                View My Work
                <ArrowRight size={16} className="transition-transform duration-300 group-hover:translate-x-1.5" />
              </Link>
              <Link
                to="/contact"
                data-testid="hero-cta-contact"
                className="group inline-flex items-center gap-2.5 border border-white/20 hover:border-white/50 text-white font-medium px-8 py-4 rounded-full transition-colors duration-300"
              >
                Let's Work Together
                <ArrowUpRight size={16} className="transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1" />
              </Link>
            </motion.div>
          </div>

          {/* parallax thumbnails */}
          <div className="lg:col-span-5 relative h-[540px] hidden lg:block" data-testid="hero-visuals">
            {thumbs.length >= 4 ? (
              <>
                <ParallaxThumb src={imgUrl(thumbs[0].cover)} alt={thumbs[0].title} factor={1} delay={0.65} mx={smx} my={smy} className="w-[58%] aspect-[3/4] top-0 right-0 z-10" />
                <ParallaxThumb src={imgUrl(thumbs[1].cover)} alt={thumbs[1].title} factor={-0.7} delay={0.75} mx={smx} my={smy} className="w-[42%] aspect-square top-[38%] left-0 z-20" />
                <ParallaxThumb src={imgUrl(thumbs[2].cover)} alt={thumbs[2].title} factor={0.5} delay={0.85} mx={smx} my={smy} className="w-[34%] aspect-[4/5] bottom-0 right-[8%] z-30" />
                <ParallaxThumb src={imgUrl(thumbs[3].cover)} alt={thumbs[3].title} factor={-0.4} delay={0.95} mx={smx} my={smy} className="w-[26%] aspect-[3/4] top-[6%] left-[22%] z-0 opacity-80" />
              </>
            ) : (
              <div className="w-[58%] aspect-[3/4] absolute top-0 right-0 bg-[#111116] animate-pulse" />
            )}
          </div>

          {/* mobile visuals */}
          <div className="lg:hidden grid grid-cols-2 gap-4" data-testid="hero-visuals-mobile">
            {thumbs.slice(0, 2).map((t, i) => (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.65 + i * 0.1, duration: 0.8, ease: EASE }}
                className="overflow-hidden border border-white/10 aspect-[3/4]"
              >
                <img src={imgUrl(t.cover)} alt={t.title} className="w-full h-full object-cover" />
              </motion.div>
            ))}
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.8 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 hidden md:flex flex-col items-center gap-2 text-[#9A9A9F]"
        >
          <span className="text-[10px] tracking-[0.3em] uppercase">Scroll</span>
          <ArrowDown size={14} className="animate-floaty" />
        </motion.div>
      </section>

      <Marquee />

      {/* ---------- MANIFESTO CHAPTERS ---------- */}
      <section className="max-w-[1440px] mx-auto px-6 md:px-12 py-24 md:py-36" data-testid="manifesto">
        <Reveal>
          <p className="text-xs md:text-sm tracking-[0.25em] uppercase font-semibold text-[#A970FF] mb-6">What I Do</p>
        </Reveal>
        <div>
          {CHAPTERS.map((c, i) => (
            <Reveal key={c.n} delay={i * 0.1}>
              <div className="group grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-8 items-baseline py-10 md:py-14 border-b border-white/10">
                <span className="md:col-span-2 font-display text-5xl md:text-6xl font-bold text-white/10 group-hover:text-[#8B35FF] transition-colors duration-500">
                  {c.n}
                </span>
                <h2 className="md:col-span-5 font-display text-3xl md:text-5xl font-semibold tracking-tight group-hover:translate-x-3 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]">
                  {c.title}
                </h2>
                <p className="md:col-span-5 text-[#9A9A9F] leading-relaxed text-sm md:text-base max-w-md">{c.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ---------- SELECTED WORK ---------- */}
      <section className="max-w-[1440px] mx-auto px-6 md:px-12 pb-24 md:pb-36" data-testid="selected-work">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-14">
          <div>
            <Reveal>
              <p className="text-xs md:text-sm tracking-[0.25em] uppercase font-semibold text-[#A970FF] mb-5">Portfolio</p>
            </Reveal>
            <Reveal delay={0.08}>
              <h2 className="font-display text-4xl md:text-6xl font-bold tracking-tighter">Selected Work</h2>
            </Reveal>
            <Reveal delay={0.16}>
              <p className="text-[#9A9A9F] mt-4 max-w-md text-sm md:text-base leading-relaxed">
                A curated selection of branding, design, photography and film projects.
              </p>
            </Reveal>
          </div>
          <Reveal delay={0.2}>
            <Link
              to="/work"
              data-testid="view-all-projects"
              className="group inline-flex items-center gap-2 text-sm font-medium text-[#C8C8CC] hover:text-white transition-colors"
            >
              View All Projects
              <ArrowRight size={15} className="text-[#A970FF] transition-transform duration-300 group-hover:translate-x-1.5" />
            </Link>
          </Reveal>
        </div>

        {featured === null ? (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6" data-testid="work-skeleton">
            {[0, 1, 2].map((i) => (
              <div key={i} className={`bg-[#111116] animate-pulse aspect-[4/3] ${i === 0 ? "md:col-span-7" : "md:col-span-5"}`} />
            ))}
          </div>
        ) : featured.length === 0 ? (
          <p className="text-[#9A9A9F] py-20 text-center" data-testid="work-empty">New projects are coming soon.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {featured.map((p, i) => {
              const g = GRID_SPANS[i % GRID_SPANS.length];
              return (
                <Reveal key={p.id} delay={(i % 3) * 0.1} className={g.span}>
                  <ProjectCard project={p} aspect={g.aspect} />
                </Reveal>
              );
            })}
          </div>
        )}
      </section>

      {/* ---------- CTA BANNER ---------- */}
      <section className="relative overflow-hidden border-t border-white/10" data-testid="home-cta">
        <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[40rem] h-[40rem] rounded-full bg-[radial-gradient(circle,rgba(108,25,217,0.14),transparent_60%)] animate-drift" />
        <div className="max-w-[1440px] mx-auto px-6 md:px-12 py-28 md:py-40 text-center relative">
          <Reveal>
            <h2 className="font-display text-4xl md:text-6xl lg:text-7xl font-bold tracking-tighter">
              Have a project <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#8B35FF] to-[#A970FF]">in mind?</span>
            </h2>
          </Reveal>
          <Reveal delay={0.12}>
            <p className="text-[#9A9A9F] mt-6 max-w-lg mx-auto leading-relaxed">Let's create something visually memorable together.</p>
          </Reveal>
          <Reveal delay={0.2}>
            <Link
              to="/contact"
              data-testid="cta-banner-button"
              className="group inline-flex items-center gap-2.5 mt-10 bg-white text-black font-medium px-9 py-4 rounded-full hover:bg-[#A970FF] hover:text-white transition-colors duration-300"
            >
              Start a Project
              <ArrowUpRight size={16} className="transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1" />
            </Link>
          </Reveal>
        </div>
      </section>
    </main>
  );
}
