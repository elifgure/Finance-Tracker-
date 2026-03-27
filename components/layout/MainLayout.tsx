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
      <header className="sticky top-0 z-50 w-full border-b border-white/5 bg-background/60 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between">
          {/* Sol: Logo */}
          <Link href="/" className="relative w-40 h-16 flex-shrink-0">
            <Image 
              src="/images/FinanceAI-logo-transparent.png" 
              alt="Finance AI Logo" 
              fill
              className="object-contain"
              priority
            />
          </Link>

          {/* Orta: Navigasyon */}
          <nav className="hidden md:flex items-center gap-8 bg-card/40 px-6 py-2 rounded-2xl border border-white/5 shadow-sm">
            {navItems.map((item) => (
              <Link 
                key={item.href}
                href={item.href}
                className={cn(
                  "text-sm font-bold transition-all duration-200 hover:text-primary",
                  pathname === item.href 
                    ? "text-primary" 
                    : "text-slate-400 dark:text-slate-500"
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Sağ: Profil */}
          <div className="flex-shrink-0">
            <UserProfile />
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <motion.main
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
        >
          {children}
        </motion.main>
      </div>
    </div>
  );
}
