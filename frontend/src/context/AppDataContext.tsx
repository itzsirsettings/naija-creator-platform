"use client"

import { createContext, useContext, useMemo, useState } from "react"
import { mockBrandDashboard, mockCreators, mockCreatorDashboard, mockTransactions } from "@/data/mockData"

interface AppDataContextValue {
  brandDashboard: typeof mockBrandDashboard
  creatorDashboard: typeof mockCreatorDashboard
  creators: typeof mockCreators
  transactions: typeof mockTransactions
  addTransaction: (tx: any) => void
  addOffer: (offer: any) => void
}

const AppDataContext = createContext<AppDataContextValue | null>(null)

export function AppDataProvider({ children }: { children: React.ReactNode }) {
  const [creators, setCreators] = useState(mockCreators)
  const [transactions, setTransactions] = useState(mockTransactions)
  const [brandDashboard, setBrandDashboard] = useState(mockBrandDashboard)
  const [creatorDashboard, setCreatorDashboard] = useState(mockCreatorDashboard)

  const value = useMemo(() => ({
    brandDashboard,
    creatorDashboard,
    creators,
    transactions,
    addTransaction: (tx: any) => setTransactions((prev) => [tx, ...prev]),
    addOffer: (offer: any) => setBrandDashboard((prev) => ({
      ...prev,
      recentOffers: [{ ...offer, status: "PENDING" }, ...prev.recentOffers],
    })),
  }), [brandDashboard, creatorDashboard, creators, transactions])

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>
}

export function useAppData() {
  const context = useContext(AppDataContext)
  if (!context) throw new Error("useAppData must be used within AppDataProvider")
  return context
}
