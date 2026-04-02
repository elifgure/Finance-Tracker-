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
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 7);
    return d.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(() => {
    return new Date().toISOString().split('T')[0];
  });

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

    // PDF yüklemesi olduğunda localStorage'dan kontrol et
    const checkPdfUpload = () => {
      const pdfUploaded = localStorage.getItem('pdfUploaded');
      if (pdfUploaded === 'true') {
        localStorage.removeItem('pdfUploaded');
        fetchTransactions();
      }
    };

    // İlk mount'ta kontrol et
    checkPdfUpload();

    // Her 5 saniyede bir kontrol et (PDF upload olmuş mu diye)
    const interval = setInterval(checkPdfUpload, 5000);

    // Sayfa odağa geldiğinde transactions'ları yenile
    const handleFocus = () => {
      checkPdfUpload();
      fetchTransactions();
    };

    window.addEventListener('focus', handleFocus);
    
    return () => {
      window.removeEventListener('focus', handleFocus);
      clearInterval(interval);
    };
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
            <MiniChart 
              transactions={transactions} 
              displayCurrency={displayCurrency}
              startDate={startDate}
              endDate={endDate}
            />
          </div>
        </div>

        {/* Sağ Kolon: Analiz Özeti (7 birim - daha büyük) */}
        <div className="lg:col-span-7 flex flex-col">
          <DateRangeSummary 
            transactions={transactions} 
            onCurrencyChange={setDisplayCurrency}
            displayCurrency={displayCurrency}
            startDate={startDate}
            endDate={endDate}
            onDateChange={(start, end) => {
              setStartDate(start);
              setEndDate(end);
            }}
          />
        </div>
      </div>
      
      <div className="mt-8">
        <TransactionList 
          transactions={transactions} 
          displayCurrency={displayCurrency}
          onRefresh={fetchTransactions}
        />
      </div>

      <CategoryShowcase 
        transactions={transactions} 
        displayCurrency={displayCurrency} 
      />
    </MainLayout>
  );
}