"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import UserProfile from "./UserProfile";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300 relative">
      <UserProfile />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <motion.header 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10 text-center flex flex-col items-center"
        >
          <div className="relative w-80 h-32 mb-2">
            <Image 
              src="/images/FinanceAI-logo-transparent.png" 
              alt="Finance AI Logo" 
              fill
              className="object-contain"
              priority
            />
          </div>
          <p className="text-secondary font-medium">Gelir ve giderlerinizi akıllıca yönetin</p>
        </motion.header>
        
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
