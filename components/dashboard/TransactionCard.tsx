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
      whileHover={{ scale: 1.01 }}
      className="group"
    >
      <Card className="border-none shadow-sm group-hover:shadow-md transition-all duration-300 bg-card/60 backdrop-blur-xl rounded-2xl overflow-hidden">
        <CardContent className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary/10 text-primary rounded-xl transition-colors group-hover:bg-primary group-hover:text-white">
              {Icon && <Icon size={22} />}
            </div>

            <div>
              <p className="font-bold text-base text-foreground group-hover:text-primary transition-colors capitalize">{t.category}</p>
              <p className="text-xs font-semibold text-slate-400 dark:text-slate-500">{new Date(t.date).toLocaleDateString('tr-TR')}</p>
            </div>
          </div>

          <div className="flex flex-col items-end">
            <p
              className={cn(
                "text-lg font-black tracking-tighter",
                t.type === "income" ? "text-emerald-500" : "text-rose-500"
              )}
            >
              {t.type === "income" ? "+" : "-"}{getConvertedAmount().toLocaleString(undefined, { maximumFractionDigits: 2 })} {symbols[displayCurrency]}
            </p>
            <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">{t.type === "income" ? "Gelir" : "Gider"}</p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

