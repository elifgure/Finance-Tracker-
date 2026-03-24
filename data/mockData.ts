import { Transaction } from "@/types/transaction";

export const transactions: Transaction[]=[
      {
    id: "1",
    type: "expense",
    amount: 200,
    category: "Food",
    date: "2026-03-01",
  },
  {
    id: "2",
    type: "income",
    amount: 3000,
    category: "Salary",
    date: "2026-03-02",
  },
]