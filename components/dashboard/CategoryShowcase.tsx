"use client";

import React, { useMemo, useState, useEffect } from "react";
import { Transaction } from "@/types/transaction";
import { categoryIcons } from "@/utils/categoryIcons";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";

interface CategoryShowcaseProps {
  transactions: Transaction[];
  displayCurrency: string;
}

interface Rates {
  [key: string]: number;
}

export default function CategoryShowcase({ transactions, displayCurrency }: CategoryShowcaseProps) {
  const [rates, setRates] = useState<Rates>({ TRY: 1, USD: 0.03, EUR: 0.028 });

  useEffect(() => {
    const fetchRates = async () => {
      try {
        const res = await fetch("https://open.er-api.com/v6/latest/TRY");
        const data = await res.json();
        if (data.rates) {
          setRates(data.rates);
        }
      } catch (error) {
        console.error("Kurlar alınamadı:", error);
      }
    };
    fetchRates();
  }, []);

  const categoryData = useMemo(() => {
    const categories: { [key: string]: number } = {};
    
    const getConvertedAmount = (t: Transaction) => {
      const amount = t.amount;
      const tCurrency = t.currency || "TRY";

      if (tCurrency === displayCurrency) return amount;

      const amountInTRY = tCurrency === "TRY" ? amount : amount / (rates[tCurrency] || 1);
      return amountInTRY * (rates[displayCurrency] || 1);
    };

    transactions.forEach((t) => {
      // SADECE GİDERLERİ (expense) FİLTRELE
      if (t.type === "expense") {
        const cat = t.category.toLowerCase();
        if (!categories[cat]) categories[cat] = 0;
        categories[cat] += getConvertedAmount(t);
      }
    });

    return Object.entries(categories)
      .map(([name, total]) => ({ name, total }))
      .sort((a, b) => b.total - a.total);
  }, [transactions, displayCurrency, rates]);

  const symbols: { [key: string]: string } = {
    TRY: "₺",
    USD: "$",
    EUR: "€",
  };

  if (categoryData.length === 0) return null;

  return (
    <div className="mt-12 mb-12">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-xl font-black neon-text uppercase tracking-tighter">Kategori Dağılımı</h2>
        <div className="h-[1px] flex-1 mx-6 bg-gradient-to-r from-primary/30 to-transparent" />
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
        {categoryData.map((cat, index) => {
          const Icon = categoryIcons[cat.name] || categoryIcons["unknown"];
          return (
            <motion.div
              key={cat.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, type: "spring", stiffness: 100 }}
              whileHover={{ y: -8, scale: 1.02 }}
            >
              <Card className="border-none bg-card/30 backdrop-blur-xl rounded-[2rem] overflow-hidden hover:bg-card/50 transition-all border border-white/5 group relative">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <CardContent className="p-6 flex flex-col items-center text-center gap-4 relative z-10">
                  <div className="p-4 bg-primary/10 text-primary rounded-2xl group-hover:bg-primary group-hover:text-black transition-all duration-500 shadow-lg group-hover:shadow-primary/20">
                    <Icon size={28} strokeWidth={2.5} />
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest capitalize">
                      {cat.name}
                    </p>
                    <p className="text-lg font-black text-white group-hover:scale-110 transition-transform">
                      {cat.total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} <span className="text-primary text-xs">{symbols[displayCurrency]}</span>
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
