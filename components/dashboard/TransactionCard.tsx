import { Transaction } from "@/types/transaction";


export default function TransactionCard({t}: {t: Transaction}){
      return (
    <div className="flex justify-between p-4 border rounded-xl">
      <div>
        <p className="font-semibold">{t.category}</p>
        <p className="text-sm text-gray-500">{t.date}</p>
      </div>

      <p
        className={
          t.type === "income" ? "text-green-500" : "text-red-500"
        }
      >
        {t.type === "income" ? "+" : "-"}${t.amount}
      </p>
    </div>
  );
}