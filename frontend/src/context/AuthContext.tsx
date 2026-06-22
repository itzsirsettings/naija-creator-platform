"use client"

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react"
import { useNavigate } from "@/lib/router"
import api, { setAccessToken } from "@/services/api"

interface User {
  id: string
  name: string
  email: string
  role: "brand" | "creator" | "admin"
  creatorId?: string
  brandId?: string
  brandName?: string
  avatar?: string
  kycStatus: string
  walletBalance: number
  walletHeld: number
  premiumTier: "NONE" | "STANDARD" | "POPULAR" | "PREMIUM"
  premiumActive: boolean
  bankLast4?: string | null
  bankName?: string | null
}

interface AuthContextValue {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  setUser: (user: User | null) => void
  refreshUser: () => Promise<void>
  login: (email: string, password: string) => Promise<void>
  register: (data: { name: string; email: string; password: string; role: "brand" | "creator" }) => Promise<{ emailVerificationRequired?: boolean }>
  logout: () => void
  forgotPassword: (email: string) => Promise<void>
  resetPassword: (data: { token: string; password: string }) => Promise<void>
  verifyEmail: (token: string) => Promise<void>
  resendVerificationEmail: (email: string) => Promise<void>
}

// Raw user shapes returned by the Fastify API (publicUser is lean; /me adds subprofiles).
interface RawUser {
  id: string
  email: string
  role: string
  name?: string
  kycStatus?: string
  creator?: {
    id?: string; name?: string; avatar?: string; balanceKobo?: number; heldKobo?: number
    premiumTier?: string; premiumUntil?: string | null
    bankAccountLast4?: string | null; bankBankName?: string | null
  } | null
  brand?: {
    id?: string; name?: string; logo?: string
    premiumTier?: string; premiumUntil?: string | null
  } | null
}

// The API wraps every response as { success, data, error }. Unwrap to the payload.
function unwrap<T = unknown>(response: { data: unknown }): T {
  const body = response.data
  if (body && typeof body === "object" && "data" in body) {
    return (body as { data: T }).data
  }
  return body as T
}

// Map the backend user (uppercase role, kobo balance, nested profiles) to the UI shape.
function normalizeUser(raw: RawUser): User {
  const role = String(raw.role || "").toLowerCase()
  const safeRole: User["role"] =
    role === "creator" || role === "brand" || role === "admin" ? role : "creator"
  const name =
    raw.creator?.name || raw.brand?.name || raw.name || raw.email?.split("@")[0] || "User"
  const walletBalance =
    typeof raw.creator?.balanceKobo === "number" ? raw.creator.balanceKobo / 100 : 0
  const walletHeld =
    typeof raw.creator?.heldKobo === "number" ? raw.creator.heldKobo / 100 : 0
  // Premium lives on the creator profile for creators and the brand profile for brands.
  const premiumSource = safeRole === "brand" ? raw.brand : raw.creator
  const premiumTier = (premiumSource?.premiumTier as User["premiumTier"]) || "NONE"
  const premiumActive =
    premiumTier !== "NONE" &&
    !!premiumSource?.premiumUntil &&
    new Date(premiumSource.premiumUntil).getTime() > Date.now()
  return {
    id: raw.id,
    name,
    email: raw.email,
    role: safeRole,
    creatorId: raw.creator?.id,
    brandId: raw.brand?.id,
    brandName: raw.brand?.name,
    avatar: raw.creator?.avatar || raw.brand?.logo || undefined,
    kycStatus: raw.kycStatus || "NONE",
    walletBalance,
    walletHeld,
    premiumTier,
    premiumActive,
    bankLast4: raw.creator?.bankAccountLast4 ?? null,
    bankName: raw.creator?.bankBankName ?? null,
  }
}

