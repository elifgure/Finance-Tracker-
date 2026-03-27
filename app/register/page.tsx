"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { PlusCircle } from "lucide-react";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, password }),
      });

      if (res.ok) {
        router.push("/login");
      } else {
        const data = await res.json();
        setError(data.message || "Bir hata oluştu.");
      }
    } catch (err) {
      console.log(err);
      setError("Bağlantı hatası oluştu.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 text-foreground">
      <Card className="w-full max-w-md border-none shadow-2xl bg-card/60 backdrop-blur-xl rounded-3xl overflow-hidden mt-8 mb-8">
        <CardHeader className="space-y-1 flex flex-col items-center pb-8 pt-10">
          <div className="relative w-64 h-24 mb-4">
            <Image 
              src="/images/FinanceAI-logo-transparent.png" 
              alt="Finance AI Logo" 
              fill
              className="object-contain"
              priority
            />
          </div>
          <CardTitle className="text-3xl font-black">Yeni Kayıt</CardTitle>
          <CardDescription className="text-foreground/70 font-medium text-center">
            Harcamalarını takip etmeye başla
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl text-sm font-bold text-center">
                {error}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="name">Ad Soyad</Label>
              <Input
                id="name"
                type="text"
                placeholder="Adınız ve Soyadınız"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="bg-background/50 border-none h-12 rounded-xl text-foreground"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">E-posta</Label>
              <Input
                id="email"
                type="email"
                placeholder="ornek@mail.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-background/50 border-none h-12 rounded-xl text-foreground"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Şifre</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-background/50 border-none h-12 rounded-xl text-foreground"
              />
            </div>
            <Button disabled={loading} type="submit" className="w-full h-12 text-lg font-bold rounded-xl mt-4 shadow-lg">
              {loading ? "Kaydediliyor..." : "Kayıt Ol"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col gap-4 pb-10 pt-4">
          <div className="text-sm text-center text-foreground/70 font-medium">
            Zaten hesabınız var mı?{" "}
            <Link href="/login" className="text-primary hover:underline font-bold">
              Şimdi Giriş Yap
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
