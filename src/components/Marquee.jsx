import React from "react";

const ITEMS = ["GRAPHIC DESIGN", "PHOTOGRAPHY", "VIDEO EDITING", "BRANDING", "SOCIAL MEDIA", "ART DIRECTION"];

export default function Marquee() {
  const row = (key) => (
    <div key={key} className="flex items-center shrink-0">
      {ITEMS.map((t, i) => (
        <React.Fragment key={`${key}-${i}`}>
          <span
            className={`font-display text-4xl md:text-6xl font-bold tracking-tight px-6 md:px-10 ${
              i % 2 === 0 ? "text-white" : "text-stroke"
            }`}
          >
            {t}
          </span>
          <span className="w-2.5 h-2.5 rotate-45 bg-[#6C19D9] shrink-0" />
        </React.Fragment>
      ))}
    </div>
  );
  return (
    <section data-testid="marquee" className="overflow-hidden border-y border-white/10 py-8 md:py-10 select-none" aria-hidden="true">
      <div className="animate-marquee flex w-max">
        {row("a")}
        {row("b")}
      </div>
    </section>
  );
}
