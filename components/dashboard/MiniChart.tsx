"use client";

import React, { useMemo, useState, useEffect } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Transaction } from "@/types/transaction";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

interface MiniChartProps {
  transactions: Transaction[];
  displayCurrency: string;
}

interface Rates {
  [key: string]: number;
}

interface TooltipProps {
  active?: boolean;
  payload?: Array<{
    name: string;
    value: number;
    color: string;
  }>;
  label?: string;
  displayCurrency?: string;
}

const CustomTooltip = ({ active, payload, label, displayCurrency }: TooltipProps) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card/95 backdrop-blur-md border border-white/10 p-4 rounded-xl shadow-2xl">
        <p className="text-xs font-bold mb-2 text-slate-400 uppercase tracking-tighter">{label}</p>
        {payload.map((entry, index: number) => (
          <div key={index} className="flex items-center gap-2 mb-1">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
            <p className="text-sm font-black" style={{ color: entry.color }}>
              {entry.name === "income" ? "Gelir" : "Gider"}: {entry.value.toLocaleString()} {displayCurrency}
            </p>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export default function MiniChart({ transactions, displayCurrency }: MiniChartProps) {
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

  const chartData = useMemo(() => {
    const summary: { [key: string]: { income: number; expense: number } } = {};

    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

    const getConvertedAmount = (t: Transaction) => {
      const amount = t.amount;
      const tCurrency = t.currency || "TRY";
      if (tCurrency === displayCurrency) return amount;
      const amountInTRY = tCurrency === "TRY" ? amount : amount / (rates[tCurrency] || 1);
      return amountInTRY * (rates[displayCurrency] || 1);
    };

    const sortedTransactions = [...transactions]
      .filter(t => new Date(t.date) >= oneMonthAgo)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    sortedTransactions.forEach((t) => {
      const dateStr = new Date(t.date).toLocaleDateString("tr-TR", {
        day: "numeric",
        month: "short",
      });
      if (!summary[dateStr]) {
        summary[dateStr] = { income: 0, expense: 0 };
      }
      const convertedAmount = getConvertedAmount(t);
      if (t.type === "income") {
        summary[dateStr].income += convertedAmount;
      } else {
        summary[dateStr].expense += convertedAmount;
      }
    });

    return Object.entries(summary).map(([name, data]) => ({
      name,
      income: Number(data.income.toFixed(2)),
      expense: Number(data.expense.toFixed(2)),
    }));
  }, [transactions, displayCurrency, rates]);

  return (
    <Card className="border-none shadow-sm bg-card/40 backdrop-blur-xl rounded-2xl flex flex-col h-full overflow-hidden border border-white/5 neon-card-glow">
      <CardHeader className="pb-2 flex flex-row items-center justify-between">
        <CardTitle className="text-xs font-bold text-slate-500 uppercase tracking-[0.2em] neon-text">
          Finansal Analiz
        </CardTitle>
        <Link href="/grafik" className="text-[10px] font-bold text-primary flex items-center hover:opacity-80 transition-opacity">
          Tüm Grafikleri Gör <ChevronRight className="h-3 w-3 ml-1" />
        </Link>
      </CardHeader>
      <CardContent className="flex-1 pb-2">
        <div className="h-[220px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#05ed99" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#05ed99" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(5, 237, 153, 0.05)" />
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: "#64748b", fontSize: 10, fontWeight: 600 }}
                dy={10}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: "#64748b", fontSize: 10, fontWeight: 600 }}
              />
              <Tooltip content={<CustomTooltip displayCurrency={displayCurrency} />} cursor={{ stroke: "rgba(5, 237, 153, 0.2)", strokeWidth: 2 }} />
              <Area
                type="monotone"
                dataKey="income"
                stroke="#05ed99"
                strokeWidth={4}
                fillOpacity={1}
                fill="url(#colorIncome)"
                animationDuration={1500}
              />
              <Area
                type="monotone"
                dataKey="expense"
                stroke="#ef4444"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorExpense)"
                animationDuration={1500}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
