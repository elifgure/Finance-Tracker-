"use client";

import TransactionCard from "./TransactionCard";
import { motion, AnimatePresence } from "framer-motion";
import { Transaction } from "@/types/transaction";

interface TransactionListProps {
  transactions: Transaction[];
  displayCurrency: string;
  onRefresh?: () => void;
}

export default function TransactionList({ transactions, displayCurrency, onRefresh }: TransactionListProps) {
  const handleDelete = (id: string) => {
    // Silme sonrası listeyi yenile
    if (onRefresh) {
      onRefresh();
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-0 mb-2 mt-6 sm:mt-8">
        <h2 className="text-lg sm:text-xl font-black neon-text uppercase tracking-tighter">İşlem Geçmişi</h2>
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="hidden md:block h-[1px] w-16 lg:w-24 bg-gradient-to-r from-transparent to-primary/30" />
          <button className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-primary/80 hover:text-primary transition-colors flex items-center gap-1">
            Filtrele <span className="opacity-50">/</span> Detaylar
          </button>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
        <AnimatePresence>
          {transactions.length > 0 ? (
            transactions.slice(0, 8).map((t, index) => (
              <motion.div
                key={t._id || t.id || index}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05, type: "spring", stiffness: 100 }}
              >
                <TransactionCard 
                  t={t} 
                  displayCurrency={displayCurrency}
                  onDelete={handleDelete}
                />
              </motion.div>
            ))
          ) : (
            <div className="col-span-2 text-center py-20 bg-card/10 rounded-3xl border border-dashed border-white/5 text-slate-500 text-xs font-black uppercase tracking-widest italic">
              Kayıtlı işlem bulunamadı.
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
