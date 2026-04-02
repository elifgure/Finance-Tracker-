import { Transaction } from "@/types/transaction";
import { categoryIcons } from "@/utils/categoryIcons";
import { motion } from "framer-motion";
import { cn } from "@/utils/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Trash2 } from "lucide-react";

import { useState, useEffect } from "react";

interface Rates {
  [key: string]: number;
}

interface TransactionCardProps {
  t: Transaction;
  displayCurrency: string;
  onDelete?: (id: string) => void;
}

export default function TransactionCard({ t, displayCurrency, onDelete }: TransactionCardProps) {
  const Icon = categoryIcons[t.category.toLowerCase()];
  const [rates, setRates] = useState<Rates>({ TRY: 1, USD: 0.03, EUR: 0.028 });
  const [deleting, setDeleting] = useState(false);

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

  const handleDelete = async () => {
    if (!onDelete || !t._id) {
      console.error("Delete impossible - onDelete:", !!onDelete, "t._id:", t._id);
      return;
    }
    
    if (!confirm("Bu işlemi silmek istediğinizden emin misiniz?")) return;
    
    setDeleting(true);
    try {
      console.log("Deleting transaction:", t._id);
      const res = await fetch(`/api/transactions/${t._id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        console.log("Delete successful");
        onDelete(t._id);
      } else {
        const data = await res.json();
        console.error("Delete failed:", data);
        alert(data.error || "Silme işlemi başarısız");
      }
    } catch (error) {
      console.error("Delete error:", error);
      alert("Bir hata oluştu");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      whileHover={{ scale: 1.02 }}
      className="group"
    >
      <Card className="border border-white/5 shadow-none transition-all duration-500 bg-card/20 backdrop-blur-xl rounded-2xl sm:rounded-3xl overflow-hidden hover:border-primary/30 hover:bg-card/40">
        <CardContent className="p-3 sm:p-4 md:p-5 flex items-center justify-between gap-2 sm:gap-3 md:gap-4">
          <div className="flex items-center gap-2 sm:gap-3 md:gap-5 flex-1 min-w-0">
            <div className="p-2 sm:p-3 md:p-4 bg-background/50 text-primary rounded-xl sm:rounded-2xl transition-all duration-500 group-hover:bg-primary group-hover:text-black shadow-inner border border-white/5 flex-shrink-0">
              {Icon && <Icon size={18} strokeWidth={2.5} className="sm:w-5 sm:h-5 md:w-6 md:h-6" />}
            </div>

            <div className="space-y-0.5 sm:space-y-1 min-w-0 flex-1">
              <p className="font-black text-xs sm:text-sm text-slate-200 group-hover:text-white transition-colors capitalize tracking-tight truncate">{t.category}</p>
              <div className="flex items-center gap-1 sm:gap-2 flex-wrap">
                <p className="text-[8px] sm:text-[9px] md:text-[10px] font-bold text-slate-500 uppercase tracking-widest">{new Date(t.date).toLocaleDateString('tr-TR')}</p>
                <span className="w-1 h-1 rounded-full bg-slate-700 hidden xs:block" />
                <p className="text-[8px] sm:text-[9px] md:text-[10px] font-bold text-slate-500 uppercase tracking-widest hidden xs:block">{t.type === "income" ? "Nakit Akışı" : "Harcama"}</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 md:gap-3 flex-shrink-0">
            <div className="flex flex-col items-end">
              <p
                className={cn(
                  "text-sm sm:text-lg md:text-xl font-black tracking-tighter transition-all group-hover:scale-110",
                  t.type === "income" ? "text-emerald-400" : "text-rose-400"
                )}
              >
                {t.type === "income" ? "+" : "-"}{getConvertedAmount().toLocaleString(undefined, { maximumFractionDigits: 2 })} <span className="text-[10px] sm:text-xs opacity-50">{symbols[displayCurrency]}</span>
              </p>
              <div className={cn(
                "text-[7px] sm:text-[8px] md:text-[9px] font-black uppercase tracking-[0.15em] sm:tracking-[0.2em] px-1.5 sm:px-2 py-0.5 rounded-full border",
                t.type === "income" ? "text-emerald-500/80 border-emerald-500/20 bg-emerald-500/5" : "text-rose-500/80 border-rose-500/20 bg-rose-500/5"
              )}>
                {t.type === "income" ? "Gelir" : "Gider"}
              </div>
            </div>

            {onDelete && (
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="p-1.5 sm:p-2 md:p-2.5 rounded-lg sm:rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed border border-red-500/20 hover:border-red-500/30 hover:scale-110"
                title="İşlemi Sil"
              >
                <Trash2 size={14} strokeWidth={2.5} className="sm:w-4 sm:h-4 md:w-4 md:h-4" />
              </button>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

