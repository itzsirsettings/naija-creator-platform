"use client"

import { useCallback, useEffect, useState } from "react"
import { Wallet, ArrowUpRight, ArrowDownLeft, Loader2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import TransactionList from "@/components/TransactionList"
import { useAuth } from "@/context/AuthContext"
import { fetchTransactions, type Transaction } from "@/services/payments"
import { formatNaira } from "@/utils/format"

function toDisplayTx(tx: Transaction) {
  const isCredit = tx.status === "paid" || tx.status === "refunded" ? "credit" : "debit"
  return {
    id: tx.id,
    type: isCredit,
    amount: tx.netKobo / 100,
    label: tx.offer?.title ?? "Transaction",
    counterparty: tx.offer?.brand?.name ?? "-",
    date: tx.createdAt,
    status: tx.status === "paid" ? "Completed" : tx.status.charAt(0).toUpperCase() + tx.status.slice(1),
  }
}

export default function Payments() {
  const { user } = useAuth()
  const [transactions, setTransactions] = useState<ReturnType<typeof toDisplayTx>[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("all")

  const loadTransactions = useCallback(async () => {
    if (!user || !user.creatorId) {
      setIsLoading(false)
      return
    }
    setIsLoading(true)
    setError(null)
    try {
      const txs = await fetchTransactions(user.creatorId)
      setTransactions(txs.map(toDisplayTx))
    } catch {
      setError("Failed to load transactions.")
    } finally {
      setIsLoading(false)
    }
  }, [user])

  useEffect(() => { loadTransactions() }, [loadTransactions])

  const credits = transactions.filter((tx) => tx.type === "credit")
  const debits = transactions.filter((tx) => tx.type === "debit")

  if (!user) return null

  return (
    <div className="space-y-6 bg-background text-foreground min-h-full">
      <div>
        <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground">Payments</h1>
        <p className="text-sm text-muted-foreground">
          Track your transactions, wallet balance, and payment history.
        </p>
      </div>

      <Card className="rounded-xl border border-border bg-card p-5 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between p-0 mb-4">
          <div>
            <CardTitle className="font-heading text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              Available Balance
            </CardTitle>
            <div className="mt-2 text-4xl font-semibold font-heading tabular-nums text-[#0A0A9F]">
              {formatNaira(user.walletBalance)}
            </div>
            {user.walletHeld > 0 && (
              <p className="mt-1.5 text-xs text-muted-foreground">
                <span className="font-medium tabular-nums text-amber-600">{formatNaira(user.walletHeld)}</span>
                {" "}in escrow; releases when the brand approves your work
              </p>
            )}
          </div>
          <div className="flex size-12 items-center justify-center rounded-lg bg-[#0A0A9F]/10 text-[#0A0A9F]">
            <Wallet className="size-6 stroke-[2]" />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="flex gap-3 text-xs font-medium">
            <div className="flex items-center gap-1.5 rounded-md bg-[#0A0A9F]/10 px-2 py-0.5 text-[#0A0A9F]">
              <ArrowDownLeft className="size-3.5 stroke-2" />
              <span className="tabular-nums">{formatNaira(credits.reduce((s, t) => s + t.amount, 0))} credits</span>
            </div>
            <div className="flex items-center gap-1.5 rounded-md bg-muted px-2 py-0.5 text-muted-foreground">
              <ArrowUpRight className="size-3.5 stroke-2" />
              <span className="tabular-nums">{formatNaira(debits.reduce((s, t) => s + t.amount, 0))} debits</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-xl border border-border bg-card p-5 shadow-sm">
        <CardHeader className="p-0 mb-4">
          <CardTitle className="font-heading text-sm font-semibold text-foreground">Transaction History</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex flex-col items-center gap-2 py-12 text-center">
              <Loader2 className="size-6 animate-spin text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Loading transactions...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center gap-3 py-12 text-center">
              <p className="text-sm text-destructive">{error}</p>
              <button onClick={loadTransactions} className="text-sm font-medium text-primary hover:underline">
                Try again
              </button>
            </div>
          ) : (
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-4 bg-muted p-0.5 rounded-lg">
                <TabsTrigger
                  value="all"
                  className="font-medium text-xs px-3 py-1.5 rounded-md transition-colors data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm"
                >
                  All
                </TabsTrigger>
                <TabsTrigger
                  value="credits"
                  className="font-medium text-xs px-3 py-1.5 rounded-md transition-colors data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm"
                >
                  Credits
                </TabsTrigger>
                <TabsTrigger
                  value="debits"
                  className="font-medium text-xs px-3 py-1.5 rounded-md transition-colors data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm"
                >
                  Debits
                </TabsTrigger>
              </TabsList>

              <TabsContent value="all">
                <TransactionList transactions={transactions} />
              </TabsContent>
              <TabsContent value="credits">
                <TransactionList transactions={credits} />
              </TabsContent>
              <TabsContent value="debits">
                <TransactionList transactions={debits} />
              </TabsContent>
            </Tabs>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
