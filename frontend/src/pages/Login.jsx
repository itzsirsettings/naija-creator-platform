import { useState } from "react";
import { Moon, Sun } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import tehillaLogo from "../assets/tehilla-logo.png";

export default function Login() {
  const navigate = useNavigate();
  const { isDemoApp, login, resendVerificationEmail } = useAuth();
  const { isLight, toggleTheme } = useTheme();
  const [form, setForm] = useState({
    email: isDemoApp ? "adaeze@tehilla.demo" : "",
    password: isDemoApp ? "password" : "",
    role: "CREATOR",
  });
  const [error, setError] = useState("");
  const [verificationEmail, setVerificationEmail] = useState("");
  const [resendStatus, setResendStatus] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const ThemeIcon = isLight ? Moon : Sun;

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setResendStatus("");
    setVerificationEmail("");

    if (form.password.trim().length < 8) {
      setError("Use at least 8 characters for your password.");
      return;
    }

    setIsSubmitting(true);
    try {
      await login(form);
      navigate("/dashboard");
    } catch (error) {
      if (error.emailVerificationRequired) {
        const email = error.email || form.email;
        setVerificationEmail(email);
        setResendStatus(error.verificationSent ? `We sent a verification link to ${email}.` : "");
      }
      setError(error.message || "We could not start the session. Check the email and try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendVerification = async () => {
    const email = verificationEmail || form.email;
    if (!email) return;

    setIsResending(true);
    setResendStatus("");
    try {
      await resendVerificationEmail(email);
      setResendStatus(`We sent a fresh verification link to ${email}.`);
    } catch (error) {
      setResendStatus(error?.response?.data?.error || "We could not send a fresh link right now.");
    } finally {
      setIsResending(false);
    }
  };

  return (
    <main className="auth-page">
      <button className="auth-theme-toggle icon-button" type="button" onClick={toggleTheme} aria-label={isLight ? "Switch to dark mode" : "Switch to light mode"} aria-pressed={isLight}>
        <ThemeIcon />
      </button>
      <section className="auth-card">
        <div className="brand-lockup">
          <img src={tehillaLogo} alt="Tehilla" className="brand-mark-img" />
          <div className="brand-name">
            <strong>Tehilla</strong>
            <span>Creator monetization</span>
          </div>
        </div>
        <h1>Welcome back</h1>
        <p>Log in as a creator or brand account to manage offers, payments, and payouts.</p>

        <form className="auth-form" onSubmit={handleSubmit}>
          <label className="input-field">
            <span>Email</span>
            <input type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} required />
            {isDemoApp ? <small>Demo deployment accepts seeded credentials or offline fallback.</small> : null}
          </label>
          <label className="input-field">
            <span>Password</span>
            <input type="password" minLength="8" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} required />
          </label>
          <label className="input-field">
            <span>Account type</span>
            <select value={form.role} onChange={(event) => setForm({ ...form, role: event.target.value })}>
              <option value="CREATOR">Creator</option>
              <option value="BRAND">Brand</option>
            </select>
          </label>
          {error ? <div className="form-error" role="alert">{error}</div> : null}
          {verificationEmail ? (
            <div className="auth-note" role="status">
              {resendStatus || "Check your email for the verification link before logging in."}
              <button className="inline-link" type="button" onClick={handleResendVerification} disabled={isResending}>
                {isResending ? "Sending..." : "Send verification email again"}
              </button>
            </div>
          ) : null}
          <button className="primary-button" type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Opening dashboard..." : "Log in"}
          </button>
        </form>

        <div className="auth-footer">
          New to Tehilla? <Link to="/register">Create an account</Link>
          <br />
          <Link to="/forgot-password">Forgot password?</Link>
        </div>
      </section>
    </main>
  );
}
