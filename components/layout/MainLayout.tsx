"use client";

import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import UserProfile from "./UserProfile";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/utils/utils";
import { Menu, X } from "lucide-react";
import { useState } from "react";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { label: "Anasayfa", href: "/" },
    { label: "Harcama Grafiğim", href: "/grafik" },
    { label: "Harcamalarım", href: "/harcamalar" },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300 relative">
      <header className="sticky top-0 z-50 w-full border-b border-white/5 bg-background/40 backdrop-blur-2xl">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 h-16 sm:h-20 md:h-24 flex items-center justify-between">
          {/* Sol: Logo */}
          <Link href="/" className="relative w-28 sm:w-36 md:w-44 lg:w-48 h-12 sm:h-16 md:h-20 flex-shrink-0 group">
            <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
            <Image 
              src="/images/FinanceAI-logo-transparent.png" 
              alt="Finance AI Logo" 
              fill
              className="object-contain relative z-10"
              priority
            />
          </Link>

          {/* Orta: Navigasyon */}
          <nav className="hidden lg:flex items-center gap-2 bg-black/40 px-3 py-1.5 rounded-[2rem] border border-white/5 shadow-2xl">
            {navItems.map((item) => (
              <Link 
                key={item.href}
                href={item.href}
                className={cn(
                  "px-4 xl:px-6 py-2 xl:py-2.5 rounded-[1.5rem] text-[10px] xl:text-[11px] font-black uppercase tracking-[0.15em] xl:tracking-[0.2em] transition-all duration-300",
                  pathname === item.href 
                    ? "bg-primary text-black shadow-lg shadow-primary/20" 
                    : "text-white/30 hover:text-primary hover:bg-white/5"
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Sağ: Hamburger Menu (Mobile) + Profil */}
          <div className="flex items-center gap-3 sm:gap-4 md:gap-6">
            {/* Hamburger Menu Button - Sadece mobilde */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl bg-black/40 border border-white/5 hover:bg-primary/10 hover:border-primary/30 transition-all"
              aria-label="Menü"
            >
              {mobileMenuOpen ? (
                <X className="h-5 w-5 text-primary" />
              ) : (
                <Menu className="h-5 w-5 text-white" />
              )}
            </button>

            <div className="flex-shrink-0 p-0.5 sm:p-1 bg-gradient-to-tr from-primary/20 to-transparent rounded-full border border-white/5">
              <UserProfile />
            </div>
          </div>
        </div>

        {/* Mobile Menu Overlay */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <>
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setMobileMenuOpen(false)}
                className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]"
              />
              
              {/* Menu Panel */}
              <motion.div
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className="lg:hidden fixed top-16 sm:top-20 right-0 bottom-0 w-64 bg-card/95 backdrop-blur-xl border border-white/10 shadow-2xl z-[70] p-6"
              >
                <nav className="flex flex-col gap-3">
                  {navItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={cn(
                        "px-5 py-3 rounded-xl text-sm font-black uppercase tracking-wider transition-all duration-300",
                        pathname === item.href
                          ? "bg-primary text-black shadow-lg shadow-primary/20"
                          : "text-white/70 hover:text-primary hover:bg-white/5"
                      )}
                    >
                      {item.label}
                    </Link>
                  ))}
                </nav>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </header>

      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 py-6 sm:py-8 md:py-12">
        <motion.main
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ damping: 20, stiffness: 100, type: "spring" }}
        >
          {children}
        </motion.main>
      </div>
    </div>
  );
}
