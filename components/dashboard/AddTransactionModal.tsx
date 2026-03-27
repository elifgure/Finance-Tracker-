"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PlusCircle, MinusCircle, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

interface AddTransactionModalProps {
  type: "income" | "expense";
  onAdd?: () => void;
}

export default function AddTransactionModal({ type, onAdd }: AddTransactionModalProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  
  const categories = type === "income" 
    ? ["Maaş", "Ek Gelir"] 
    : ["Market", "Kira", "Kişisel", "Yemek", "Yol"];

  const currencies = [
    { label: "Türk Lirası (₺)", value: "TRY" },
    { label: "Amerikan Doları ($)", value: "USD" },
    { label: "Euro (€)", value: "EUR" },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.target as HTMLFormElement);
    const data = {
      type,
      date: formData.get("date"),
      category: formData.get("category"),
      amount: Number(formData.get("amount")),
      currency: formData.get("currency"),
    };

    try {
      const res = await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        setOpen(false);
        if (onAdd) {
          onAdd();
        } else {
          router.refresh();
        }
      }
    } catch (error) {
      console.error("Hata:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          variant={type === "income" ? "default" : "destructive"} 
          className="w-full py-5 text-sm font-bold rounded-xl flex gap-1.5 shadow-lg hover:translate-y-[-2px] transition-all"
        >
          {type === "income" ? (
            <PlusCircle size={18} />
          ) : (
            <MinusCircle size={18} />
          )}
          {type === "income" ? "Gelir Ekle" : "Gider Ekle"}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-card/95 backdrop-blur-xl border-none shadow-2xl rounded-3xl text-foreground">
        <DialogHeader>
          <DialogTitle className="text-2xl font-black text-center">
            {type === "income" ? "Gelir Bildir" : "Gider Bildir"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6 pt-4">
          <div className="space-y-2">
            <Label htmlFor="date">Tarih</Label>
            <Input
              id="date"
              name="date"
              type="date"
              required
              className="bg-background/50 border-none h-12 rounded-xl text-foreground"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="category">Kategori</Label>
            <Select name="category" required>
              <SelectTrigger className="bg-background/50 border-none h-12 rounded-xl text-foreground">
                <SelectValue placeholder="Kategori seçin" />
              </SelectTrigger>
              <SelectContent className="bg-card/95 backdrop-blur-xl border-slate-200/10 shadow-2xl">
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Tutar</Label>
              <Input
                id="amount"
                name="amount"
                type="number"
                placeholder="0.00"
                required
                className="bg-background/50 border-none h-12 rounded-xl text-foreground"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="currency">Para Birimi</Label>
              <Select name="currency" defaultValue="TRY">
                <SelectTrigger className="bg-background/50 border-none h-12 rounded-xl text-foreground">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-card/95 backdrop-blur-xl border-slate-200/10 shadow-2xl">
                  {currencies.map((curr) => (
                    <SelectItem key={curr.value} value={curr.value}>
                      {curr.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button 
            disabled={loading}
            type="submit" 
            className="w-full h-14 text-lg font-bold rounded-xl shadow-lg"
          >
            {loading ? <Loader2 className="animate-spin" /> : "Kaydet"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
