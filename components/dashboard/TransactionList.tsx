"use client";

import { transactions } from "@/data/mockData";
import TransactionCard from "./TransactionCard";
import { motion, AnimatePresence } from "framer-motion";

export default function TransactionList() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-foreground">Son İşlemler</h2>
        <button className="text-sm font-semibold text-primary hover:underline">Tümünü Gör</button>
      </div>
      <div className="flex flex-col gap-3">
        <AnimatePresence>
          {transactions.map((t, index) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <TransactionCard t={t} />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  )
}
