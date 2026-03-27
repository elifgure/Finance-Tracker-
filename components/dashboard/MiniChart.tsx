"use client";

import React, { useMemo } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Defs,
  LinearGradient,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Transaction } from "@/types/transaction";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

interface MiniChartProps {
  transactions: Transaction[];
  displayCurrency: string;
}

export default function MiniChart({ transactions, displayCurrency }: MiniChartProps) {
  const chartData = useMemo(() => {
    const summary: { [key: string]: { income: number; expense: number } } = {};

    const sortedTransactions = [...transactions].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    sortedTransactions.slice(-10).forEach((t) => {
      const dateStr = new Date(t.date).toLocaleDateString("tr-TR", {
        day: "numeric",
        month: "short",
      });
      if (!summary[dateStr]) {
        summary[dateStr] = { income: 0, expense: 0 };
      }
      if (t.type === "income") {
        summary[dateStr].income += t.amount;
      } else {
        summary[dateStr].expense += t.amount;
      }
    });

    return Object.entries(summary).map(([name, data]) => ({
      name,
      income: data.income,
      expense: data.expense,
    }));
  }, [transactions]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card/95 backdrop-blur-md border border-white/10 p-3 rounded-xl shadow-xl">
          <p className="text-xs font-bold mb-2 text-secondary-foreground">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm font-black" style={{ color: entry.color }}>
              {entry.name === "income" ? "Gelir" : "Gider"}: {entry.value.toLocaleString()} {displayCurrency}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="border-none shadow-sm bg-card/60 backdrop-blur-xl rounded-2xl flex flex-col h-full overflow-hidden">
      <CardHeader className="pb-2 flex flex-row items-center justify-between">
        <CardTitle className="text-sm font-bold text-slate-400 uppercase tracking-wider">
          Finansal Akış Trendi
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 pb-2">
        <div className="h-[200px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: "#64748b", fontSize: 10, fontWeight: 600 }}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: "#64748b", fontSize: 10, fontWeight: 600 }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area 
                type="monotone" 
                dataKey="income" 
                stroke="#10b981" 
                strokeWidth={3}
                fillOpacity={1} 
                fill="url(#colorIncome)" 
              />
              <Area 
                type="monotone" 
                dataKey="expense" 
                stroke="#f43f5e" 
                strokeWidth={3}
                fillOpacity={1} 
                fill="url(#colorExpense)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        
        <Link 
          href="/grafik" 
          className="flex items-center justify-center gap-1 mt-4 py-2 text-xs font-bold text-primary hover:bg-primary/5 rounded-xl transition-colors border border-primary/10"
        >
          Tüm Grafikleri Gör
          <ChevronRight size={14} />
        </Link>
      </CardContent>
    </Card>
  );
}
