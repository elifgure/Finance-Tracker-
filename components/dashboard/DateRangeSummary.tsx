"use client";

import React, { useState, useMemo, useEffect } from "react";
import { Transaction } from "@/types/transaction";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TrendingDown, TrendingUp, Wallet, RefreshCw } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface DateRangeSummaryProps {
  transactions: Transaction[];
  displayCurrency: string;
  onCurrencyChange: (currency: string) => void;
}

interface Rates {
  [key: string]: number;
}

export default function DateRangeSummary({ 
  transactions, 
  displayCurrency, 
  onCurrencyChange 
}: DateRangeSummaryProps) {
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 7);
    return d.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(() => {
    return new Date().toISOString().split('T')[0];
  });
  const [rates, setRates] = useState<Rates>({ TRY: 1, USD: 0.03, EUR: 0.028 });
  const [loadingRates, setLoadingRates] = useState(false);

  // Sembolleri belirle
  const symbols: { [key: string]: string } = {
    TRY: "₺",
    USD: "$",
    EUR: "€",
  };

  useEffect(() => {
    const fetchRates = async () => {
      setLoadingRates(true);
      try {
        // Ücretsiz bir döviz kuru API'si kullanıyoruz (Örnek: er-api.com)
        const res = await fetch("https://open.er-api.com/v6/latest/TRY");
        const data = await res.json();
        if (data.rates) {
          setRates(data.rates);
        }
      } catch (error) {
        console.error("Kurlar alınamadı:", error);
      } finally {
        setLoadingRates(false);
      }
    };

    fetchRates();
  }, []);

  const summary = useMemo(() => {
    const filtered = transactions.filter((t) => {
      if (!startDate && !endDate) return true;
      const date = new Date(t.date);
      const start = startDate ? new Date(startDate) : null;
      const end = endDate ? new Date(endDate) : null;

      if (start && date < start) return false;
      if (end && date > end) return false;
      return true;
    });

    const getAmountInDisplayCurrency = (t: Transaction) => {
      const amount = t.amount;
      const tCurrency = t.currency || "TRY";

      if (tCurrency === displayCurrency) return amount;

      // Önce TRY'ye çevir (Base TRY olduğu için)
      const amountInTRY = tCurrency === "TRY" ? amount : amount / (rates[tCurrency] || 1);
      
      // Sonra hedefe çevir
      return amountInTRY * (rates[displayCurrency] || 1);
    };

    const income = filtered
      .filter((t) => t.type === "income")
      .reduce((acc, t) => acc + getAmountInDisplayCurrency(t), 0);

    const expense = filtered
      .filter((t) => t.type === "expense")
      .reduce((acc, t) => acc + getAmountInDisplayCurrency(t), 0);

    return {
      income,
      expense,
      balance: income - expense,
      count: filtered.length,
    };
  }, [transactions, startDate, endDate, displayCurrency, rates]);

  return (
    <div className="space-y-6 h-full flex flex-col">
      <Card className="border-none shadow-sm bg-card/40 backdrop-blur-xl rounded-3xl flex-1 flex flex-col border border-white/5 neon-card-glow">
        <CardHeader className="pb-4 flex flex-row items-center justify-between">
          <CardTitle className="text-xl font-black neon-text uppercase tracking-tight">Finansal Özet</CardTitle>
          <div className="flex items-center gap-3 bg-background/40 p-1.5 rounded-xl border border-white/5">
            {loadingRates && <RefreshCw size={12} className="animate-spin text-primary" />}
            <Select value={displayCurrency} onValueChange={onCurrencyChange}>
              <SelectTrigger className="w-[90px] h-7 bg-transparent border-none rounded-lg text-xs font-black focus:ring-0">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-card/95 backdrop-blur-xl border-white/10 rounded-xl overflow-hidden">
                <SelectItem value="TRY" className="text-xs font-bold hover:bg-primary/20 hover:text-black">TRY (₺)</SelectItem>
                <SelectItem value="USD" className="text-xs font-bold hover:bg-primary/20 hover:text-black">USD ($)</SelectItem>
                <SelectItem value="EUR" className="text-xs font-bold hover:bg-primary/20 hover:text-black">EUR (€)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col justify-between">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
            <div className="space-y-2">
              <Label htmlFor="start" className="font-bold text-[10px] text-slate-500 uppercase tracking-[0.2em] px-1">Başlangıç Tarihi</Label>
              <Input
                id="start"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="bg-background/30 border-white/5 h-12 rounded-xl text-xs font-bold focus:border-primary/50 transition-all cursor-pointer [color-scheme:dark]"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="end" className="font-bold text-[10px] text-slate-500 uppercase tracking-[0.2em] px-1">Bitiş Tarihi</Label>
              <Input
                id="end"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="bg-background/30 border-white/5 h-12 rounded-xl text-xs font-bold focus:border-primary/50 transition-all cursor-pointer [color-scheme:dark]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-4">
            <div className="p-8 rounded-3xl bg-emerald-500/5 border border-emerald-500/10 flex flex-col justify-between min-h-[140px] group hover:bg-emerald-500/10 transition-all overflow-hidden">
              <div className="flex items-center gap-2 text-emerald-500 mb-2">
                <div className="p-2 rounded-lg bg-emerald-500/10">
                  <TrendingUp size={18} />
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest">Gelirler</span>
              </div>
              <div>
                <p className="font-black text-emerald-100 mb-1 group-hover:scale-105 transition-transform origin-left text-[min(3xl,5vw)] whitespace-nowrap overflow-visible">
                  {summary.income.toLocaleString()} {symbols[displayCurrency]}
                </p>
              </div>
            </div>

            <div className="p-8 rounded-3xl bg-red-500/5 border border-red-500/10 flex flex-col justify-between min-h-[140px] group hover:bg-red-500/10 transition-all">
              <div className="flex items-center gap-2 text-red-500 mb-2">
                <div className="p-2 rounded-lg bg-red-500/10">
                  <TrendingDown size={18} />
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest">Giderler</span>
              </div>
              <div>
                <p className="font-black text-red-100 mb-1 group-hover:scale-105 transition-transform origin-left text-[min(3xl,5vw)] whitespace-nowrap overflow-visible">
                  {summary.expense.toLocaleString()} {symbols[displayCurrency]}
                </p>
              </div>
            </div>

            <div className="p-8 rounded-3xl bg-primary/5 border border-primary/20 flex flex-col justify-between min-h-[140px] group hover:bg-primary/10 transition-all">
              <div className="flex items-center gap-2 text-primary mb-2">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Wallet size={18} />
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest">Bakiye</span>
              </div>
              <div>
                <p className="font-black text-white mb-1 group-hover:scale-105 transition-transform origin-left neon-text text-[min(3xl,5vw)] whitespace-nowrap overflow-visible">
                  {summary.balance.toLocaleString()} {symbols[displayCurrency]}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
