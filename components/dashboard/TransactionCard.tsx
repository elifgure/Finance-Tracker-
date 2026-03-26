import { Transaction } from "@/types/transaction";
import { categoryIcons } from "@/utils/categoryIcons";
import { motion } from "framer-motion";
import { cn } from "@/utils/utils";
import { Card, CardContent } from "@/components/ui/card";

export default function TransactionCard({ t }: { t: Transaction }) {
  const Icon = categoryIcons[t.category.toLowerCase()];

  return (
    <motion.div 
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      whileHover={{ scale: 1.01 }}
      className="group"
    >
      <Card className="border-none shadow-sm group-hover:shadow-md transition-all duration-300 bg-card/60 backdrop-blur-xl rounded-2xl overflow-hidden">
        <CardContent className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary/10 text-primary rounded-xl transition-colors group-hover:bg-primary group-hover:text-white">
              {Icon && <Icon size={22} />}
            </div>

            <div>
              <p className="font-bold text-base text-foreground group-hover:text-primary transition-colors italic-none font-sans lowercase capitalize ">{t.category}</p>
              <p className="text-xs font-semibold text-slate-400 dark:text-slate-500">{t.date}</p>
            </div>
          </div>

          <p
            className={cn(
              "text-lg font-black tracking-tighter",
              t.type === "income" ? "text-emerald-500" : "text-rose-500"
            )}
          >
            {t.type === "income" ? "+" : "-"}${t.amount.toLocaleString()}
          </p>
        </CardContent>
      </Card>
    </motion.div>
  );
}

