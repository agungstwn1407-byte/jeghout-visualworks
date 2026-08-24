import React, { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import {
  motion,
  AnimatePresence,
  useScroll,
  useMotionValueEvent,
} from "framer-motion";
import { Menu, X, ArrowUpRight } from "lucide-react";

const LINKS = [
  { to: "/work", label: "Work" },
  { to: "/about", label: "About" },
  { to: "/services", label: "Services" },
  { to: "/contact", label: "Contact" },
];

export default function Navbar() {
  const [hidden, setHidden] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  const { scrollY } = useScroll();
  const navigate = useNavigate();

  useMotionValueEvent(scrollY, "change", (y) => {
    const prev = scrollY.getPrevious() ?? 0;

    setHidden(y > prev && y > 160);
    setScrolled(y > 40);
  });

  return (
    <>
      {/* =====================================================
          MAIN NAVBAR
      ===================================================== */}

      <motion.header
        data-testid="navbar"
        initial={{
          y: -80,
          opacity: 0,
        }}
        animate={{
          y: hidden ? "-100%" : 0,
          opacity: 1,
        }}
        transition={{
          duration: 0.35,
          ease: [0.22, 1, 0.36, 1],
        }}
        className={`fixed top-0 left-0 right-0 z-50 transition-[background-color,border-color,backdrop-filter] duration-300 ${
          scrolled
            ? "bg-[#08080B]/85 backdrop-blur-xl border-b border-white/10"
            : "bg-transparent border-b border-transparent"
        }`}
      >
        <div
          className={`max-w-[1440px] mx-auto px-6 md:px-12 flex items-center justify-between transition-all duration-300 ${
            scrolled ? "py-4" : "py-6"
          }`}
        >
          {/* =================================================
              BRAND / LOGO
          ================================================= */}

          <Link
            to="/"
            data-testid="nav-logo"
            className="flex items-center gap-3 group min-w-0"
          >
            {/* Logo Image */}

            <div className="w-9 h-9 shrink-0 flex items-center justify-center">
              <img
                src="/logojvw.png"
                alt="Jeghout Visualworks"
                className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-105"
              />
            </div>

            {/* Brand Name */}

            <div className="flex items-baseline min-w-0">
              <span className="font-display font-bold text-lg tracking-tight whitespace-nowrap">
                Jeghout
                <span className="text-[#8B35FF]">.</span>
              </span>

              <span className="text-[#9A9A9F] font-normal text-[10px] sm:text-xs ml-2 tracking-[0.15em] sm:tracking-[0.2em] uppercase whitespace-nowrap">
                visualworks
              </span>
            </div>
          </Link>

          {/* =================================================
              DESKTOP NAVIGATION
          ================================================= */}

          <nav
            className="hidden md:flex items-center gap-9"
            aria-label="Main navigation"
          >
            {LINKS.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                data-testid={`nav-link-${link.label.toLowerCase()}`}
                className={({ isActive }) =>
                  `text-sm font-medium transition-colors duration-300 ${
                    isActive
                      ? "text-white"
                      : "text-[#C8C8CC] hover:text-white"
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}

            {/* CTA */}

            <Link
              to="/contact"
              data-testid="nav-cta"
              className="group ml-2 inline-flex items-center gap-2 bg-[#6C19D9] hover:bg-[#8B35FF] text-white text-sm font-medium px-6 py-2.5 rounded-full transition-colors duration-300"
            >
              Let's Work Together

              <ArrowUpRight
                size={15}
                className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
              />
            </Link>
          </nav>

          {/* =================================================
              MOBILE MENU BUTTON
          ================================================= */}

          <button
            data-testid="nav-hamburger"
            onClick={() => setOpen(true)}
            className="md:hidden p-2 text-white shrink-0"
            aria-label="Open menu"
          >
            <Menu size={24} />
          </button>
        </div>
      </motion.header>

      {/* =====================================================
          MOBILE MENU
      ===================================================== */}

      <AnimatePresence>
        {open && (
          <motion.div
            data-testid="mobile-menu"
            initial={{
              opacity: 0,
            }}
            animate={{
              opacity: 1,
            }}
            exit={{
              opacity: 0,
            }}
            transition={{
              duration: 0.3,
            }}
            className="fixed inset-0 z-[60] bg-[#08080B]/98 backdrop-blur-2xl flex flex-col"
          >
            {/* =================================================
                MOBILE HEADER
            ================================================= */}

            <div className="flex items-center justify-between px-6 py-6">
              {/* Mobile Logo + Brand */}

              <Link
                to="/"
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 group min-w-0"
              >
                <div className="w-8 h-8 shrink-0 flex items-center justify-center">
                  <img
                    src="/logojvw.png"
                    alt="Jeghout Visualworks"
                    className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-105"
                  />
                </div>

                <div className="flex items-baseline min-w-0">
                  <span className="font-display font-bold text-lg tracking-tight whitespace-nowrap">
                    Jeghout
                    <span className="text-[#8B35FF]">.</span>
                  </span>

                  <span className="text-[#9A9A9F] font-normal text-[10px] ml-2 tracking-[0.12em] uppercase whitespace-nowrap">
                    visualworks
                  </span>
                </div>
              </Link>

              {/* Close Button */}

              <button
                onClick={() => setOpen(false)}
                data-testid="mobile-menu-close"
                className="p-2 text-white shrink-0"
                aria-label="Close menu"
              >
                <X size={26} />
              </button>
            </div>

            {/* =================================================
                MOBILE NAVIGATION
            ================================================= */}

            <nav
              className="flex-1 flex flex-col justify-center px-8 gap-2"
              aria-label="Mobile navigation"
            >
              {LINKS.map((link, index) => (
                <motion.div
                  key={link.to}
                  initial={{
                    opacity: 0,
                    y: 24,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                  }}
                  transition={{
                    delay: 0.1 + index * 0.07,
                    duration: 0.5,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                >
                  <button
                    data-testid={`mobile-nav-${link.label.toLowerCase()}`}
                    onClick={() => {
                      setOpen(false);
                      navigate(link.to);
                    }}
                    className="font-display text-4xl font-semibold py-3 text-left w-full hover:text-[#A970FF] transition-colors"
                  >
                    {link.label}
                  </button>
                </motion.div>
              ))}

              {/* =================================================
                  MOBILE CTA
              ================================================= */}

              <motion.div
                initial={{
                  opacity: 0,
                  y: 24,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                transition={{
                  delay: 0.42,
                  duration: 0.5,
                }}
                className="pt-6"
              >
                <button
                  data-testid="mobile-nav-cta"
                  onClick={() => {
                    setOpen(false);
                    navigate("/contact");
                  }}
                  className="inline-flex items-center gap-2 bg-[#6C19D9] hover:bg-[#8B35FF] text-white font-medium px-8 py-4 rounded-full transition-colors duration-300"
                >
                  Let's Work Together

                  <ArrowUpRight size={16} />
                </button>
              </motion.div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}