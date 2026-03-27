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
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
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
      <Card className="border-none shadow-sm bg-card/60 backdrop-blur-xl rounded-2xl flex-1 flex flex-col">
        <CardHeader className="pb-4 flex flex-row items-center justify-between">
          <CardTitle className="text-xl font-extrabold">Tarih Aralığı Analizi</CardTitle>
          <div className="flex items-center gap-2">
            {loadingRates && <RefreshCw size={14} className="animate-spin text-muted-foreground" />}
            <Select value={displayCurrency} onValueChange={onCurrencyChange}>
              <SelectTrigger className="w-[80px] h-8 bg-background/50 border-none rounded-lg text-xs font-bold">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-card/95 backdrop-blur-xl border-slate-200/10">
                <SelectItem value="TRY">TRY (₺)</SelectItem>
                <SelectItem value="USD">USD ($)</SelectItem>
                <SelectItem value="EUR">EUR (€)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col justify-between">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <div className="space-y-2">
              <Label htmlFor="start" className="font-bold text-xs text-slate-400 uppercase tracking-widest px-1">Başlangıç Tarihi</Label>
              <Input
                id="start"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="bg-background/50 border-none h-12 rounded-xl text-sm font-medium"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="end" className="font-bold text-xs text-slate-400 uppercase tracking-widest px-1">Bitiş Tarihi</Label>
              <Input
                id="end"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="bg-background/50 border-none h-12 rounded-xl text-sm font-medium"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-2">
            <div className="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex flex-col justify-between min-h-[120px]">
              <div className="flex items-center gap-2 text-emerald-600 mb-2">
                <TrendingUp size={20} />
                <span className="text-xs font-black uppercase tracking-tighter text-emerald-600/80">Toplam Gelir</span>
              </div>
              <p className="text-3xl font-black text-emerald-600 tracking-tighter">
                +{summary.income.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })} {symbols[displayCurrency]}
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex flex-col justify-between min-h-[120px]">
              <div className="flex items-center gap-2 text-rose-600 mb-2">
                <TrendingDown size={20} />
                <span className="text-xs font-black uppercase tracking-tighter text-rose-600/80">Toplam Gider</span>
              </div>
              <p className="text-3xl font-black text-rose-600 tracking-tighter">
                -{summary.expense.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })} {symbols[displayCurrency]}
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-primary/10 border border-primary/20 flex flex-col justify-between min-h-[120px]">
              <div className="flex items-center gap-2 text-primary mb-2">
                <Wallet size={20} />
                <span className="text-xs font-black uppercase tracking-tighter text-primary/80">Net Durum</span>
              </div>
              <p className={`text-3xl font-black tracking-tighter ${summary.balance >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
                {summary.balance >= 0 ? "+" : ""}{summary.balance.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })} {symbols[displayCurrency]}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
