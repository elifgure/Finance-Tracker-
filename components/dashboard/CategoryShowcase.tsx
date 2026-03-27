"use client";

import React, { useMemo } from "react";
import { Transaction } from "@/types/transaction";
import { categoryIcons } from "@/utils/categoryIcons";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";

interface CategoryShowcaseProps {
  transactions: Transaction[];
  displayCurrency: string;
}

export default function CategoryShowcase({ transactions, displayCurrency }: CategoryShowcaseProps) {
  const categoryData = useMemo(() => {
    const categories: { [key: string]: number } = {};
    
    transactions.forEach((t) => {
      // SADECE GİDERLERİ (expense) FİLTRELE
      if (t.type === "expense") {
        const cat = t.category.toLowerCase();
        if (!categories[cat]) categories[cat] = 0;
        categories[cat] += t.amount;
      }
    });

    return Object.entries(categories)
      .map(([name, total]) => ({ name, total }))
      .sort((a, b) => b.total - a.total);
  }, [transactions]);

  const symbols: { [key: string]: string } = {
    TRY: "₺",
    USD: "$",
    EUR: "€",
  };

  if (categoryData.length === 0) return null;

  return (
    <div className="mt-12">
      <h2 className="text-xl font-bold text-foreground mb-6">Kategorilere Göre Harcamalar</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {categoryData.map((cat, index) => {
          const Icon = categoryIcons[cat.name] || categoryIcons["unknown"];
          return (
            <motion.div
              key={cat.name}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ y: -5 }}
            >
              <Card className="border-none bg-card/40 backdrop-blur-md rounded-2xl overflow-hidden hover:bg-card/60 transition-all border border-white/5">
                <CardContent className="p-4 flex flex-col items-center text-center gap-2">
                  <div className="p-3 bg-primary/10 text-primary rounded-xl">
                    <Icon size={24} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-tighter capitalize">
                      {cat.name}
                    </p>
                    <p className="text-sm font-black text-foreground">
                      {cat.total.toLocaleString()} {symbols[displayCurrency]}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
