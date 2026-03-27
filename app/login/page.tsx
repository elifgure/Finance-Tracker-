"use client";

import React, { useState } from "react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Wallet } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const res = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (res?.error) {
        setError("Geçersiz e-posta veya şifre.");
        return;
      }

      router.replace("/");
    } catch (err) {
      console.log(err);
      setError("Bir hata oluştu.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md border-none shadow-2xl bg-card/60 backdrop-blur-xl rounded-3xl overflow-hidden text-foreground">
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
          <CardTitle className="text-3xl font-black">Giriş Yap</CardTitle>
          <CardDescription className="text-foreground/70 font-medium">
            Finansal özgürlüğünüze geri dönün
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
            <Button type="submit" className="w-full h-12 text-lg font-bold rounded-xl mt-4 shadow-lg">
              Giriş Yap
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col gap-4 pb-10 pt-4">
          <div className="text-sm text-center text-foreground/70 font-medium">
            Hesabınız yok mu?{" "}
            <Link href="/register" className="text-primary hover:underline font-bold">
              Hemen Kayıt Ol
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
