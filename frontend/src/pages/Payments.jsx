import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Banknote, CreditCard, ShieldCheck, Wallet } from "lucide-react";
import Badge from "../components/Badge";
import StatCard from "../components/StatCard";
import TransactionList from "../components/TransactionList";
import { useAppData } from "../context/AppDataContext";
import { useAuth } from "../context/AuthContext";
import { formatNaira } from "../utils/format";

export default function Payments() {
  const { activeRole } = useAuth();
  const { balance, banks, creator, loadBanks, setupBankAccount, transactions, totals, verifyPayment } = useAppData();
  const [searchParams, setSearchParams] = useSearchParams();
  const [bankForm, setBankForm] = useState({ accountNumber: "", bankCode: "", bankName: "" });
  const [isSavingBank, setIsSavingBank] = useState(false);
  const [isVerifyingPayment, setIsVerifyingPayment] = useState(false);

  useEffect(() => {
    if (activeRole === "creator") loadBanks();
  }, [activeRole, loadBanks]);

  useEffect(() => {
    const reference = searchParams.get("reference");
    if (activeRole !== "brand" || !reference) return;

    setIsVerifyingPayment(true);
    verifyPayment(reference).finally(() => {
      setIsVerifyingPayment(false);
      setSearchParams({}, { replace: true });
    });
  }, [activeRole, searchParams, setSearchParams, verifyPayment]);

  const selectedBank = banks.find((bank) => bank.code === bankForm.bankCode);
  const paymentBadge = activeRole === "brand"
    ? { tone: isVerifyingPayment ? "ACCEPTED" : "FUNDED", label: isVerifyingPayment ? "Verifying Paystack" : "Paystack Ready" }
    : { tone: creator.bankVerifiedAt ? "ACCEPTED" : "PENDING", label: creator.bankVerifiedAt ? "Bank Verified" : "Bank Needed" };

  const handleBankSubmit = async (event) => {
    event.preventDefault();
    setIsSavingBank(true);
    try {
      await setupBankAccount({
        ...bankForm,
        bankName: selectedBank?.name || bankForm.bankName,
      });
      setBankForm({ accountNumber: "", bankCode: "", bankName: "" });
    } finally {
      setIsSavingBank(false);
    }
  };

  return (
    <div className="page">
      <div className="page-header">
        <div className="page-title">
          <h1>Payments</h1>
          <p>Paystack collects accepted offer payments and releases creator payouts only after submission, brand approval, and transfer confirmation.</p>
        </div>
      </div>

      <section className="stat-grid" aria-label="Payment metrics">
        <StatCard label="Available Balance" value={formatNaira(balance)} sub={creator.bank || "No verified bank"} icon={Wallet} color="var(--accent)" />
        <StatCard label="Platform Fee 10%" value={formatNaira(totals.platformFees)} sub="From completed payouts" icon={ShieldCheck} color="var(--gold)" />
        <StatCard label="Paystack GMV" value={formatNaira(totals.gross)} sub="Brand-side collections" icon={CreditCard} color="var(--purple)" />
        <StatCard label="Creator Net" value={formatNaira(totals.totalEarned)} sub="Confirmed Paystack credits" icon={Banknote} color="var(--coral)" />
      </section>

      <section className="payment-layout">
        <div className="panel">
          <div className="panel-header">
            <div>
              <h2>Transaction History</h2>
              <p>Each transaction records gross amount, platform fee, creator net, and provider payout status.</p>
            </div>
            <Badge tone={paymentBadge.tone}>{paymentBadge.label}</Badge>
          </div>
          <TransactionList transactions={transactions} />
        </div>

        <aside className="panel">
          {activeRole === "creator" ? (
            <>
              <div className="panel-header">
                <div>
                  <h2>Paystack Bank Setup</h2>
                  <p>Verify the account that receives approved creator payouts.</p>
                </div>
              </div>
              <form className="auth-form" onSubmit={handleBankSubmit}>
                <label className="input-field">
                  <span>Bank</span>
                  <select
                    value={bankForm.bankCode}
                    onChange={(event) => setBankForm({ ...bankForm, bankCode: event.target.value })}
                    required
                  >
                    <option value="">Select bank</option>
                    {banks.map((bank) => (
                      <option key={bank.code} value={bank.code}>{bank.name}</option>
                    ))}
                  </select>
                </label>
                <label className="input-field">
                  <span>Account number</span>
                  <input
                    inputMode="numeric"
                    maxLength="10"
                    minLength="10"
                    value={bankForm.accountNumber}
                    onChange={(event) => setBankForm({ ...bankForm, accountNumber: event.target.value.replace(/\D/g, "") })}
                    required
                  />
                  <small>Tehilla stores only account name, bank, last four digits, and Paystack recipient code.</small>
                </label>
                <button className="secondary-button" type="submit" disabled={isSavingBank}>
                  <Banknote /> {isSavingBank ? "Verifying..." : "Verify bank account"}
                </button>
              </form>
            </>
          ) : (
            <>
              <div className="panel-header">
                <div>
                  <h2>Brand Payment Flow</h2>
                  <p>Use Offers to pay accepted briefs, then approve submitted work to queue Paystack payout.</p>
                </div>
              </div>
              <div className="metric-list">
                <div className="metric-row">
                  <span>1. Creator accepts</span>
                  <strong>Offer ready</strong>
                </div>
                <div className="metric-row">
                  <span>2. Brand pays</span>
                  <strong>Paystack Checkout</strong>
                </div>
                <div className="metric-row">
                  <span>3. Brand approves</span>
                  <strong>Paystack queued</strong>
                </div>
              </div>
            </>
          )}
        </aside>
      </section>
    </div>
  );
}
