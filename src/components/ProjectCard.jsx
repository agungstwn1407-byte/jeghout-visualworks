import React from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import { imgUrl, catLabel } from "@/lib/api";

export default function ProjectCard({ project, aspect = "aspect-[4/5]" }) {
  return (
    <Link
      to={`/work/${project.slug}`}
      data-cursor="view"
      data-testid={`project-card-${project.slug}`}
      className="group block relative overflow-hidden bg-[#111116]"
      aria-label={`View project ${project.title}`}
    >
      <div className={`${aspect} overflow-hidden`}>
        <img
          src={imgUrl(project.cover)}
          alt={project.title}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.05]"
        />
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-[#08080B]/95 via-[#08080B]/25 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      <div className="absolute inset-x-0 bottom-0 p-6 md:p-8 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]">
        <p className="text-[11px] tracking-[0.22em] uppercase font-semibold text-[#A970FF] mb-2">
          {catLabel(project.category)} — {project.year}
        </p>
        <div className="flex items-end justify-between gap-4">
          <h3 className="font-display text-xl md:text-2xl font-semibold text-white leading-snug">{project.title}</h3>
          <ArrowUpRight size={20} className="text-[#A970FF] shrink-0 mb-1" />
        </div>
      </div>
      <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-[#6C19D9] to-[#A970FF] scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-500" />
    </Link>
  );
}
