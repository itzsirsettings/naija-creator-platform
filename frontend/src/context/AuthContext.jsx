import { createContext, useContext, useEffect, useMemo, useState } from "react";
import api, { isDemoApp, setAccessToken } from "../services/api";

const AuthContext = createContext(null);

const STORAGE_USER_KEY = "tehilla_demo_user";
const STORAGE_ROLE_KEY = "tehilla_active_role";

const demoUsers = {
  CREATOR: {
    id: "demo-creator",
    name: "Adaeze Okafor",
    email: "adaeze@tehilla.demo",
    role: "CREATOR",
    emailVerified: true,
  },
  BRAND: {
    id: "demo-brand",
    name: "Kuda Bank Growth",
    email: "growth@kuda.demo",
    role: "BRAND",
    emailVerified: true,
  },
};

const normalizeRole = (role) => (role || "CREATOR").toUpperCase();
const normalizeActiveRole = (role) => normalizeRole(role).toLowerCase();

const readStoredJson = (key) => {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : null;
  } catch {
    return null;
  }
};

const readInitialUser = () => (isDemoApp ? readStoredJson(STORAGE_USER_KEY) || demoUsers.CREATOR : null);
const readInitialRole = (user) => normalizeActiveRole(localStorage.getItem(STORAGE_ROLE_KEY) || user?.role || "CREATOR");

const toDemoUser = ({ email, name, role }) => {
  const normalizedRole = normalizeRole(role);
  const baseUser = normalizedRole === "BRAND" ? demoUsers.BRAND : demoUsers.CREATOR;
  return {
    ...baseUser,
    id: `${baseUser.id}-${Date.now()}`,
    email: email || baseUser.email,
    name: name || baseUser.name,
  };
};

const getErrorMessage = (error, fallback) => {
  const responseBody = error?.response?.data;
  const primaryMessage = responseBody?.message || responseBody?.error;
  const details = Array.isArray(responseBody?.details)
    ? responseBody.details.map((detail) => detail.message).filter(Boolean).join(" ")
    : "";

  if (primaryMessage) return details ? `${primaryMessage}: ${details}` : primaryMessage;

  if (error?.code === "ERR_NETWORK" || (error?.request && !error?.response)) {
    return `Could not reach the Tehilla API at ${api.defaults.baseURL}. Check that the backend is running and that this page's origin is allowed by CORS.`;
  }

  return error?.message || fallback;
};

const toAuthError = (error, fallback) => {
  const responseBody = error?.response?.data || {};
  const authError = new Error(getErrorMessage(error, fallback));
  authError.code = responseBody.code || error?.code;
  authError.emailVerificationRequired = Boolean(responseBody.emailVerificationRequired);
  authError.verificationSent = Boolean(responseBody.verificationSent);
  authError.email = responseBody.email;
  return authError;
};

