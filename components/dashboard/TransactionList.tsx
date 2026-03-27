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
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4 pt-8">
        <h2 className="text-xl font-bold text-foreground">Son İşlemler</h2>
        <button className="text-sm font-semibold text-primary hover:underline">Tümünü Gör</button>
      </div>
      <div className="flex flex-col gap-3">
        <AnimatePresence>
          {transactions.length > 0 ? (
            transactions.map((t, index) => (
              <motion.div
                key={t._id || t.id || index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <TransactionCard t={t} displayCurrency={displayCurrency} />
              </motion.div>
            ))
          ) : (
            <div className="text-center py-10 text-secondary font-medium italic">
              Henüz bir işlem bulunmuyor.
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
