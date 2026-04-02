export type TransactionType = "income" | "expense";

export interface Transaction {
  _id?: string;
  id?: string;
  type: TransactionType;
  amount: number;
  category: string;
  date: string;
  currency?: string;
  description?: string;
}