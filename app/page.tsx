"use client";

import MainLayout from "@/components/layout/MainLayout";
import AddTransactionModal from "@/components/dashboard/AddTransactionModal";
import TransactionList from "@/components/dashboard/TransactionList";
import DateRangeSummary from "@/components/dashboard/DateRangeSummary";
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="grid grid-cols-2 gap-4">
          <AddTransactionModal type="income" onAdd={fetchTransactions} />
          <AddTransactionModal type="expense" onAdd={fetchTransactions} />
        </div>
        <DateRangeSummary 
          transactions={transactions} 
          onCurrencyChange={setDisplayCurrency}
          displayCurrency={displayCurrency}
        />
      </div>
      <TransactionList 
        transactions={transactions} 
        displayCurrency={displayCurrency}
      />
    </MainLayout>
  );
}