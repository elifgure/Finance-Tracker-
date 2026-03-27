import { Transaction } from "@/types/transaction";
import { categoryIcons } from "@/utils/categoryIcons";
import { motion } from "framer-motion";
import { cn } from "@/utils/utils";
import { Card, CardContent } from "@/components/ui/card";

import { useState, useEffect } from "react";

interface Rates {
  [key: string]: number;
}

export default function TransactionCard({ t, displayCurrency }: { t: Transaction, displayCurrency: string }) {
  const Icon = categoryIcons[t.category.toLowerCase()];
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

  const getConvertedAmount = () => {
    const amount = t.amount;
    const tCurrency = t.currency || "TRY";

    if (tCurrency === displayCurrency) return amount;

    const amountInTRY = tCurrency === "TRY" ? amount : amount / (rates[tCurrency] || 1);
    return amountInTRY * (rates[displayCurrency] || 1);
  };

  const symbols: { [key: string]: string } = {
    TRY: "₺",
    USD: "$",
    EUR: "€",
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      whileHover={{ scale: 1.02 }}
      className="group"
    >
      <Card className="border border-white/5 shadow-none transition-all duration-500 bg-card/20 backdrop-blur-xl rounded-3xl overflow-hidden hover:border-primary/30 hover:bg-card/40">
        <CardContent className="p-5 flex items-center justify-between">
          <div className="flex items-center gap-5">
            <div className="p-4 bg-background/50 text-primary rounded-2xl transition-all duration-500 group-hover:bg-primary group-hover:text-black shadow-inner border border-white/5">
              {Icon && <Icon size={24} strokeWidth={2.5} />}
            </div>

            <div className="space-y-1">
              <p className="font-black text-sm text-slate-200 group-hover:text-white transition-colors capitalize tracking-tight">{t.category}</p>
              <div className="flex items-center gap-2">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{new Date(t.date).toLocaleDateString('tr-TR')}</p>
                <span className="w-1 h-1 rounded-full bg-slate-700" />
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{t.type === "income" ? "Nakit Akışı" : "Harcama"}</p>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-end">
            <p
              className={cn(
                "text-xl font-black tracking-tighter transition-all group-hover:scale-110",
                t.type === "income" ? "text-emerald-400" : "text-rose-400"
              )}
            >
              {t.type === "income" ? "+" : "-"}{getConvertedAmount().toLocaleString(undefined, { maximumFractionDigits: 2 })} <span className="text-xs opacity-50">{symbols[displayCurrency]}</span>
            </p>
            <div className={cn(
              "text-[9px] font-black uppercase tracking-[0.2em] px-2 py-0.5 rounded-full border",
              t.type === "income" ? "text-emerald-500/80 border-emerald-500/20 bg-emerald-500/5" : "text-rose-500/80 border-rose-500/20 bg-rose-500/5"
            )}>
              {t.type === "income" ? "Gelir" : "Gider"}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

