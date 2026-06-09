import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import tehillaLogo from "../assets/tehilla-logo.png";

export default function ResetPassword() {
  const { resetPassword } = useAuth();
  const [searchParams] = useSearchParams();
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const token = searchParams.get("token") || "";

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");
    if (!token) {
      setError("Reset token is missing.");
      return;
    }
    if (password.trim().length < 8) {
      setError("Use at least 8 characters for your new password.");
      return;
    }
    setIsSubmitting(true);
    try {
      await resetPassword({ token, password });
      setMessage("Password updated. You can log in with the new password.");
    } catch (err) {
      setError(err?.response?.data?.error || "Could not reset password.");
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
            <span>Secure reset</span>
          </div>
        </div>
        <h1>Choose new password</h1>
        <form className="auth-form" onSubmit={handleSubmit}>
          <label className="input-field">
            <span>New password</span>
            <input type="password" minLength="8" value={password} onChange={(event) => setPassword(event.target.value)} required />
          </label>
          {message ? <div className="status-banner" role="status">{message}</div> : null}
          {error ? <div className="form-error" role="alert">{error}</div> : null}
          <button className="primary-button" type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Updating..." : "Update password"}
          </button>
        </form>
        <div className="auth-footer">
          <Link to="/login">Back to login</Link>
        </div>
      </section>
    </main>
  );
}