export function AuthProvider({ children }) {
  const initialUser = readInitialUser();
  const [user, setUser] = useState(initialUser);
  const [activeRole, setActiveRoleState] = useState(readInitialRole(initialUser));
  const [sessionMode, setSessionMode] = useState(isDemoApp ? "demo" : "api");
  const [authError, setAuthError] = useState("");
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [isAuthReady, setIsAuthReady] = useState(isDemoApp);

  const persistSession = ({ nextUser, token, mode }) => {
    const normalizedUser = nextUser || null;
    const normalizedRole = normalizeActiveRole(normalizedUser?.role);

    setAccessToken(token || null);
    setUser(normalizedUser);
    setActiveRoleState(normalizedRole);
    setSessionMode(mode);

    if (mode === "demo" && normalizedUser) {
      localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(normalizedUser));
      localStorage.setItem(STORAGE_ROLE_KEY, normalizedRole);
    } else {
      localStorage.removeItem(STORAGE_USER_KEY);
      localStorage.removeItem(STORAGE_ROLE_KEY);
    }
  };

  useEffect(() => {
    let cancelled = false;

    const bootstrap = async () => {
      if (isDemoApp) {
        setIsAuthReady(true);
        return;
      }

      try {
        const { data } = await api.post("/auth/refresh");
        if (cancelled) return;
        persistSession({
          nextUser: data.user,
          token: data.accessToken || data.token,
          mode: "api",
        });
      } catch {
        if (!cancelled) {
          setAccessToken(null);
          setUser(null);
          setSessionMode("api");
        }
      } finally {
        if (!cancelled) setIsAuthReady(true);
      }
    };

    bootstrap();
    return () => {
      cancelled = true;
    };
  }, []);

  const login = async ({ email, password, role }) => {
    setIsAuthenticating(true);
    setAuthError("");

    try {
      const { data } = await api.post("/auth/login", { email, password });
      const nextUser = data.user || data;
      const token = data.token || data.accessToken;
      if (token) persistSession({ nextUser, token, mode: "api" });
      return nextUser;
    } catch (error) {
      if (isDemoApp) {
        const fallbackUser = toDemoUser({ email, role, name: role === "BRAND" ? "Kuda Bank Growth" : "Adaeze Okafor" });
        persistSession({ nextUser: fallbackUser, mode: "demo" });
        return fallbackUser;
      }
      const authError = toAuthError(error, "Login failed. Check your details and try again.");
      setAuthError(authError.message);
      throw authError;
    } finally {
      setIsAuthenticating(false);
    }
  };

  const register = async ({ name, email, password, role, handle, niche, industry, nin, bvn, cacNumber, termsAccepted }) => {
    setIsAuthenticating(true);
    setAuthError("");

    try {
      const payload = {
        name,
        email,
        password,
        role: normalizeRole(role),
        handle,
        niche,
        industry,
        nin,
        bvn,
        cacNumber,
        termsAccepted,
      };
      const { data } = await api.post("/auth/register", payload);
      const nextUser = data.user || data;
      const token = data.token || data.accessToken;
      if (token) persistSession({ nextUser, token, mode: "api" });
      return data.emailVerificationRequired ? data : nextUser;
    } catch (error) {
      if (isDemoApp) {
        const fallbackUser = toDemoUser({ email, role, name });
        persistSession({ nextUser: fallbackUser, mode: "demo" });
        return fallbackUser;
      }
      const authError = toAuthError(error, "Registration failed. Please review the form and try again.");
      setAuthError(authError.message);
      throw authError;
    } finally {
      setIsAuthenticating(false);
    }
  };

  const logout = async () => {
    if (sessionMode === "api") {
      await api.post("/auth/logout").catch(() => {});
    }

    setAccessToken(null);
    setUser(null);
    setActiveRoleState("creator");
    setSessionMode(isDemoApp ? "demo" : "api");
    setAuthError("");
    localStorage.removeItem(STORAGE_USER_KEY);
    localStorage.removeItem(STORAGE_ROLE_KEY);
  };

  const forgotPassword = async (email) => api.post("/auth/forgot-password", { email });
  const resetPassword = async ({ token, password }) => api.post("/auth/reset-password", { token, password });
  const verifyEmail = async (token) => api.post("/auth/verify-email", { token });
  const resendVerification = async () => api.post("/auth/resend-verification");
  const resendVerificationEmail = async (email) => api.post("/auth/resend-verification-email", { email });
  const updateKyc = async (payload) => {
    const { data } = await api.put("/auth/kyc", payload);
    persistSession({ nextUser: data.user, token: data.token || data.accessToken, mode: "api" });
    return data.user;
  };

  useEffect(() => {
    const handleAuthExpired = () => {
      setAccessToken(null);
      setUser(null);
      setActiveRoleState("creator");
      setSessionMode(isDemoApp ? "demo" : "api");
      localStorage.removeItem(STORAGE_USER_KEY);
      localStorage.removeItem(STORAGE_ROLE_KEY);
    };

    window.addEventListener("tehilla:auth-expired", handleAuthExpired);
    return () => window.removeEventListener("tehilla:auth-expired", handleAuthExpired);
  }, []);

  const setActiveRole = (role) => {
    const normalizedRole = isDemoApp ? normalizeActiveRole(role) : normalizeActiveRole(user?.role);
    setActiveRoleState(normalizedRole);
    if (isDemoApp) localStorage.setItem(STORAGE_ROLE_KEY, normalizedRole);
  };

  const value = useMemo(
    () => ({
      user,
      activeRole,
      sessionMode,
      authError,
      isAuthenticated: Boolean(user),
      isAuthenticating,
      isAuthReady,
      isDemoApp,
      forgotPassword,
      login,
      logout,
      register,
      resendVerification,
      resendVerificationEmail,
      resetPassword,
      setActiveRole,
      updateKyc,
      verifyEmail,
    }),
    [user, activeRole, sessionMode, authError, isAuthenticating, isAuthReady],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
