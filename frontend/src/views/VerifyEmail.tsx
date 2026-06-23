import { useEffect, useState } from "react"
import { Link, useSearchParams } from "@/lib/router"
import { useAuth } from "@/context/AuthContext"

export default function VerifyEmail() {
  const { verifyEmail, resendVerificationEmail } = useAuth()
  const [searchParams] = useSearchParams()
  const token = searchParams.get("token") || ""
  const email = searchParams.get("email") || ""
  const [verified, setVerified] = useState(false)
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")
  const [resending, setResending] = useState(false)

  useEffect(() => {
    if (!token) {
      if (email) setMessage(`We sent a verification email to ${email}`)
      return
    }
    verifyEmail(token)
      .then(() => { setVerified(true); setMessage("Email verified successfully") })
      .catch((err: unknown) => { setError(err instanceof Error ? err.message : "Verification failed") })
  }, [token, email, verifyEmail])

  async function handleResend() {
    if (!email) return
    setResending(true)
    setError("")
    try {
      await resendVerificationEmail(email)
      setMessage(`We resent the verification email to ${email}`)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Could not resend")
    } finally {
      setResending(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-white">
      <div className="w-full max-w-sm rounded-2xl border border-[#d8d8d8] bg-white p-8 shadow-sm">
        <div className="text-center mb-8">
          <Link to="/" className="font-selecta text-[21.8px] font-medium tracking-tight text-[#0f0f0f] inline-block mb-6">
            Tehilla
          </Link>
          <h1 className="font-runde text-[21.8px] font-semibold text-[#0f0f0f]">Verify email</h1>
          <p className="mt-1 text-[12.7px] text-[#666]">
            {verified ? "Your email has been verified" : "Check your inbox"}
          </p>
        </div>

        <div className="space-y-4">
          {message && (
            <div className={`rounded-xl px-4 py-4 ${verified ? "bg-[#5d9c06]/10" : "bg-[#5E5AA8]/10"}`}>
              <p className={`text-[12.7px] font-medium font-runde text-center ${verified ? "text-[#5d9c06]" : "text-[#5E5AA8]"}`}>
                {message}
              </p>
            </div>
          )}
          {error && <p className="text-[11.8px] text-[#ff6363] font-runde text-center">{error}</p>}

          <div className="flex flex-col gap-3">
            {!verified && email && (
              <button
                onClick={handleResend}
                disabled={resending}
                className="w-full rounded-full border border-[#d8d8d8] py-4 text-[12.7px] font-medium text-[#0f0f0f] hover:border-[#0f0f0f] transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 font-runde"
              >
                {resending ? "Sending..." : "Resend verification email"}
              </button>
            )}
            <Link
              to="/login"
              className="inline-flex items-center justify-center w-full rounded-full border border-[#d8d8d8] py-4 text-[12.7px] font-medium text-[#0f0f0f] hover:border-[#0f0f0f] transition-all hover:scale-[1.01] active:scale-[0.99] font-runde"
            >
              Go to login
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
