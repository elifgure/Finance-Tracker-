"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import UserProfile from "./UserProfile";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/utils/utils";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const navItems = [
    { label: "Anasayfa", href: "/" },
    { label: "Harcama Grafiğim", href: "/grafik" },
    { label: "Harcamalarım", href: "/harcamalar" },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300 relative">
      <header className="sticky top-0 z-50 w-full border-b border-white/5 bg-background/40 backdrop-blur-2xl">
        <div className="max-w-7xl mx-auto px-6 h-24 flex items-center justify-between">
          {/* Sol: Logo */}
          <Link href="/" className="relative w-48 h-20 flex-shrink-0 group">
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
                  "px-6 py-2.5 rounded-[1.5rem] text-[11px] font-black uppercase tracking-[0.2em] transition-all duration-300",
                  pathname === item.href 
                    ? "bg-primary text-black shadow-lg shadow-primary/20" 
                    : "text-white/30 hover:text-primary hover:bg-white/5"
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Sağ: Profil */}
          <div className="flex items-center gap-6">
            <div className="flex-shrink-0 p-1 bg-gradient-to-tr from-primary/20 to-transparent rounded-full border border-white/5">
              <UserProfile />
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-12">
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
