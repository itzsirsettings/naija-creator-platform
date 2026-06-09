import { Link } from "react-router-dom";
import tehillaLogo from "../assets/tehilla-logo.png";

const content = {
  terms: {
    title: "Terms",
    body: [
      "Tehilla connects brands and creators for sponsorship work. Users are responsible for accurate profile, campaign, bank, and tax information.",
      "Brand payments fund accepted offers. Creator payouts are queued only after work is submitted and approved, and final balance credit depends on Paystack transfer confirmation.",
      "Disputed offers may pause payout while Tehilla support reviews campaign evidence, payment records, and account history.",
    ],
  },
  privacy: {
    title: "Privacy Policy",
    body: [
      "Tehilla stores account, profile, offer, transaction, support, and verified bank display metadata needed to operate the marketplace.",
      "Sensitive provider credentials and refresh sessions are handled server-side. Creator account numbers are verified with Paystack and not displayed in full.",
      "Operational logs, metrics, and error reports may include request metadata used for security, reliability, and incident response.",
    ],
  },
};

export default function Legal({ type = "terms" }) {
  const page = content[type] || content.terms;
  return (
    <main className="auth-page legal-page">
      <section className="auth-card">
        <div className="brand-lockup">
          <img src={tehillaLogo} alt="Tehilla" className="brand-mark-img" />
          <div className="brand-name">
            <strong>Tehilla</strong>
            <span>Legal</span>
          </div>
        </div>
        <h1>{page.title}</h1>
        <div className="legal-copy">
          {page.body.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
        <div className="auth-footer">
          <Link to="/register">Back to registration</Link>
        </div>
      </section>
    </main>
  );
}
