"use client";

import MainLayout from "@/components/layout/MainLayout";
import { Transaction } from "@/types/transaction";
import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell,
  PieChart,
  Pie
} from "recharts";
import { Loader2, TrendingDown, Target, RefreshCw } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Rates {
  [key: string]: number;
}

export default function GrafikPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [displayCurrency, setDisplayCurrency] = useState("TRY");
  const [rates, setRates] = useState<Rates>({ TRY: 1, USD: 0.03, EUR: 0.028 });
  const [loadingRates, setLoadingRates] = useState(false);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const res = await fetch("/api/transactions");
        if (res.ok) {
          const data = await res.json();
          setTransactions(data);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchTransactions();
  }, []);

  useEffect(() => {
    const fetchRates = async () => {
      setLoadingRates(true);
      try {
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

  const categoryData = useMemo(() => {
    const getConvertedAmount = (t: Transaction) => {
      const amount = t.amount;
      const tCurrency = t.currency || "TRY";
      if (tCurrency === displayCurrency) return amount;
      const amountInTRY = tCurrency === "TRY" ? amount : amount / (rates[tCurrency] || 1);
      return amountInTRY * (rates[displayCurrency] || 1);
    };

    const categories: { [key: string]: number } = {};
    transactions.filter(t => t.type === "expense").forEach((t) => {
      const cat = t.category.toLowerCase();
      if (!categories[cat]) categories[cat] = 0;
      categories[cat] += getConvertedAmount(t);
    });
    return Object.entries(categories)
      .map(([name, value]) => ({ name, value: Number(value.toFixed(2)) }))
      .sort((a, b) => b.value - a.value);
  }, [transactions, displayCurrency, rates]);

  const symbols: { [key: string]: string } = {
    TRY: "₺",
    USD: "$",
    EUR: "€",
  };

  const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ payload: { name: string; value: number } }> }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card/95 backdrop-blur-md border border-white/10 p-4 rounded-xl shadow-2xl">
          <p className="text-sm font-bold text-slate-300">{payload[0].payload.name}</p>
          <p className="text-lg font-black text-primary">
            {payload[0].payload.value.toLocaleString()} {symbols[displayCurrency]}
          </p>
        </div>
      );
    }
    return null;
  };

  const COLORS = ['#22c55e', '#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'];

  const renderLabel = (entry: { name: string; value: number; percent: number }) => {
    return `${(entry.percent * 100).toFixed(1)}%`;
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-10">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex flex-col gap-2">
            <h1 className="text-4xl font-black neon-text uppercase tracking-tighter">Finansal Analiz Paneli</h1>
            <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Derinlemesine Harcama ve Gelir İstatistikleri</p>
          </div>
          <div className="flex items-center gap-3 bg-card/40 backdrop-blur-xl p-2 rounded-xl border border-white/5">
            {loadingRates && <RefreshCw size={14} className="animate-spin text-primary" />}
            <Select value={displayCurrency} onValueChange={setDisplayCurrency}>
              <SelectTrigger className="w-[110px] h-9 bg-transparent border-none rounded-lg text-sm font-black focus:ring-0">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-card/95 backdrop-blur-xl border-white/10 rounded-xl overflow-hidden">
                <SelectItem value="TRY" className="text-sm font-bold hover:bg-primary/20 hover:text-black">TRY (₺)</SelectItem>
                <SelectItem value="USD" className="text-sm font-bold hover:bg-primary/20 hover:text-black">USD ($)</SelectItem>
                <SelectItem value="EUR" className="text-sm font-bold hover:bg-primary/20 hover:text-black">EUR (€)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Kategori Bazlı Bar Grafiği */}
          <Card className="bg-card/30 border-white/5 rounded-[2rem] overflow-hidden backdrop-blur-2xl">
            <CardHeader>
              <CardTitle className="text-sm font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
                <TrendingDown className="text-rose-500 h-4 w-4" /> Kategori Bazlı Giderler
              </CardTitle>
            </CardHeader>
            <CardContent className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryData} layout="vertical" margin={{ left: 40, right: 40 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(255,255,255,0.05)" />
                  <XAxis type="number" hide />
                  <YAxis 
                    dataKey="name" 
                    type="category" 
                    axisLine={false} 
                    tickLine={false}
                    tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 700 }}
                  />
                  <Tooltip 
                    cursor={{ fill: 'rgba(255,255,255,0.02)' }}
                    content={<CustomTooltip />}
                  />
                  <Bar dataKey="value" radius={[0, 10, 10, 0]} barSize={24}>
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} fillOpacity={0.8} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Pasta Grafiği (Dağılım) */}
          <Card className="bg-card/30 border-white/5 rounded-[2rem] overflow-hidden backdrop-blur-2xl">
            <CardHeader>
              <CardTitle className="text-sm font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
                <Target className="text-primary h-4 w-4" /> Harcama Dağılım Payı
              </CardTitle>
            </CardHeader>
            <CardContent className="h-[400px] flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={80}
                    outerRadius={140}
                    paddingAngle={8}
                    dataKey="value"
                    label={renderLabel}
                    labelLine={false}
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}
