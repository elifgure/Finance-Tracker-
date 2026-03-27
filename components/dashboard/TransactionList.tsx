"use client";

import TransactionCard from "./TransactionCard";
import { motion, AnimatePresence } from "framer-motion";
import { Transaction } from "@/types/transaction";

interface TransactionListProps {
  transactions: Transaction[];
  displayCurrency: string;
}

export default function TransactionList({ transactions, displayCurrency }: TransactionListProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-2 mt-8">
        <h2 className="text-xl font-black neon-text uppercase tracking-tighter">İşlem Geçmişi</h2>
        <div className="flex items-center gap-4">
          <div className="hidden md:block h-[1px] w-24 bg-gradient-to-r from-transparent to-primary/30" />
          <button className="text-[10px] font-black uppercase tracking-widest text-primary/80 hover:text-primary transition-colors flex items-center gap-1">
            Filtrele <span className="opacity-50">/</span> Detaylar
          </button>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <AnimatePresence>
          {transactions.length > 0 ? (
            transactions.slice(0, 8).map((t, index) => (
              <motion.div
                key={t._id || t.id || index}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05, type: "spring", stiffness: 100 }}
              >
                <TransactionCard t={t} displayCurrency={displayCurrency} />
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
