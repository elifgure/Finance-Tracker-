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
    <div className="space-y-6">
      <Card className="border-none shadow-sm bg-card/60 backdrop-blur-xl rounded-2xl">
        <CardHeader className="pb-2 flex flex-row items-center justify-between">
          <CardTitle className="text-lg font-bold">Tarih Aralığı Analizi</CardTitle>
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
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="space-y-2">
              <Label htmlFor="start">Başlangıç</Label>
              <Input
                id="start"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="bg-background/50 border-none"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="end">Bitiş</Label>
              <Input
                id="end"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="bg-background/50 border-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
              <div className="flex items-center gap-2 text-emerald-600 mb-1">
                <TrendingUp size={18} />
                <span className="text-sm font-semibold">Toplam Gelir</span>
              </div>
              <p className="text-2xl font-black text-emerald-600">
                +{summary.income.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })} {symbols[displayCurrency]}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20">
              <div className="flex items-center gap-2 text-rose-600 mb-1">
                <TrendingDown size={18} />
                <span className="text-sm font-semibold">Toplam Gider</span>
              </div>
              <p className="text-2xl font-black text-rose-600">
                -{summary.expense.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })} {symbols[displayCurrency]}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-primary/10 border border-primary/20">
              <div className="flex items-center gap-2 text-primary mb-1">
                <Wallet size={18} />
                <span className="text-sm font-semibold">Net Durum</span>
              </div>
              <p className={`text-2xl font-black ${summary.balance >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
                {summary.balance >= 0 ? "+" : ""}{summary.balance.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })} {symbols[displayCurrency]}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
