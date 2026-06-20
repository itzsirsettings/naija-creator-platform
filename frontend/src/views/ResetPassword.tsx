import { useState } from "react"
import { Link, useSearchParams } from "@/lib/router"
import { useAuth } from "@/context/AuthContext"
import { Eye, EyeOff } from "lucide-react"

export default function ResetPassword() {
  const { resetPassword } = useAuth()
  const [searchParams] = useSearchParams()
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const token = searchParams.get("token") || ""

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    if (password !== confirmPassword) { setError("Passwords do not match"); return }
    if (password.length < 8) { setError("Password must be at least 8 characters"); return }
    setLoading(true)
    try {
      await resetPassword({ token, password })
      setSuccess(true)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Could not reset password")
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
          <h1 className="font-runde text-[21.8px] font-semibold text-[#0f0f0f]">Set new password</h1>
          <p className="mt-1 text-[12.7px] text-[#666]">Choose a strong password for your account</p>
        </div>

        {success ? (
          <div className="space-y-5 text-center">
            <div className="rounded-xl bg-[#5d9c06]/10 px-4 py-4">
              <p className="text-[12.7px] text-[#5d9c06] font-medium font-runde">
                Password updated. You can now log in with your new password.
              </p>
            </div>
            <Link
              to="/login"
              className="inline-flex items-center justify-center w-full rounded-full bg-[#0f0f0f] py-4 text-[12.7px] font-medium text-white hover:bg-[#1e1e1e] transition-all hover:scale-[1.01] active:scale-[0.99] font-runde"
            >
              Go to login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <label htmlFor="password" className="font-runde text-[11.8px] font-medium text-[#0f0f0f]">New Password</label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full rounded-xl border border-[#d8d8d8] bg-white px-4 py-4 text-[12.7px] text-[#0f0f0f] placeholder-[#8d8d8d] outline-none focus:border-[#0f0f0f] transition-colors font-runde pr-10"
                  placeholder="Enter new password"
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

            <div className="space-y-1.5">
              <label htmlFor="confirm-password" className="font-runde text-[11.8px] font-medium text-[#0f0f0f]">Confirm Password</label>
              <div className="relative">
                <input
                  id="confirm-password"
                  type={showConfirm ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="w-full rounded-xl border border-[#d8d8d8] bg-white px-4 py-4 text-[12.7px] text-[#0f0f0f] placeholder-[#8d8d8d] outline-none focus:border-[#0f0f0f] transition-colors font-runde pr-10"
                  placeholder="Confirm new password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center justify-center w-11 h-11 text-[#8d8d8d] hover:text-[#0f0f0f] active:text-[#0f0f0f] transition-colors rounded-lg"
                  aria-label={showConfirm ? "Hide password" : "Show password"}
                >
                  {showConfirm ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </div>

            {error && <p className="text-[11.8px] text-[#ff6363] font-runde">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-full bg-[#0f0f0f] py-4 text-[12.7px] font-medium text-white hover:bg-[#1e1e1e] transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 font-runde"
            >
              {loading ? "Updating..." : "Update Password"}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
