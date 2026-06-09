import { ArrowDownLeft, ArrowUpRight } from "lucide-react";
import { formatNaira } from "../utils/format";

export default function TransactionList({ transactions, limit }) {
  const visibleTransactions = limit ? transactions.slice(0, limit) : transactions;

  return (
    <div className="transaction-list">
      {visibleTransactions.map((transaction) => {
        const Icon = transaction.type === "credit" ? ArrowDownLeft : ArrowUpRight;
        return (
          <div className="transaction-row" key={transaction.id}>
            <div className="transaction-copy">
              {transaction.logo ? (
                <img className="tx-icon tx-logo" src={transaction.logo} alt="" />
              ) : (
                <div className={`tx-icon ${transaction.type === "debit" ? "debit" : ""}`} aria-hidden="true">
                  <Icon size={17} />
                </div>
              )}
              <div>
                <strong>{transaction.label}</strong>
                <span>
                  {transaction.counterparty} · {new Date(transaction.date).toLocaleDateString("en-NG", { month: "short", day: "numeric" })} · {transaction.status}
                </span>
              </div>
            </div>
            <div className={`transaction-amount ${transaction.type}`}>{transaction.type === "credit" ? "+" : "-"}{formatNaira(transaction.amount)}</div>
          </div>
        );
      })}
    </div>
  );
}
