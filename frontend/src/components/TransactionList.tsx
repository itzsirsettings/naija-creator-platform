import { ArrowDownLeft, ArrowUpRight } from "lucide-react"
import { formatNaira } from "@/utils/format"

export default function TransactionList({ transactions, limit }: { transactions: any[]; limit?: number }) {
  const visible = limit ? transactions.slice(0, limit) : transactions

  return (
    <div className="divide-y">
      {visible.map((tx) => {
        const Icon = tx.type === "credit" ? ArrowDownLeft : ArrowUpRight
        return (
          <div key={tx.id} className="flex items-center justify-between gap-3 py-3">
            <div className="flex items-center gap-3 min-w-0">
              {tx.logo && /^https?:\/\//i.test(tx.logo) ? (
                <img className="size-8 rounded-full" src={tx.logo} alt="" />
              ) : (
                <div className={`flex size-8 items-center justify-center rounded-full ${tx.type === "debit" ? "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400" : "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400"}`}>
                  <Icon className="size-4" />
                </div>
              )}
              <div className="min-w-0">
                <div className="text-sm font-medium truncate">{tx.label}</div>
                <div className="text-xs text-muted-foreground truncate">
                  {tx.counterparty} &middot; {new Date(tx.date).toLocaleDateString("en-NG", { month: "short", day: "numeric" })} &middot; {tx.status}
                </div>
              </div>
            </div>
            <div className={`shrink-0 text-sm font-medium ${tx.type === "credit" ? "text-green-600 dark:text-green-400" : "text-foreground"}`}>
              {tx.type === "credit" ? "+" : "-"}{formatNaira(tx.amount)}
            </div>
          </div>
        )
      })}
    </div>
  )
}
