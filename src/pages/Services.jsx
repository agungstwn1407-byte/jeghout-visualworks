import React from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight, PenTool, Fingerprint, Share2, Camera, Clapperboard, Sparkles } from "lucide-react";
import { Reveal } from "@/components/Reveal";

const SERVICES = [
  { n: "01", title: "Graphic Design", icon: PenTool, desc: "Posters, layouts, marketing collateral and print design with strong typographic systems and editorial composition." },
  { n: "02", title: "Branding & Visual Identity", icon: Fingerprint, desc: "Logo systems, brand guidelines, packaging and complete visual languages that make brands unmistakable." },
  { n: "03", title: "Social Media Design", icon: Share2, desc: "Feed systems, campaign key visuals, story templates and content kits built for consistency at scale." },
  { n: "04", title: "Photography", icon: Camera, desc: "Portrait, product and editorial photography with cinematic lighting, direction and full retouching." },
  { n: "05", title: "Video Editing", icon: Clapperboard, desc: "Campaign films, reels and aftermovies — rhythm-driven cuts, seamless transitions and premium color grading." },
  { n: "06", title: "Creative Content", icon: Sparkles, desc: "End-to-end creative content: concept, art direction, production and post — one coherent visual voice." },
];

export default function Services() {
  return (
    <main className="pt-36 md:pt-44 pb-24" data-testid="services-page">
      <div className="max-w-[1440px] mx-auto px-6 md:px-12">
        <Reveal y={20}>
          <p className="text-xs md:text-sm tracking-[0.25em] uppercase font-semibold text-[#A970FF] mb-6">Services</p>
        </Reveal>
        <Reveal y={24} delay={0.08}>
          <h1 className="font-display text-4xl md:text-6xl lg:text-7xl font-bold tracking-tighter max-w-4xl leading-[1.05]">
            What I can do <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#8B35FF] to-[#A970FF]">for your brand.</span>
          </h1>
        </Reveal>

        <div className="mt-20 md:mt-28 border-t border-white/10">
          {SERVICES.map((s, i) => (
            <Reveal key={s.n} delay={i * 0.06}>
              <div
                data-testid={`service-${s.n}`}
                className="group grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-10 items-center py-10 md:py-14 border-b border-white/10 hover:bg-white/[0.02] transition-colors duration-500 px-2 md:px-4"
              >
                <span className="md:col-span-2 font-display text-5xl md:text-7xl font-bold text-white/10 group-hover:text-[#8B35FF] transition-colors duration-500">
                  {s.n}
                </span>
                <div className="md:col-span-5 flex items-start gap-5">
                  <s.icon size={26} className="text-[#A970FF] mt-2 shrink-0" strokeWidth={1.5} />
                  <h2 className="font-display text-3xl md:text-5xl font-semibold tracking-tight uppercase leading-[1.05] group-hover:translate-x-3 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]">
                    {s.title}
                  </h2>
                </div>
                <div className="md:col-span-4">
                  <p className="text-[#9A9A9F] text-sm md:text-base leading-relaxed max-w-sm">{s.desc}</p>
                </div>
                <div className="md:col-span-1 flex md:justify-end">
                  <Link
                    to="/contact"
                    aria-label={`Inquire about ${s.title}`}
                    className="w-12 h-12 rounded-full border border-white/15 flex items-center justify-center text-[#C8C8CC] group-hover:bg-[#6C19D9] group-hover:border-[#6C19D9] group-hover:text-white transition-all duration-400"
                  >
                    <ArrowUpRight size={18} />
                  </Link>
                </div>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal delay={0.1}>
          <div className="mt-20 text-center">
            <p className="text-[#9A9A9F] mb-6">Need something more specific?</p>
            <Link
              to="/contact"
              data-testid="services-cta"
              className="group inline-flex items-center gap-2.5 bg-[#6C19D9] hover:bg-[#8B35FF] text-white font-medium px-9 py-4 rounded-full transition-colors duration-300"
            >
              Let's Talk
              <ArrowUpRight size={16} className="transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1" />
            </Link>
          </div>
        </Reveal>
      </div>
    </main>
  );
}
