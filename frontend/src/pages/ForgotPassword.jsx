import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import tehillaLogo from "../assets/tehilla-logo.png";

export default function ForgotPassword() {
  const { forgotPassword } = useAuth();
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");
    setIsSubmitting(true);
    try {
      await forgotPassword(email);
      setMessage("If that email exists, a reset link has been sent.");
    } catch (err) {
      setError(err?.response?.data?.error || "Could not request a reset link.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="auth-page">
      <section className="auth-card">
        <div className="brand-lockup">
          <img src={tehillaLogo} alt="Tehilla" className="brand-mark-img" />
          <div className="brand-name">
            <strong>Tehilla</strong>
            <span>Account recovery</span>
          </div>
        </div>
        <h1>Reset password</h1>
        <p>Enter your account email and we will send a secure reset link.</p>
        <form className="auth-form" onSubmit={handleSubmit}>
          <label className="input-field">
            <span>Email</span>
            <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
          </label>
          {message ? <div className="status-banner" role="status">{message}</div> : null}
          {error ? <div className="form-error" role="alert">{error}</div> : null}
          <button className="primary-button" type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Sending link..." : "Send reset link"}
          </button>
        </form>
        <div className="auth-footer">
          <Link to="/login">Back to login</Link>
        </div>
      </section>
    </main>
  );
}
