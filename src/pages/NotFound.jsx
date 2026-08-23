import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center text-center px-6" data-testid="not-found-page">
      <p className="font-display text-[8rem] md:text-[12rem] font-bold leading-none text-stroke select-none">404</p>
      <h1 className="font-display text-2xl md:text-3xl font-semibold -mt-4">This page wandered off the canvas.</h1>
      <p className="text-[#9A9A9F] mt-4 text-sm">The page you're looking for doesn't exist.</p>
      <Link
        to="/"
        data-testid="not-found-home"
        className="group inline-flex items-center gap-2 mt-10 border border-white/20 hover:border-[#8B35FF] text-white text-sm font-medium px-8 py-3.5 rounded-full transition-colors duration-300"
      >
        <ArrowLeft size={15} className="transition-transform duration-300 group-hover:-translate-x-1" />
        Back to Home
      </Link>
    </main>
  );
}
