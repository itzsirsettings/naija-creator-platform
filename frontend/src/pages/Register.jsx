import { useState } from "react";
import { Moon, Sun, ShieldCheck } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import createAccountIllustrationDark from "../assets/create-account-dark.png";
import createAccountIllustrationLight from "../assets/create-account-light.png";
import tehillaLogo from "../assets/tehilla-logo.png";

export default function Register() {
  const navigate = useNavigate();
  const { isDemoApp, register } = useAuth();
  const { isLight, toggleTheme } = useTheme();
  const [form, setForm] = useState({
    name: isDemoApp ? "Ayo Creator" : "",
    email: isDemoApp ? "ayo@tehilla.demo" : "",
    password: isDemoApp ? "password" : "",
    role: "CREATOR",
    niche: "Fashion",
    industry: "Fintech",
    nin: "",
    bvn: "",
    cacNumber: "",
    kycOptIn: false,
    termsAccepted: false,
  });
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const ThemeIcon = isLight ? Moon : Sun;
  const createAccountIllustration = isLight ? createAccountIllustrationLight : createAccountIllustrationDark;

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (form.name.trim().length < 2) {
      setError("Add a name so the workspace feels personal.");
      return;
    }

    if (form.password.trim().length < 8) {
      setError("Use at least 8 characters for your password.");
      return;
    }

    if (form.kycOptIn) {
      if (form.role === "CREATOR" && !form.nin && !form.bvn) {
        setError("Add an NIN or BVN so we can verify your identity.");
        return;
      }
      if (form.role === "BRAND" && !form.cacNumber) {
        setError("Add your CAC registration number so we can verify your company.");
        return;
      }
    }

    if (!form.termsAccepted) {
      setError("Accept the Terms and Privacy Policy before creating an account.");
      return;
    }

    const payload = {
      name: form.name,
      email: form.email,
      password: form.password,
      role: form.role,
      niche: form.role === "CREATOR" ? form.niche : undefined,
      industry: form.role === "BRAND" ? form.industry : undefined,
      nin: form.role === "CREATOR" && form.kycOptIn ? form.nin : undefined,
      bvn: form.role === "CREATOR" && form.kycOptIn ? form.bvn : undefined,
      cacNumber: form.role === "BRAND" && form.kycOptIn ? form.cacNumber : undefined,
      termsAccepted: form.termsAccepted,
    };

    setIsSubmitting(true);
    try {
      const result = await register(payload);
      if (result?.emailVerificationRequired) {
        navigate(`/verify-email?email=${encodeURIComponent(payload.email)}&sent=1`);
        return;
      }
      navigate("/dashboard");
    } catch (error) {
      setError(error.message || "We could not create the account. Check the form and try again.");
    } finally {
      setIsSubmitting(false);
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
            <span>10% transaction platform</span>
          </div>
        </div>
        <div className="auth-illustration" aria-hidden="true">
          <img src={createAccountIllustration} alt="" decoding="async" />
        </div>
        <h1>Create account</h1>
        <p>Set up a creator profile or brand workspace for Nigerian sponsorship deals.</p>

        <form className="auth-form" onSubmit={handleSubmit}>
          <label className="input-field">
            <span>Name</span>
            <input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} required />
          </label>
          <label className="input-field">
            <span>Email</span>
            <input type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} required />
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
          {form.role === "CREATOR" ? (
            <label className="input-field">
              <span>Niche</span>
              <input value={form.niche} onChange={(event) => setForm({ ...form, niche: event.target.value })} />
              <small>Example: Lifestyle, beauty, writing, tech, food, or travel.</small>
            </label>
          ) : (
            <label className="input-field">
              <span>Industry</span>
              <input value={form.industry} onChange={(event) => setForm({ ...form, industry: event.target.value })} />
              <small>Example: fintech, telecoms, beauty, food, or travel.</small>
            </label>
          )}

          <fieldset className="kyc-fieldset">
            <legend><ShieldCheck size={14} /> Verify your identity (optional)</legend>
            <p className="kyc-hint">
              We encrypt your ID numbers with AES-256 and never share them with brands or creators. You can skip this now and add it later from your settings.
            </p>
            <label className="checkbox-row">
              <input
                type="checkbox"
                checked={form.kycOptIn}
                onChange={(event) => setForm({ ...form, kycOptIn: event.target.checked })}
              />
              <span>Verify now to unlock instant payouts sooner.</span>
            </label>
            {form.kycOptIn && form.role === "CREATOR" && (
              <div className="kyc-grid">
                <label className="input-field">
                  <span>NIN (11 digits)</span>
                  <input
                    inputMode="numeric"
                    pattern="\d{11}"
                    maxLength={11}
                    value={form.nin}
                    onChange={(event) => setForm({ ...form, nin: event.target.value.replace(/\D/g, "") })}
                    placeholder="optional"
                  />
                </label>
                <label className="input-field">
                  <span>BVN (11 digits)</span>
                  <input
                    inputMode="numeric"
                    pattern="\d{11}"
                    maxLength={11}
                    value={form.bvn}
                    onChange={(event) => setForm({ ...form, bvn: event.target.value.replace(/\D/g, "") })}
                    placeholder="optional"
                  />
                </label>
              </div>
            )}
            {form.kycOptIn && form.role === "BRAND" && (
              <label className="input-field">
                <span>CAC number (e.g. RC1234567)</span>
                <input
                  value={form.cacNumber}
                  onChange={(event) => setForm({ ...form, cacNumber: event.target.value.toUpperCase() })}
                  placeholder="RC0000000"
                />
              </label>
            )}
          </fieldset>

          <label className="checkbox-row">
            <input
              type="checkbox"
              checked={form.termsAccepted}
              onChange={(event) => setForm({ ...form, termsAccepted: event.target.checked })}
              required
            />
            <span>
              I agree to the <Link to="/terms">Terms</Link> and <Link to="/privacy">Privacy Policy</Link>.
            </span>
          </label>
          {error ? <div className="form-error" role="alert">{error}</div> : null}
          <button className="primary-button" type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Creating workspace..." : "Create account"}
          </button>
        </form>

        <div className="auth-footer">
          Already have an account? <Link to="/login">Log in</Link>
        </div>
      </section>
    </main>
  );
}
