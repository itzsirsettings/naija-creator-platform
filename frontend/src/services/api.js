import axios from "axios";

let accessToken = null;

export const appMode = import.meta.env.VITE_APP_MODE || (import.meta.env.VITE_DEMO_FALLBACK === "false" ? "production" : "demo");
export const isDemoApp = appMode === "demo";

const loopbackHosts = new Set(["localhost", "127.0.0.1", "::1", "[::1]"]);
const isLoopbackHost = (hostname) => loopbackHosts.has(String(hostname || "").toLowerCase());
const formatHost = (hostname) => {
  const normalized = String(hostname || "localhost").replace(/^\[|\]$/g, "");
  return normalized.includes(":") ? `[${normalized}]` : normalized;
};

const defaultApiUrl = () => {
  if (typeof window === "undefined") return "http://localhost:5000/api";
  return `${window.location.protocol}//${formatHost(window.location.hostname)}:5000/api`;
};

const resolveApiBaseUrl = () => {
  const configuredUrl = import.meta.env.VITE_API_URL;
  if (!configuredUrl) return defaultApiUrl();

  if (import.meta.env.DEV && typeof window !== "undefined") {
    try {
      const apiUrl = new URL(configuredUrl);
      if (isLoopbackHost(apiUrl.hostname) && isLoopbackHost(window.location.hostname)) {
        apiUrl.hostname = formatHost(window.location.hostname);
        return apiUrl.toString().replace(/\/$/, "");
      }
    } catch {
      return configuredUrl;
    }
  }

  return configuredUrl;
};

export function setAccessToken(token) {
  accessToken = token || null;
}

const randomId = () => {
  if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();
  return `idemp-${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

const api = axios.create({
  baseURL: resolveApiBaseUrl(),
  withCredentials: true,
  timeout: 12000,
});

let refreshPromise = null;

api.interceptors.request.use((config) => {
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    const recoveryEndpoint = ["/auth/login", "/auth/register", "/auth/refresh", "/auth/logout"].some((path) => originalRequest?.url?.includes(path));

    if (error.response?.status === 401 && originalRequest && !originalRequest.__isRetry && !recoveryEndpoint) {
      originalRequest.__isRetry = true;
      refreshPromise ||= api
        .post("/auth/refresh")
        .then((response) => {
          const token = response.data?.accessToken || response.data?.token;
          if (token) setAccessToken(token);
          return token;
        })
        .finally(() => {
          refreshPromise = null;
        });

      let token = null;
      try {
        token = await refreshPromise;
      } catch (refreshError) {
        window.dispatchEvent(new CustomEvent("tehilla:auth-expired"));
        throw refreshError;
      }
      if (token) {
        originalRequest.headers.Authorization = `Bearer ${token}`;
        return api(originalRequest);
      }

      window.dispatchEvent(new CustomEvent("tehilla:auth-expired"));
    }

    throw error;
  },
);

export async function postIdempotent(url, payload, options = {}) {
  return api.post(url, payload, {
    ...options,
    headers: {
      ...(options.headers || {}),
      "Idempotency-Key": options.idempotencyKey || randomId(),
    },
  });
}

export async function fetchCursorPage(url, params = {}) {
  const { data } = await api.get(url, { params });
  return {
    ...data,
    nextCursor: data.nextCursor || null,
  };
}

export default api;
