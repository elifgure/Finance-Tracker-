"use client";

import MainLayout from "@/components/layout/MainLayout";
import AddTransactionModal from "@/components/dashboard/AddTransactionModal";
import TransactionList from "@/components/dashboard/TransactionList";
import DateRangeSummary from "@/components/dashboard/DateRangeSummary";
import MiniChart from "@/components/dashboard/MiniChart";
import CategoryShowcase from "@/components/dashboard/CategoryShowcase";
import { useState, useEffect } from "react";
import { Transaction as TransactionType } from "@/types/transaction";
import { Loader2 } from "lucide-react";

export default function Home() {
  const [transactions, setTransactions] = useState<TransactionType[]>([]);
  const [displayCurrency, setDisplayCurrency] = useState("TRY");
  const [loading, setLoading] = useState(true);

  const fetchTransactions = async () => {
    try {
      const res = await fetch("/api/transactions");
      if (res.ok) {
        const data = await res.json();
        setTransactions(data);
      }
    } catch (error) {
      console.error("İşlemler yüklenemedi:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <MainLayout>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Sol Kolon: Butonlar ve Grafik (5 birim) */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <div className="grid grid-cols-2 gap-4">
            <AddTransactionModal type="income" onAdd={fetchTransactions} />
            <AddTransactionModal type="expense" onAdd={fetchTransactions} />
          </div>
          <div className="flex-1">
            <MiniChart transactions={transactions} displayCurrency={displayCurrency} />
          </div>
        </div>

        {/* Sağ Kolon: Analiz Özeti (7 birim - daha büyük) */}
        <div className="lg:col-span-7 flex flex-col">
          <DateRangeSummary 
            transactions={transactions} 
            onCurrencyChange={setDisplayCurrency}
            displayCurrency={displayCurrency}
          />
        </div>
      </div>
      
      <div className="mt-8">
        <TransactionList 
          transactions={transactions} 
          displayCurrency={displayCurrency}
        />
      </div>

      <CategoryShowcase 
        transactions={transactions} 
        displayCurrency={displayCurrency} 
      />
    </MainLayout>
  );
}