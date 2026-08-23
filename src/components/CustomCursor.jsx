import React, { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

export default function CustomCursor() {
  const [enabled, setEnabled] = useState(false);
  const [mode, setMode] = useState("default");
  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const sx = useSpring(x, { stiffness: 600, damping: 45, mass: 0.4 });
  const sy = useSpring(y, { stiffness: 600, damping: 45, mass: 0.4 });

  useEffect(() => {
    const coarse = window.matchMedia("(hover: none), (pointer: coarse)").matches;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (coarse || reduced) return;
    setEnabled(true);
    const move = (e) => {
      x.set(e.clientX);
      y.set(e.clientY);
    };
    const over = (e) => {
      setMode(e.target.closest('[data-cursor="view"]') ? "view" : "default");
    };
    window.addEventListener("mousemove", move, { passive: true });
    window.addEventListener("mouseover", over, { passive: true });
    return () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseover", over);
    };
  }, [x, y]);

  if (!enabled) return null;

  return (
    <motion.div
      data-testid="custom-cursor"
      className="custom-cursor fixed top-0 left-0 z-[100] pointer-events-none"
      style={{ x: sx, y: sy }}
    >
      <motion.div
        animate={{
          width: mode === "view" ? 92 : 14,
          height: mode === "view" ? 92 : 14,
          backgroundColor: mode === "view" ? "rgba(108,25,217,0.85)" : "rgba(169,112,255,0.9)",
        }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        className="-translate-x-1/2 -translate-y-1/2 rounded-full flex items-center justify-center backdrop-blur-sm border border-[#A970FF]/40 shadow-[0_0_30px_rgba(139,53,255,0.35)]"
      >
        {mode === "view" && (
          <span className="text-[9px] font-semibold tracking-[0.18em] text-white text-center leading-[1.4]">
            VIEW<br />PROJECT
          </span>
        )}
      </motion.div>
    </motion.div>
  );
}
