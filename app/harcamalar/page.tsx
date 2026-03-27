"use client";

import MainLayout from "@/components/layout/MainLayout";
import { Transaction } from "@/types/transaction";
import { useState, useEffect } from "react";
import TransactionCard from "@/components/dashboard/TransactionCard";
import { Loader2, Search, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";

export default function HarcamalarPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

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

  const filtered = transactions.filter(t => 
    t.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.amount.toString().includes(searchTerm)
  );

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
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-4 border-b border-white/5">
          <div className="space-y-1">
            <h1 className="text-4xl font-black neon-text uppercase tracking-tighter">İşlem Listesi</h1>
            <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Toplam {transactions.length} Kayıtlı Veri</p>
          </div>
          <div className="relative w-full md:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 h-4 w-4" />
            <Input 
              placeholder="Ara (Kategori, Tutar...)" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-card/20 border-white/5 pl-11 rounded-2xl h-12 text-sm font-bold uppercase tracking-widest placeholder:text-slate-700 focus:border-primary/50 transition-all shadow-2xl"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.length > 0 ? (
            filtered.map((t, idx) => (
              <TransactionCard key={t._id || idx} t={t} displayCurrency="TRY" />
            ))
          ) : (
            <div className="col-span-full py-40 text-center">
              <div className="bg-card/20 inline-block p-10 rounded-[3rem] border border-dashed border-white/10">
                <Filter className="h-10 w-10 text-slate-800 mx-auto mb-4" />
                <p className="text-slate-600 font-black uppercase tracking-tighter">Arama kriterlerine uygun işlem bulunamadı.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
