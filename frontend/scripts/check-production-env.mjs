import { existsSync, readFileSync } from "node:fs";

const loadEnvFile = (path, override = false) => {
  if (!existsSync(path)) return;
  const lines = readFileSync(path, "utf8").split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#") || !trimmed.includes("=")) continue;
    const [name, ...rest] = trimmed.split("=");
    if (!name) continue;
    if (!override && process.env[name] !== undefined) continue;
    process.env[name] = rest.join("=").trim().replace(/^["']|["']$/g, "");
  }
};

loadEnvFile(".env");
loadEnvFile(".env.production", true);
// .env.production.local takes ultimate precedence for local dev validation
loadEnvFile(".env.production.local", true);

const checks = [];

const add = (name, ok, detail) => {
  checks.push({ name, ok: Boolean(ok), detail });
};

const value = (name) => String(process.env[name] || "").trim();
const hasPlaceholder = (input) => !input || /your_|replace_|dev_only|localhost|127\.0\.0\.1|example\.|<|>|\.\.\./i.test(String(input));

const isHttpsUrl = (input) => {
  try {
    const url = new URL(input);
    return url.protocol === "https:";
  } catch {
    return false;
  }
};

add("VITE_APP_MODE=production", value("VITE_APP_MODE") === "production", "Live frontend must use production mode.");
add("VITE_DEMO_FALLBACK=false", value("VITE_DEMO_FALLBACK") === "false", "Live frontend must not fall back to demo data.");
add("VITE_API_URL", isHttpsUrl(value("VITE_API_URL")) && !hasPlaceholder(value("VITE_API_URL")) && value("VITE_API_URL").endsWith("/api"), "Use the live API URL ending in /api.");
add("VITE_SENTRY_DSN", isHttpsUrl(value("VITE_SENTRY_DSN")) && !hasPlaceholder(value("VITE_SENTRY_DSN")), "Frontend error tracking DSN is required.");

const failed = checks.filter((check) => !check.ok);

for (const check of checks) {
  const marker = check.ok ? "PASS" : "FAIL";
  console.log(`${marker} ${check.name} - ${check.detail}`);
}

if (failed.length) {
  console.error(`\nFrontend production env preflight failed: ${failed.length} issue(s).`);
  process.exit(1);
}

console.log("\nFrontend production env preflight passed.");
