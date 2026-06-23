import { useState } from "react"
import { useNavigate, Link } from "@/lib/router"
import { useAuth } from "@/context/AuthContext"
import { Eye, EyeOff } from "lucide-react"

export default function Register() {
  const navigate = useNavigate()
  const { register } = useAuth()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [role, setRole] = useState<"creator" | "brand">("creator")
  const [terms, setTerms] = useState(false)
  const [registered, setRegistered] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    if (name.trim().length < 2) { setError("Name must be at least 2 characters"); return }
    if (name.trim().length > 100) { setError("Name must be under 100 characters"); return }
    if (password.length < 8) { setError("Password must be at least 8 characters"); return }
    if (!/[A-Z]/.test(password)) { setError("Password must contain at least one uppercase letter"); return }
    if (!/[a-z]/.test(password)) { setError("Password must contain at least one lowercase letter"); return }
    if (!/[0-9]/.test(password)) { setError("Password must contain at least one number"); return }
    if (password !== confirmPassword) { setError("Passwords do not match"); return }
    if (!terms) { setError("You must accept the terms and privacy policy"); return }
    setLoading(true)
    try {
      const result = await register({ name: name.trim(), email: email.trim(), password, role })
      if (result?.emailVerificationRequired) {
        setRegistered(true)
      } else {
        navigate("/home")
      }
    } catch (err: unknown) {
      const message = err && typeof err === "object" && "response" in err
        ? (err as { response: { data: { error: string } } }).response?.data?.error || "Registration failed"
        : err instanceof Error ? err.message : "Registration failed"
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-white">
      <div className="w-full max-w-sm rounded-2xl border border-[#d8d8d8] bg-white p-8 shadow-sm">
        <div className="text-center mb-8">
          <Link to="/" className="inline-block mb-6">
            <img src="/Tehilla_logo_new.svg" alt="Tehilla" className="size-9 rounded-[6px] object-cover mx-auto" />
          </Link>
          <h1 className="font-runde text-[21.8px] font-semibold text-[#0f0f0f]">Create account</h1>
          <p className="mt-1 text-[12.7px] text-[#666]">Join as a creator or brand</p>
        </div>

        {registered ? (
          <div className="text-center py-8 space-y-4">
            <div className="mx-auto size-14 rounded-full bg-green-100 flex items-center justify-center">
              <svg className="size-7 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
            </div>
            <h2 className="font-runde text-[18px] font-semibold text-[#0f0f0f]">Account created!</h2>
            <p className="text-[12.7px] text-[#666] font-runde leading-relaxed">
              We sent a verification link to <strong className="text-[#0f0f0f]">{email}</strong>.<br />
              Check your inbox and verify your email before logging in.
            </p>
            <Link to="/login" className="inline-block mt-2 w-full rounded-full bg-[#0f0f0f] py-4 text-[12.7px] font-medium text-white hover:bg-[#1e1e1e] transition-all font-runde">
              Go to login
            </Link>
          </div>
        ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1.5">
            <label htmlFor="name" className="font-runde text-[11.8px] font-medium text-[#0f0f0f]">Name</label>
            <input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              minLength={2}
              maxLength={100}
              className="w-full rounded-xl border border-[#d8d8d8] bg-white px-4 py-4 text-[12.7px] text-[#0f0f0f] placeholder-[#8d8d8d] outline-none focus:border-[#0f0f0f] transition-colors font-runde"
              placeholder="Your full name"
            />
          </div>

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
                minLength={8}
                autoComplete="new-password"
                className="w-full rounded-xl border border-[#d8d8d8] bg-white px-4 py-4 text-[12.7px] text-[#0f0f0f] placeholder-[#8d8d8d] outline-none focus:border-[#0f0f0f] transition-colors font-runde pr-10"
                placeholder="Create a strong password"
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
                placeholder="Confirm your password"
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

          {/* Role Toggle */}
          <div className="space-y-1.5">
            <label className="font-runde text-[11.8px] font-medium text-[#0f0f0f]">Account type</label>
            <div className="grid grid-cols-2 gap-2 rounded-xl bg-[#fafafa] p-1 border border-[#d8d8d8]/60">
              <button
                type="button"
                onClick={() => setRole("creator")}
                className={`rounded-lg py-3 text-[11.8px] font-medium transition-all font-runde ${role === "creator" ? "bg-white text-[#0f0f0f] shadow-xs border border-[#d8d8d8]" : "text-[#666] hover:text-[#0f0f0f]"}`}
              >
                Creator
              </button>
              <button
                type="button"
                onClick={() => setRole("brand")}
                className={`rounded-lg py-3 text-[11.8px] font-medium transition-all font-runde ${role === "brand" ? "bg-white text-[#0f0f0f] shadow-xs border border-[#d8d8d8]" : "text-[#666] hover:text-[#0f0f0f]"}`}
              >
                Brand
              </button>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <input
              id="terms"
              type="checkbox"
              checked={terms}
              onChange={(e) => setTerms(e.target.checked)}
              className="mt-0.5 size-4 rounded border-[#d8d8d8] text-[#0f0f0f] focus:ring-0"
            />
            <label htmlFor="terms" className="text-[11.8px] text-[#666] font-runde cursor-pointer py-1">I accept the terms and privacy policy</label>
          </div>

          {error && <p className="text-[11.8px] text-[#ff6363] font-runde">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-[#0f0f0f] py-4 text-[12.7px] font-medium text-white hover:bg-[#1e1e1e] transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 font-runde"
          >
            {loading ? "Creating account..." : "Create account"}
          </button>
        </form>
        )}

        <div className="mt-6 pt-6 border-t border-[#d8d8d8]/60 text-center">
          <p className="text-[11.8px] text-[#666] font-runde">
            Already have an account?{" "}
            <Link to="/login" className="text-[#5E5AA8] hover:text-[#5E5AA8]/80 transition-colors font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
