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
import { Loader2, TrendingUp, TrendingDown, Target } from "lucide-react";

export default function GrafikPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

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

  const categoryData = useMemo(() => {
    const categories: { [key: string]: number } = {};
    transactions.filter(t => t.type === "expense").forEach((t) => {
      const cat = t.category.toLowerCase();
      if (!categories[cat]) categories[cat] = 0;
      categories[cat] += t.amount;
    });
    return Object.entries(categories)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [transactions]);

  const COLORS = ['#22c55e', '#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'];

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
        <div className="flex flex-col gap-2">
          <h1 className="text-4xl font-black neon-text uppercase tracking-tighter">Finansal Analiz Paneli</h1>
          <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Derinlemesine Harcama ve Gelir İstatistikleri</p>
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
                    contentStyle={{ backgroundColor: '#080c14', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '1rem' }}
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
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />
                    ))}
                  </Pie>
                  <Tooltip 
                     contentStyle={{ backgroundColor: '#080c14', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '1rem' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}
