"use client"

import { Settings } from "lucide-react"

export default function AdminSettingsPage() {
  return (
    <div className="rounded-2xl bg-white p-8 shadow-sm">
      <div className="flex items-center gap-3">
        <span className="flex size-10 items-center justify-center rounded-xl bg-[#0A0A9F]/10 text-[#0A0A9F]">
          <Settings className="size-5" />
        </span>
        <div>
          <h2 className="font-heading text-base font-semibold text-slate-900">Platform Settings</h2>
          <p className="text-xs text-slate-400">Configuration options coming soon.</p>
        </div>
      </div>
      <div className="mt-6 divide-y divide-slate-100">
        {[
          { label: "Maintenance Mode",     desc: "Take the platform offline for users" },
          { label: "KYC Auto-Approval",    desc: "Automatically approve KYC submissions" },
          { label: "Paystack Test Mode",   desc: "Use Paystack test keys instead of live" },
          { label: "Registration Open",    desc: "Allow new creators and brands to register" },
        ].map((s) => (
          <div key={s.label} className="flex items-center justify-between py-4">
            <div>
              <p className="text-sm font-medium text-slate-800">{s.label}</p>
              <p className="text-xs text-slate-400">{s.desc}</p>
            </div>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-medium text-slate-500">
              Coming soon
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
