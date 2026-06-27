"use client"

import { useState } from "react"
import { useNavigate, Link, useSearchParams } from "@/lib/router"
import { useAuth } from "@/context/AuthContext"
import { Eye, EyeOff } from "lucide-react"

export default function Login() {
  const navigate = useNavigate()
  const { login, resendVerificationEmail } = useAuth()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [remember, setRemember] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [needsVerification, setNeedsVerification] = useState(false)
  const [resendLoading, setResendLoading] = useState(false)
  const [resendSent, setResendSent] = useState(false)
  const [showLoginForm, setShowLoginForm] = useState(false)

  const [params] = useSearchParams()
  const redirectTo = params.get("redirect") || "/home"

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setNeedsVerification(false)
    setResendSent(false)
    setLoading(true)
    try {
      const me = await login(email, password)
      const dest = me.role === "admin" ? "/admin" : redirectTo
      navigate(dest, { replace: true })
    } catch (err: unknown) {
      if (err && typeof err === "object" && "code" in err && (err as { code: string }).code === "EMAIL_NOT_VERIFIED") {
        setNeedsVerification(true)
        setError("Please verify your email before logging in.")
      } else {
        const message = err && typeof err === "object" && "response" in err
          ? (err as { response: { data: { error: string } } }).response?.data?.error || "Login failed"
          : err instanceof Error ? err.message : "Login failed"
        setError(message)
      }
    } finally {
      setLoading(false)
    }
  }

  async function handleResendVerification() {
    setResendLoading(true)
    try {
      await resendVerificationEmail(email)
      setResendSent(true)
    } catch {
      setError("Failed to resend verification email. Please try again.")
    } finally {
      setResendLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-white">
      <div className="w-full max-w-sm space-y-4">

        {/* Onboarding notice — shown first */}
        {!showLoginForm && (
          <div className="rounded-2xl border border-[#d8d8d8] bg-white p-8 shadow-sm">
            <div className="text-center mb-6">
              <Link to="/" className="inline-block mb-5">
                <img src="/Tehilla_logo_new.svg" alt="Tehilla" className="size-9 rounded-[6px] object-cover mx-auto" />
              </Link>
              <p className="font-runde mb-1 text-[10.5px] font-semibold uppercase tracking-[0.16em] text-[#5E5AA8]">
                We&rsquo;re growing fast
              </p>
              <h1 className="font-runde text-[21.8px] font-semibold text-[#0f0f0f] mt-1">Join Tehilla</h1>
              <p className="mt-2 font-runde text-[12.7px] leading-relaxed text-[#666]">
                Due to an extraordinary level of interest in the Tehilla platform, we are currently
                onboarding all new creators and brands through a guided, manual review process.
                Complete the form and we&rsquo;ll be in touch within{" "}
                <span className="font-semibold text-[#0f0f0f]">48 hours</span>.
              </p>
            </div>

            <Link
              to="/register"
              className="block w-full rounded-full bg-[#0f0f0f] py-4 text-center font-runde text-[12.7px] font-medium text-white transition-all hover:bg-[#1e1e1e] hover:scale-[1.01] active:scale-[0.99]"
            >
              Apply to join Tehilla
            </Link>

            <div className="mt-5 pt-5 border-t border-[#d8d8d8]/60 text-center">
              <p className="font-runde text-[11.8px] text-[#666]">
                Already have an account?{" "}
                <button
                  onClick={() => setShowLoginForm(true)}
                  className="font-medium text-[#5E5AA8] hover:text-[#5E5AA8]/80 transition-colors"
                >
                  Sign in
                </button>
              </p>
            </div>
          </div>
        )}

        {/* Login form — revealed only for existing users */}
        {showLoginForm && (
          <div className="w-full rounded-2xl border border-[#d8d8d8] bg-white p-8 shadow-sm">
            <div className="text-center mb-8">
              <Link to="/" className="inline-block mb-6">
                <img src="/Tehilla_logo_new.svg" alt="Tehilla" className="size-9 rounded-[6px] object-cover mx-auto" />
              </Link>
              <h1 className="font-runde text-[21.8px] font-semibold text-[#0f0f0f]">Welcome back</h1>
              <p className="mt-1 font-runde text-[12.7px] text-[#666]">Log in to your account</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-1.5">
                <label htmlFor="email" className="font-runde text-[11.8px] font-medium text-[#0f0f0f]">Email</label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full rounded-xl border border-[#d8d8d8] bg-white px-4 py-4 text-[12.7px] text-[#0f0f0f] placeholder-[#8d8d8d] outline-none focus:border-[#0f0f0f] transition-colors font-runde"
                  placeholder="you@example.com"
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="password" className="font-runde text-[11.8px] font-medium text-[#0f0f0f]">Password</label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full rounded-xl border border-[#d8d8d8] bg-white px-4 py-4 text-[12.7px] text-[#0f0f0f] placeholder-[#8d8d8d] outline-none focus:border-[#0f0f0f] transition-colors font-runde pr-10"
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center justify-center w-11 h-11 text-[#8d8d8d] hover:text-[#0f0f0f] active:text-[#0f0f0f] transition-colors rounded-lg"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  id="remember"
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="size-4 rounded border-[#d8d8d8] text-[#0f0f0f] focus:ring-0"
                />
                <label htmlFor="remember" className="font-runde text-[11.8px] text-[#666]">Remember me</label>
              </div>

              {error && <p className="font-runde text-[11.8px] text-[#ff6363]">{error}</p>}

              {needsVerification && (
                <div className="rounded-xl border border-[#e8e8e8] bg-[#fafafa] p-4 space-y-3">
                  <p className="font-runde text-[11.8px] text-[#666]">
                    Check your inbox at <strong className="text-[#0f0f0f]">{email}</strong> for a verification link.
                  </p>
                  {resendSent ? (
                    <p className="font-runde text-[11.8px] text-green-600">Verification email sent!</p>
                  ) : (
                    <button
                      type="button"
                      onClick={handleResendVerification}
                      disabled={resendLoading}
                      className="w-full rounded-full border border-[#d8d8d8] py-3 font-runde text-[11.8px] font-medium text-[#0f0f0f] hover:bg-[#f0f0f0] transition-all disabled:opacity-50"
                    >
                      {resendLoading ? "Sending..." : "Resend verification email"}
                    </button>
                  )}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-full bg-[#0f0f0f] py-4 font-runde text-[12.7px] font-medium text-white hover:bg-[#1e1e1e] transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
              >
                {loading ? "Logging in..." : "Log in"}
              </button>

              <div className="text-center">
                <Link to="/forgot-password" className="inline-block py-3 font-runde text-[11.8px] text-[#666] hover:text-[#5E5AA8] transition-colors">
                  Forgot password?
                </Link>
              </div>
            </form>

            <div className="mt-6 pt-6 border-t border-[#d8d8d8]/60 text-center">
              <p className="font-runde text-[11.8px] text-[#666]">
                New to Tehilla?{" "}
                <Link to="/register" className="font-medium text-[#5E5AA8] hover:text-[#5E5AA8]/80 transition-colors">
                  Apply to join
                </Link>
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
