import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  if (mode === 'production') {
    const env = loadEnv(mode, process.cwd(), '')
    const errors = []
    const hasPlaceholder = (value) => !value || /your_|replace_|dev_only|localhost|127\.0\.0\.1|example\.|<|>|\.\.\./i.test(String(value))
    const isHttpsUrl = (value) => {
      try {
        return new URL(value).protocol === 'https:'
      } catch {
        return false
      }
    }

    if (env.VITE_DEMO_FALLBACK !== 'false') {
      errors.push(`VITE_DEMO_FALLBACK must be "false" in production builds (got "${env.VITE_DEMO_FALLBACK || ''}")`)
    }
    if (env.VITE_APP_MODE !== 'production') {
      errors.push(`VITE_APP_MODE must be "production" in production builds (got "${env.VITE_APP_MODE || ''}")`)
    }
    if (hasPlaceholder(env.VITE_API_URL) || !isHttpsUrl(env.VITE_API_URL) || !env.VITE_API_URL.endsWith('/api')) {
      errors.push(`VITE_API_URL must point at the live HTTPS API ending in /api (got "${env.VITE_API_URL || ''}")`)
    }
    if (hasPlaceholder(env.VITE_SENTRY_DSN) || !isHttpsUrl(env.VITE_SENTRY_DSN)) {
      errors.push('VITE_SENTRY_DSN must be set to the live frontend Sentry DSN')
    }

    if (errors.length) {
      throw new Error(
        '\n\nProduction build refused. Fix these env vars before deploying:\n  - ' +
        errors.join('\n  - ') +
        '\n\nIf this is a demo build, run `vite build --mode demo` instead.\n',
      )
    }
  }

  return {
    plugins: [react()],
    build: {
      target: 'es2022',
      cssCodeSplit: true,
      cssMinify: 'lightningcss',
      minify: 'oxc',
      sourcemap: false,
      reportCompressedSize: true,
      rollupOptions: {
        output: {
          // Cache-friendly vendor splits. Hashed on content so caches stay valid forever.
          manualChunks(id) {
            if (!id.includes('node_modules')) return undefined
            if (id.includes('@sentry')) return 'vendor-sentry'
            if (id.includes('react-router') || id.includes('@remix-run/router')) return 'vendor-router'
            if (id.includes('lucide-react')) return 'vendor-icons'
            if (id.includes('axios')) return 'vendor-http'
            if (id.includes('react-dom') || id.includes('scheduler') || id.includes('/react/')) return 'vendor-react'
            return 'vendor-misc'
          },
          chunkFileNames: 'assets/[name]-[hash].js',
          entryFileNames: 'assets/[name]-[hash].js',
          assetFileNames: ({ name }) => {
            if (/\.(png|jpe?g|gif|webp|avif|svg)$/.test(name ?? '')) return 'assets/img/[name]-[hash][extname]'
            if (/\.css$/.test(name ?? '')) return 'assets/[name]-[hash][extname]'
            return 'assets/[name]-[hash][extname]'
          },
        },
      },
    },
    server: {
      headers: {
        // Dev hints: no caching so HMR works
        'Cache-Control': 'no-store',
      },
    },
    preview: {
      headers: {
        // Built SPA shell should not be cached aggressively; hashed assets are fine
        'Cache-Control': 'public, max-age=0, must-revalidate',
      },
    },
  }
})
