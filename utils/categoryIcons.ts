import { 
  ShoppingBag, 
  Wallet, 
  Home, 
  User, 
  Utensils, 
  Car,
  TrendingUp,
  CreditCard,
  PlusCircle,
  LucideIcon
} from "lucide-react";

export const categoryIcons: Record<string, LucideIcon> = {
  market: ShoppingBag,
  maaş: Wallet,
  "ek gelir": TrendingUp,
  kira: Home,
  kişisel: User,
  yemek: Utensils,
  yol: Car,
  ekstra: CreditCard,
  unknown: PlusCircle
};