import { transactions } from "@/data/mockData";
import TransactionCard from "./TransactionCard";

export default function TransactionList(){
    return(
         <div className="flex flex-col gap-3">
      {transactions.map((t) => (
        <TransactionCard key={t.id} t={t} />
      ))}
    </div>
    )
}