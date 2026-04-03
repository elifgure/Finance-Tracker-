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
import { Loader2, TrendingDown, Target, RefreshCw, Calendar, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
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
  const [selectedMonth, setSelectedMonth] = useState<string>("");
  const [aiInsight, setAiInsight] = useState<string>("");
  const [loadingAI, setLoadingAI] = useState(false);

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

    let filtered = transactions.filter(t => t.type === "expense");
    
    // Ay filtresi uygula
    if (selectedMonth) {
      filtered = filtered.filter(t => {
        const date = new Date(t.date);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        return monthKey === selectedMonth;
      });
    }

    const categories: { [key: string]: number } = {};
    filtered.forEach((t) => {
      const cat = t.category.toLowerCase();
      if (!categories[cat]) categories[cat] = 0;
      categories[cat] += getConvertedAmount(t);
    });
    return Object.entries(categories)
      .map(([name, value]) => ({ name, value: Number(value.toFixed(2)) }))
      .sort((a, b) => b.value - a.value);
  }, [transactions, displayCurrency, rates, selectedMonth]);

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

  const renderLabel = (entry: { percent?: number }) => {
    if (!entry.percent) return '';
    return `${(entry.percent * 100).toFixed(1)}%`;
  };

  const getSelectedMonthName = () => {
    if (!selectedMonth) return null;
    const [year, month] = selectedMonth.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return date.toLocaleDateString('tr-TR', { year: 'numeric', month: 'long' });
  };

  const analyzeSpending = async () => {
    setLoadingAI(true);
    try {
      // Son 2 ayın verilerini hazırla
      const now = new Date();
      const twoMonthsAgo = new Date(now);
      twoMonthsAgo.setMonth(twoMonthsAgo.getMonth() - 2);
      
      const recentTransactions = transactions.filter(t => {
        const tDate = new Date(t.date);
        return tDate >= twoMonthsAgo && t.type === "expense";
      });

      // Kategori bazlı özet hazırla
      const categoryTotals: { [key: string]: number } = {};
      recentTransactions.forEach(t => {
        const cat = t.category;
        if (!categoryTotals[cat]) categoryTotals[cat] = 0;
        categoryTotals[cat] += t.amount;
      });

      const summary = Object.entries(categoryTotals)
        .sort((a, b) => b[1] - a[1])
        .map(([cat, total]) => `${cat}: ${total.toFixed(2)} TL`)
        .join(', ');

      // Gemini API'ye gönder
      const prompt = `Sen bir finansal danışman asistanısın. Aşağıdaki son 2 aylık harcama verisini analiz et ve kullanıcıya kısa, öz ve anlamlı bir içgörü sun. Hangi kategorilere en çok harcama yapıldığını belirt ve kısa bir öneri ver. Maksimum 2-3 cümle ile cevapla, Türkçe yaz:\n\nHarcama özeti: ${summary}\n\nToplam işlem sayısı: ${recentTransactions.length}`;

      const res = await fetch('/api/ai-analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt })
      });

      const data = await res.json();
      if (res.ok) {
        setAiInsight(data.insight);
      } else {
        setAiInsight('Analiz yapılırken bir hata oluştu.');
      }
    } catch (error) {
      console.error(error);
      setAiInsight('AI analizi şu anda kullanılamıyor.');
    } finally {
      setLoadingAI(false);
    }
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
          <div className="flex flex-col gap-1 sm:gap-2">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black neon-text uppercase tracking-tighter">Finansal Analiz Paneli</h1>
            <p className="text-slate-500 font-bold uppercase tracking-widest text-[9px] sm:text-[10px] md:text-xs">
              {selectedMonth ? `${getSelectedMonthName()} Dönemi` : "Derinlemesine Harcama ve Gelir İstatistikleri"}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            {/* Ay Seçici */}
            <div className="flex items-center gap-2">
              <div className="relative">
                <Calendar className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 text-primary h-3 sm:h-4 w-3 sm:w-4 z-10 pointer-events-none" />
                <input
                  type="month"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="w-[150px] sm:w-[180px] h-9 sm:h-10 bg-card/40 border border-white/5 rounded-xl pl-8 sm:pl-10 pr-2 sm:pr-3 text-[10px] sm:text-xs font-black uppercase tracking-widest text-white focus:ring-0 focus:border-primary/50 hover:border-primary/30 transition-all appearance-none cursor-pointer"
                  style={{ colorScheme: 'dark' }}
                />
              </div>
              {selectedMonth && (
                <Button
                  onClick={() => setSelectedMonth("")}
                  variant="ghost"
                  size="sm"
                  className="h-9 sm:h-10 px-2 sm:px-3 rounded-xl text-[10px] sm:text-xs font-black uppercase text-primary hover:bg-primary/10"
                >
                  Temizle
                </Button>
              )}
            </div>
            
            {/* Kur Seçici */}
            <div className="flex items-center gap-2 sm:gap-3 bg-card/40 backdrop-blur-xl p-1.5 sm:p-2 rounded-xl border border-white/5">
              {loadingRates && <RefreshCw size={12} className="animate-spin text-primary sm:w-3.5 sm:h-3.5" />}
              <Select value={displayCurrency} onValueChange={setDisplayCurrency}>
                <SelectTrigger className="w-[90px] sm:w-[110px] h-8 sm:h-9 bg-transparent border-none rounded-lg text-xs sm:text-sm font-black focus:ring-0">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-card/95 backdrop-blur-xl border-white/10 rounded-xl overflow-hidden">
                  <SelectItem value="TRY" className="text-xs sm:text-sm font-bold hover:bg-primary/20 hover:text-black">TRY (₺)</SelectItem>
                  <SelectItem value="USD" className="text-xs sm:text-sm font-bold hover:bg-primary/20 hover:text-black">USD ($)</SelectItem>
                  <SelectItem value="EUR" className="text-xs sm:text-sm font-bold hover:bg-primary/20 hover:text-black">EUR (€)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* AI İçgörü Kartı */}
        <Card className="bg-gradient-to-br from-primary/10 via-card/30 to-card/30 border-primary/20 rounded-[2rem] overflow-hidden backdrop-blur-2xl">
          <CardHeader>
            <CardTitle className="text-sm font-black uppercase tracking-[0.2em] text-primary flex items-center gap-2">
              <Sparkles className="h-4 w-4" /> AI Harcama Analizi
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {aiInsight ? (
              <div className="bg-card/40 backdrop-blur-xl p-6 rounded-2xl border border-white/5">
                <p className="text-sm leading-relaxed text-slate-300 font-medium">{aiInsight}</p>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-xs text-slate-500 uppercase tracking-widest mb-4">Son 2 aylık harcamalarınızı AI ile analiz edin</p>
                <Button
                  onClick={analyzeSpending}
                  disabled={loadingAI || transactions.length === 0}
                  className="bg-primary/20 hover:bg-primary/30 border border-primary/30 text-primary font-black uppercase tracking-widest rounded-xl"
                >
                  {loadingAI ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Analiz Ediliyor...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-4 w-4" />
                      Analiz Yap
                    </>
                  )}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

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
