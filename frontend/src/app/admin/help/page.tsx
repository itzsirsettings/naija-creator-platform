"use client"

import { ExternalLink, HelpCircle } from "lucide-react"

const LINKS = [
  { label: "Paystack Dashboard",      href: "https://dashboard.paystack.com",              desc: "Manage payment keys, subscriptions, and transfers" },
  { label: "Railway Deployments",     href: "https://railway.app",                          desc: "Backend API build logs and environment variables" },
  { label: "Vercel Deployments",      href: "https://vercel.com",                           desc: "Frontend build logs and preview URLs" },
  { label: "Neon Database Console",   href: "https://console.neon.tech",                    desc: "Browse tables, run SQL, and manage branches" },
  { label: "Upstash Console",         href: "https://console.upstash.com",                  desc: "Redis cache and rate limiting" },
]

export default function AdminHelpPage() {
  return (
    <div className="space-y-4">
      <div className="rounded-2xl bg-white p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <span className="flex size-10 items-center justify-center rounded-xl bg-[#0A0A9F]/10 text-[#0A0A9F]">
            <HelpCircle className="size-5" />
          </span>
          <div>
            <h2 className="font-heading text-base font-semibold text-slate-900">Quick Links</h2>
            <p className="text-xs text-slate-400">External dashboards and tools for managing the platform.</p>
          </div>
        </div>
        <div className="mt-5 divide-y divide-slate-100">
          {LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between py-3.5 transition-colors hover:text-[#0A0A9F]"
            >
              <div>
                <p className="text-sm font-semibold text-slate-800">{l.label}</p>
                <p className="text-xs text-slate-400">{l.desc}</p>
              </div>
              <ExternalLink className="size-4 shrink-0 text-slate-300" />
            </a>
          ))}
        </div>
      </div>

      <div className="rounded-2xl bg-[linear-gradient(135deg,#0A0A9F,#5E5AA8)] p-6 text-white shadow-sm">
        <h3 className="font-heading text-base font-semibold">Support</h3>
        <p className="mt-1 text-sm text-blue-100/80">
          For platform issues, check Railway logs first (build errors, API failures) then Neon for database queries.
          Paystack webhook failures are visible in the Webhooks tab above.
        </p>
      </div>
    </div>
  )
}
