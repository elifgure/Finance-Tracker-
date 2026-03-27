"use client";

import { useSession, signOut } from "next-auth/react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { LogOut, User, Settings } from "lucide-react";
import Link from "next/link";

export default function UserProfile() {
  const { data: session } = useSession();

  if (!session) {
    return (
      <Link href="/login">
        <Button variant="outline" className="rounded-xl font-bold">
          Giriş Yap
        </Button>
      </Link>
    );
  }

  const userInitials = session.user?.name
    ? session.user.name.split(" ").map((n) => n[0]).join("").toUpperCase()
    : "U";

  return (
    <div className="relative">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-12 w-auto flex items-center gap-3 px-2 hover:bg-white/20 rounded-2xl transition-all duration-300">
            <span className="hidden lg:block text-sm font-bold text-foreground">
              {session.user?.name}
            </span>
            <Avatar className="h-10 w-10 border-2 border-primary/20 shadow-sm">
              <AvatarImage src={session.user?.image || ""} />
              <AvatarFallback className="bg-primary/10 text-primary font-bold">
                {userInitials}
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56 mt-2 bg-card/95 backdrop-blur-xl border-none shadow-2xl rounded-2xl p-2" align="end">
          <DropdownMenuLabel className="font-sans px-2 py-1.5 text-xs text-secondary font-bold uppercase tracking-wider">
            Hesabım
          </DropdownMenuLabel>
          <DropdownMenuSeparator className="bg-foreground/5 mx-1" />
          <DropdownMenuItem className="flex items-center gap-2 p-2 focus:bg-primary/10 rounded-xl cursor-pointer transition-colors group">
            <User size={18} className="text-secondary group-hover:text-primary transition-colors" />
            <span className="font-semibold text-foreground">Profil Düzenle</span>
          </DropdownMenuItem>
          <DropdownMenuItem className="flex items-center gap-2 p-2 focus:bg-primary/10 rounded-xl cursor-pointer transition-colors group">
            <Settings size={18} className="text-secondary group-hover:text-primary transition-colors" />
            <span className="font-semibold text-foreground">Ayarlar</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator className="bg-foreground/5 mx-1" />
          <DropdownMenuItem 
            className="flex items-center gap-2 p-2 focus:bg-rose-500/10 rounded-xl cursor-pointer transition-colors group text-rose-500 font-bold"
            onClick={() => signOut({ callbackUrl: "/login" })}
          >
            <LogOut size={18} />
            <span>Çıkış Yap</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
