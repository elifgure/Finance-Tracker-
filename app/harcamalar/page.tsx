"use client";

import MainLayout from "@/components/layout/MainLayout";
import { Transaction } from "@/types/transaction";
import { useState, useEffect, useMemo } from "react";
import { cn } from "@/utils/utils";
import TransactionCard from "@/components/dashboard/TransactionCard";
import { Loader2, Search, Filter, FileUp, CheckCircle2, AlertCircle, Calendar } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function HarcamalarPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [uploading, setUploading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<string>(""); // Boş = tümü, "YYYY-MM" = seçili ay

  const fetchTransactions = async () => {
    setLoading(true);
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

  useEffect(() => {
    fetchTransactions();
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      setFeedback({ type: "error", message: "Lütfen sadece PDF dosyası yükleyin." });
      return;
    }

    setUploading(true);
    setFeedback(null);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload-bank-pdf", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (res.ok) {
        setFeedback({ type: "success", message: data.message });
        fetchTransactions(); // Listeyi güncelle
        localStorage.setItem('pdfUploaded', 'true'); // Ana sayfaya bildir
      } else {
        setFeedback({ type: "error", message: data.error || "Yükleme başarısız." });
      }
    } catch (error) {
      setFeedback({ type: "error", message: "Bir hata oluştu. Lütfen tekrar deneyin." });
    } finally {
      setUploading(false);
      e.target.value = ""; // Inputu sıfırla
    }
  };

  const filtered = transactions.filter(t => 
    t.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.amount.toString().includes(searchTerm)
  );

  // Ay ve arama filtresi uygula
  const filteredByMonth = useMemo(() => {
    let result = filtered;
    
    // Ay filtreleme - boşsa tümü, doluysa seçili ay
    if (selectedMonth) {
      result = result.filter(t => {
        const date = new Date(t.date);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        return monthKey === selectedMonth;
      });
      return result; // Ay seçiliyse tüm işlemleri göster
    }
    
    // Ay seçili değilse son 10 işlem
    return result.slice(0, 10);
  }, [filtered, selectedMonth]);

  // Seçili ay ismini formatla
  const getSelectedMonthName = () => {
    if (!selectedMonth) return null;
    const [year, month] = selectedMonth.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return date.toLocaleDateString('tr-TR', { year: 'numeric', month: 'long' });
  };

  const handleDelete = () => {
    // Silme sonrası listeyi yenile
    fetchTransactions();
  };

  if (loading && transactions.length === 0) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 sm:gap-6 pb-4 border-b border-white/5">
          <div className="space-y-0.5 sm:space-y-1">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black neon-text uppercase tracking-tighter">İşlem Listesi</h1>
            <p className="text-slate-500 font-bold uppercase tracking-widest text-[8px] sm:text-[9px] md:text-[10px]">
              {selectedMonth 
                ? `${getSelectedMonthName()} - ${filteredByMonth.length} İşlem`
                : `Son 10 İşlem (Toplam ${transactions.length})`
              }
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 md:gap-4">
            {/* Ay Seçici */}
            <div className="flex items-center gap-2">
              <div className="relative flex-1 sm:flex-none">
                <Calendar className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-primary h-3 sm:h-4 w-3 sm:w-4 z-10 pointer-events-none" />
                <input
                  type="month"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="w-full sm:w-[180px] md:w-[200px] h-10 sm:h-11 md:h-12 bg-card/20 border border-white/5 rounded-xl sm:rounded-2xl pl-9 sm:pl-10 md:pl-11 pr-3 sm:pr-4 text-[10px] sm:text-[11px] md:text-xs font-black uppercase tracking-widest text-white focus:ring-0 focus:border-primary/50 hover:border-primary/30 transition-all appearance-none cursor-pointer"
                  style={{
                    colorScheme: 'dark'
                  }}
                />
              </div>
              {selectedMonth && (
                <Button
                  onClick={() => setSelectedMonth("")}
                  variant="ghost"
                  size="sm"
                  className="h-10 sm:h-11 md:h-12 px-3 sm:px-3.5 md:px-4 rounded-xl sm:rounded-2xl text-[10px] sm:text-[11px] md:text-xs font-black uppercase tracking-widest text-primary hover:bg-primary/10"
                >
                  Temizle
                </Button>
              )}
            </div>

            {/* PDF Yükleme Butonu */}
            <div className="relative">
              <input
                type="file"
                accept=".pdf"
                onChange={handleFileUpload}
                className="hidden"
                id="pdf-upload"
                disabled={uploading}
              />
              <label htmlFor="pdf-upload" className="block">
                <Button 
                  asChild
                  variant="outline" 
                  className="w-full bg-primary/10 border-primary/20 hover:bg-primary/20 cursor-pointer h-10 sm:h-11 md:h-12 px-4 sm:px-5 md:px-6 rounded-xl sm:rounded-2xl group transition-all"
                  disabled={uploading}
                >
                  <div className="flex items-center justify-center gap-2">
                    {uploading ? (
                      <Loader2 className="h-3 sm:h-3.5 md:h-4 w-3 sm:w-3.5 md:w-4 animate-spin text-primary" />
                    ) : (
                      <FileUp className="h-3 sm:h-3.5 md:h-4 w-3 sm:w-3.5 md:w-4 text-primary group-hover:scale-110 transition-transform" />
                    )}
                    <span className="text-[10px] sm:text-[11px] md:text-xs font-black uppercase tracking-widest text-primary">
                      {uploading ? "İşleniyor..." : "Banka PDF Yükle"}
                    </span>
                  </div>
                </Button>
              </label>
            </div>

            <div className="relative w-full sm:w-auto md:w-80">
              <Search className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-slate-500 h-3 sm:h-3.5 md:h-4 w-3 sm:w-3.5 md:w-4" />
              <Input 
                placeholder="Ara (Kategori, Tutar...)" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-card/20 border-white/5 pl-9 sm:pl-10 md:pl-11 rounded-xl sm:rounded-2xl h-10 sm:h-11 md:h-12 text-xs sm:text-sm font-bold uppercase tracking-widest placeholder:text-slate-700 focus:border-primary/50 transition-all shadow-2xl"
              />
            </div>
          </div>
        </div>

        {/* Geribildirim Mesajı */}
        {feedback && (
          <div className={cn(
            "p-4 rounded-2xl border flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-300",
            feedback.type === "success" 
              ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" 
              : "bg-rose-500/10 border-rose-500/20 text-rose-400"
          )}>
            {feedback.type === "success" ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
            <span className="text-xs font-bold uppercase tracking-widest">{feedback.message}</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-20">
          {filteredByMonth.length > 0 ? (
            filteredByMonth.map((t, idx) => (
              <TransactionCard 
                key={t._id || idx} 
                t={t} 
                displayCurrency="TRY"
                onDelete={handleDelete}
              />
            ))
          ) : (
            <div className="col-span-full py-40 text-center">
              <div className="bg-card/20 inline-block p-10 rounded-[3rem] border border-dashed border-white/10">
                <Filter className="h-10 w-10 text-slate-800 mx-auto mb-4" />
                <p className="text-slate-600 font-black uppercase tracking-tighter">
                  {selectedMonth 
                    ? "Bu ay için işlem bulunamadı." 
                    : "Henüz işlem kaydı bulunmuyor."}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
