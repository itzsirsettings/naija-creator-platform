"use client"

import { useCallback, useEffect, useState } from "react"
import { BadgeCheck, Building2, Crown, FileLock2, Loader2, Settings as SettingsIcon } from "lucide-react"
import { toast } from "sonner"
import { Link } from "@/lib/router"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/context/AuthContext"
import { usePremium } from "@/hooks/usePremium"
import {
  fetchCreatorById, updateCreator,
  fetchBanks, addBankAccount,
  type Bank,
} from "@/services/creators"

export default function Settings() {
  const { user } = useAuth()
  const ent = usePremium()
  const [policy, setPolicy] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [busy, setBusy] = useState(false)

  // Bank account state
  const [banks, setBanks] = useState<Bank[]>([])
  const [bankSearch, setBankSearch] = useState("")
  const [selectedBank, setSelectedBank] = useState<Bank | null>(null)
  const [accountNumber, setAccountNumber] = useState("")
  const [bankBusy, setBankBusy] = useState(false)
  const [savedBank, setSavedBank] = useState<{ name: string | null; last4: string | null; accountName: string | null } | null>(null)
  const [showBankForm, setShowBankForm] = useState(false)

  const isCreator = user?.role === "creator"

  const filteredBanks = banks.filter(b =>
    b.name.toLowerCase().includes(bankSearch.toLowerCase())
  )

  const load = useCallback(async () => {
    if (!isCreator || !user?.creatorId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const [creator, bankList] = await Promise.all([
        fetchCreatorById(user.creatorId),
        fetchBanks(),
      ])
      setPolicy(creator.usageRightsPolicy ?? "")
      setBanks(bankList)
      // @ts-ignore — bankBankName / bankAccountLast4 / bankAccountName on creator
      if (creator.bankAccountLast4) {
        setSavedBank({
          // @ts-ignore
          name: creator.bankBankName ?? null,
          // @ts-ignore
          last4: creator.bankAccountLast4 ?? null,
          // @ts-ignore
          accountName: creator.bankAccountName ?? null,
        })
      }
    } catch { /* ignore */ } finally { setIsLoading(false) }
  }, [isCreator, user?.creatorId])

  useEffect(() => { load() }, [load])

  const savePolicy = async () => {
    if (!user?.creatorId) return
    setBusy(true)
    try {
      await updateCreator(user.creatorId, { usageRightsPolicy: policy.trim() })
      toast.success("Usage rights policy saved")
    } catch (err: any) {
      toast.error(err?.response?.data?.error || "Could not save policy")
    } finally { setBusy(false) }
  }

  const saveBankAccount = async () => {
    if (!user?.creatorId || !selectedBank || accountNumber.length < 10) return
    setBankBusy(true)
    try {
      const result = await addBankAccount(user.creatorId, {
        accountNumber,
        bankCode: selectedBank.code,
        bankName: selectedBank.name,
      })
      setSavedBank({ name: result.bankName, last4: result.bankLast4, accountName: result.accountName })
      setShowBankForm(false)
      setAccountNumber("")
      setSelectedBank(null)
      setBankSearch("")
      toast.success(result.message || "Bank account saved")
    } catch (err: any) {
      toast.error(err?.response?.data?.error || "Could not verify bank account")
    } finally { setBankBusy(false) }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="flex items-center gap-2 font-heading text-2xl font-bold tracking-tight">
          <SettingsIcon className="size-6" /> Settings
        </h1>
        <p className="text-muted-foreground">Manage your account preferences.</p>
      </div>

      {isCreator ? (
        <>
          {/* Bank Account Section */}
          <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
            <div className="flex items-center gap-2">
              <Building2 className="size-4 text-[#2f6bff]" />
              <h2 className="font-heading text-sm font-semibold">Payout Bank Account</h2>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Your Nigerian bank account where earnings will be paid after offer approval.
            </p>

            {isLoading ? (
              <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="size-4 animate-spin" /> Loading…
              </div>
            ) : savedBank && !showBankForm ? (
              <div className="mt-4 space-y-3">
                <div className="flex items-center gap-3 rounded-lg border border-border bg-muted/40 px-4 py-3">
                  <BadgeCheck className="size-5 text-green-500 shrink-0" />
                  <div>
                    <p className="text-sm font-medium">{savedBank.accountName ?? "Verified account"}</p>
                    <p className="text-xs text-muted-foreground">
                      {savedBank.name} •••• {savedBank.last4}
                    </p>
                  </div>
                </div>
                <Button size="sm" variant="outline" onClick={() => setShowBankForm(true)}>
                  Change bank account
                </Button>
              </div>
            ) : (
              <div className="mt-4 space-y-3">
                {/* Bank search + select */}
                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground">Select bank</label>
                  <Input
                    placeholder="Search bank name…"
                    value={bankSearch}
                    onChange={e => setBankSearch(e.target.value)}
                  />
                  {bankSearch && filteredBanks.length > 0 && (
                    <div className="max-h-48 overflow-y-auto rounded-lg border border-border bg-popover shadow-md">
                      {filteredBanks.slice(0, 20).map(b => (
                        <button
                          key={b.code}
                          className={`w-full px-3 py-2 text-left text-sm hover:bg-muted transition-colors ${selectedBank?.code === b.code ? "bg-muted font-medium" : ""}`}
                          onClick={() => { setSelectedBank(b); setBankSearch(b.name) }}
                        >
                          {b.name}
                        </button>
                      ))}
                    </div>
                  )}
                  {selectedBank && (
                    <p className="text-[11px] text-muted-foreground">Selected: {selectedBank.name}</p>
                  )}
                </div>

                {/* Account number */}
                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground">Account number</label>
                  <Input
                    placeholder="10-digit NUBAN account number"
                    value={accountNumber}
                    onChange={e => setAccountNumber(e.target.value.replace(/\D/g, "").slice(0, 10))}
                    maxLength={10}
                  />
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    onClick={saveBankAccount}
                    disabled={bankBusy || !selectedBank || accountNumber.length < 10}
                  >
                    {bankBusy ? <><Loader2 className="size-3 animate-spin mr-1" /> Verifying…</> : "Save & verify"}
                  </Button>
                  {savedBank && (
                    <Button size="sm" variant="ghost" onClick={() => { setShowBankForm(false); setBankSearch(""); setSelectedBank(null); setAccountNumber("") }}>
                      Cancel
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Usage Rights Policy */}
          <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
            <div className="flex items-center gap-2">
              <FileLock2 className="size-4 text-[#8B5CF6]" />
              <h2 className="font-heading text-sm font-semibold">Content Usage Rights Policy</h2>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Set the default terms brands must agree to when reusing your content. Shown on your profile and in offers.
            </p>

            {!ent.usageRightsControl ? (
              <div className="mt-4 flex flex-col items-center gap-3 rounded-lg border border-dashed border-amber-400/50 bg-amber-50 py-8 text-center dark:bg-amber-950/20">
                <Crown className="size-6 text-amber-500" />
                <p className="max-w-xs text-xs text-amber-700 dark:text-amber-400">
                  Custom usage-rights policies are a Premium control.
                </p>
                <Link to="/app/premium" className="rounded-lg border border-amber-500/60 px-4 py-2 text-xs font-semibold text-amber-700 hover:bg-amber-100">
                  Upgrade to Premium
                </Link>
              </div>
            ) : isLoading ? (
              <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="size-4 animate-spin" /> Loading…
              </div>
            ) : (
              <div className="mt-4 space-y-3">
                <Textarea
                  rows={4}
                  placeholder="e.g. Organic use included. Paid ads require a separate 30-day license at +40% of the deal fee. No exclusivity without prior agreement."
                  value={policy}
                  onChange={(e) => setPolicy(e.target.value)}
                  maxLength={500}
                />
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-muted-foreground">{policy.length}/500</span>
                  <Button size="sm" onClick={savePolicy} disabled={busy}>{busy ? "Saving…" : "Save policy"}</Button>
                </div>
              </div>
            )}
          </div>
        </>
      ) : (
        <div className="rounded-xl border border-border bg-card p-5 text-sm text-muted-foreground shadow-sm">
          More settings coming soon.
        </div>
      )}
    </div>
  )
}
