import { useState } from "react"
import { Link } from "@/lib/router"
import { useAuth } from "@/context/AuthContext"

export default function ForgotPassword() {
  const { forgotPassword } = useAuth()
  const [email, setEmail] = useState("")
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setLoading(true)
    try {
      await forgotPassword(email)
      setSubmitted(true)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Could not send reset link")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-white">
      <div className="w-full max-w-sm rounded-2xl border border-[#d8d8d8] bg-white p-8 shadow-sm">
        <div className="text-center mb-8">
          <Link to="/" className="font-selecta text-[21.8px] font-medium tracking-tight text-[#0f0f0f] inline-block mb-6">
            Tehilla
          </Link>
          <h1 className="font-runde text-[21.8px] font-semibold text-[#0f0f0f]">Reset password</h1>
          <p className="mt-1 text-[12.7px] text-[#666]">Enter your email to receive a reset link</p>
        </div>

        {submitted ? (
          <div className="space-y-5 text-center">
            <div className="rounded-xl bg-[#5d9c06]/10 px-4 py-4">
              <p className="text-[12.7px] text-[#5d9c06] font-medium font-runde">
                If an account with that email exists, a reset link has been sent.
              </p>
            </div>
            <Link
              to="/login"
              className="inline-flex items-center justify-center w-full rounded-full border border-[#d8d8d8] py-4 text-[12.7px] font-medium text-[#0f0f0f] hover:border-[#0f0f0f] transition-all hover:scale-[1.01] active:scale-[0.99] font-runde"
            >
              Back to login
            </Link>
          </div>
        ) : (
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

            {error && <p className="text-[11.8px] text-[#ff6363] font-runde">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-full bg-[#0f0f0f] py-4 text-[12.7px] font-medium text-white hover:bg-[#1e1e1e] transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 font-runde"
            >
              {loading ? "Sending..." : "Send Reset Link"}
            </button>

            <div className="text-center">
              <Link to="/login" className="inline-block py-3 text-[11.8px] text-[#666] hover:text-[#5E5AA8] transition-colors font-runde">
                Back to login
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
