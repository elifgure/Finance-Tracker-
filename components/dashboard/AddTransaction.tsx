"use client";

import { useState } from "react";
import { Plus, Wallet, Tag } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";

export default function AddTransaction() {
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-10"
    >
      <Card className="border-none shadow-xl bg-card/50 backdrop-blur-sm rounded-3xl overflow-hidden">
        <CardContent className="p-6 md:p-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold flex items-center gap-2 text-slate-500 dark:text-slate-400">
                <Wallet size={16} className="text-primary" />
                Miktar
              </label>
              <Input
                type="number"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="h-12 rounded-xl bg-background/50 border-slate-200 dark:border-slate-800 focus-visible:ring-primary font-bold text-lg"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold flex items-center gap-2 text-slate-500 dark:text-slate-400">
                <Tag size={16} className="text-primary" />
                Kategori
              </label>
              <Input
                placeholder="Örn: Market, Kira..."
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="h-12 rounded-xl bg-background/50 border-slate-200 dark:border-slate-800 focus-visible:ring-primary font-medium"
              />
            </div>

            <div className="flex items-end">
              <Button 
                className="w-full h-12 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98] gap-2"
              >
                <Plus size={20} strokeWidth={3} />
                İşlem Ekle
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

