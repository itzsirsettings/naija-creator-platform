import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import tehillaLogo from "../assets/tehilla-logo.png";

export default function VerifyEmail() {
  const { resendVerificationEmail, verifyEmail } = useAuth();
  const [searchParams] = useSearchParams();
  const email = searchParams.get("email") || "";
  const sent = searchParams.get("sent") === "1";
  const [error, setError] = useState("");
  const [status, setStatus] = useState(() => {
    if (searchParams.get("token")) return "Verifying your email...";
    if (sent && email) return `Check ${email} for your verification link.`;
    return "";
  });
  const [isVerified, setIsVerified] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const token = searchParams.get("token") || "";

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      if (!token) {
        if (!sent || !email) {
          setError("Verification token is missing.");
          setStatus("");
        }
        return;
      }
      try {
        await verifyEmail(token);
        if (!cancelled) {
          setIsVerified(true);
          setStatus("Email verified. You can now log in to Tehilla.");
        }
      } catch (err) {
        if (!cancelled) {
          setStatus("");
          setError(err?.response?.data?.error || "Could not verify this email.");
        }
      }
    };
    run();
    return () => {
      cancelled = true;
    };
  }, [email, sent, token, verifyEmail]);

  const handleResend = async () => {
    if (!email) return;

    setIsResending(true);
    setError("");
    try {
      await resendVerificationEmail(email);
      setStatus(`We sent a fresh verification link to ${email}.`);
    } catch (err) {
      setError(err?.response?.data?.error || "We could not send a fresh verification link right now.");
    } finally {
      setIsResending(false);
    }
  };

  return (
    <main className="auth-page">
      <section className="auth-card">
        <div className="brand-lockup">
          <img src={tehillaLogo} alt="Tehilla" className="brand-mark-img" />
          <div className="brand-name">
            <strong>Tehilla</strong>
            <span>Email verification</span>
          </div>
        </div>
        <h1>Verify email</h1>
        {status ? <p role="status">{status}</p> : null}
        {error ? <div className="form-error" role="alert">{error}</div> : null}
        {email && !isVerified ? (
          <button className="secondary-button" type="button" onClick={handleResend} disabled={isResending}>
            {isResending ? "Sending..." : "Send verification email again"}
          </button>
        ) : null}
        <div className="auth-footer">
          <Link to="/login">Go to login</Link>
        </div>
      </section>
    </main>
  );
}