// Fetch the full profile after auth so the UI has name, balance, and role.
async function fetchMe(): Promise<User> {
  const response = await api.get("/auth/me")
  const { user } = unwrap<{ user: RawUser }>(response)
  return normalizeUser(user)
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    const token = localStorage.getItem("tehilla_access_token")
    if (!token) {
      setIsLoading(false)
      return
    }

    // Restore the session: re-attach the token and re-fetch the profile.
    setAccessToken(token)
    fetchMe()
      .then((restored) => setUser(restored))
      .catch(() => {
        setAccessToken(null)
        localStorage.removeItem("tehilla_access_token")
      })
      .finally(() => setIsLoading(false))
  }, [])

  useEffect(() => {
    function handleExpired() {
      setUser(null)
      setAccessToken(null)
      localStorage.removeItem("tehilla_access_token")
      navigate("/login")
    }
    window.addEventListener("tehilla:auth-expired", handleExpired)
    return () => window.removeEventListener("tehilla:auth-expired", handleExpired)
  }, [navigate])

  const login = useCallback(async (email: string, password: string) => {
    const response = await api.post("/auth/login", { email, password })
    const { accessToken, emailVerified } = unwrap<{
      accessToken: string
      user: RawUser
      emailVerified?: boolean
    }>(response)
    if (emailVerified === false) {
      throw Object.assign(new Error("Please verify your email before logging in."), {
        code: "EMAIL_NOT_VERIFIED",
        email,
      })
    }
    localStorage.setItem("tehilla_access_token", accessToken)
    setAccessToken(accessToken)
    setUser(await fetchMe())
  }, [])

  const register = useCallback(async (data: { name: string; email: string; password: string; role: "brand" | "creator" }) => {
    const response = await api.post("/auth/register", {
      name: data.name,
      email: data.email,
      password: data.password,
      role: data.role.toUpperCase(),
      termsAccepted: true,
    })
    const { accessToken, emailVerificationRequired } = unwrap<{
      accessToken: string
      user: RawUser
      emailVerificationRequired?: boolean
    }>(response)
    localStorage.setItem("tehilla_access_token", accessToken)
    setAccessToken(accessToken)
    setUser(await fetchMe())
    return { emailVerificationRequired: emailVerificationRequired ?? false }
  }, [])

  const logout = useCallback(async () => {
    try { await api.post("/auth/logout") } catch (err) { console.error("[auth] logout failed", err) }
    setUser(null)
    setAccessToken(null)
    localStorage.removeItem("tehilla_access_token")
  }, [])

  const refreshUser = useCallback(async () => {
    try {
      setUser(await fetchMe())
    } catch {
      // keep stale user if refresh fails
    }
  }, [])

  // Request a password-reset email.
  const forgotPassword = useCallback(async (email: string) => {
    const response = await api.post("/auth/forgot-password", { email })
    unwrap(response)
  }, [])

  // Complete a password reset using the token from the emailed link.
  const resetPassword = useCallback(async ({ token, password }: { token: string; password: string }) => {
    const response = await api.post("/auth/reset-password", { token, password })
    unwrap(response)
  }, [])

  // Confirm an email address via the token from the verification link.
  const verifyEmail = useCallback(async (token: string) => {
    const response = await api.post("/auth/verify-email", { token })
    unwrap(response)
  }, [])

  // Re-send the verification email by address (public endpoint, no auth needed).
  const resendVerificationEmail = useCallback(async (email: string) => {
    const response = await api.post("/auth/resend-verification-email", { email })
    unwrap(response)
  }, [])

  const value = useMemo(() => ({
    user,
    isAuthenticated: !!user,
    isLoading,
    setUser,
    refreshUser,
    login,
    register,
    logout,
    forgotPassword,
    resetPassword,
    verifyEmail,
    resendVerificationEmail,
  }), [user, isLoading, refreshUser, login, register, logout, forgotPassword, resetPassword, verifyEmail, resendVerificationEmail])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error("useAuth must be used within AuthProvider")
  return context
}
