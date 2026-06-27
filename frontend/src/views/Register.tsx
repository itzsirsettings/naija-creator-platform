"use client"

import { standardSchemaResolver } from "@hookform/resolvers/standard-schema"
import { AnimatePresence, motion } from "framer-motion"
import { useRef, useState } from "react"
import { useForm } from "react-hook-form"
import { Link } from "@/lib/router"
import {
  AUDIENCE_AGE_RANGES,
  AUDIENCE_LOCATIONS,
  BRAND_INDUSTRY_OPTIONS,
  CAMPAIGN_BUDGET_OPTIONS,
  CAMPAIGN_TIMELINES,
  CAMPAIGN_TYPES,
  CONTENT_FORMATS,
  CONTENT_NICHES,
  CREATOR_COUNTS,
  CREATOR_PLATFORMS,
  DEAL_EXPERIENCE,
  ENGAGEMENT_RATES,
  FOLLOWER_COUNTS,
  INFLUENCER_EXPERIENCE,
  MIN_DEAL_VALUES,
  NIGERIAN_STATES,
  PARTICIPANT_LABELS,
  TARGET_AUDIENCES,
  type ParticipantType,
} from "@/lib/creator-constants"
import {
  getDefaultValues,
  participantSchema,
  type BrandPayload,
  type CreatorPayload,
  type ParticipantPayload,
} from "@/lib/creator-schemas"
import type { FieldErrors } from "react-hook-form"

// ─── Shared primitives ───────────────────────────────────────────────────────

function Field({ label, required, error, children }: {
  label: string; required?: boolean; error?: string; children: React.ReactNode
}) {
  return (
    <div className="space-y-1.5">
      <label className="font-runde block text-[11.8px] font-medium text-[#0f0f0f]">
        {label}{required && <span className="ml-0.5 text-[#ff6363]">*</span>}
      </label>
      {children}
      {error && <p className="font-runde text-[11px] text-[#ff6363]">{error}</p>}
    </div>
  )
}

const inputClass =
  "w-full rounded-xl border border-[#d8d8d8] bg-white px-4 py-3.5 text-[12.7px] text-[#0f0f0f] placeholder-[#8d8d8d] outline-none focus:border-[#0f0f0f] transition-colors font-runde"

function Inp({ label, required, error, ...props }: {
  label: string; required?: boolean; error?: string
} & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <Field label={label} required={required} error={error}>
      <input className={inputClass} {...props} />
    </Field>
  )
}

function Sel({ label, required, error, placeholder, options, ...props }: {
  label: string; required?: boolean; error?: string; placeholder: string; options: readonly string[]
} & React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <Field label={label} required={required} error={error}>
      <select
        className={`${inputClass} appearance-none`}
        {...props}
      >
        <option value="">{placeholder}</option>
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    </Field>
  )
}

function Chips({ label, required, options, selected, onToggle, error }: {
  label: string; required?: boolean; options: readonly string[]
  selected: string[]; onToggle: (v: string) => void; error?: string
}) {
  return (
    <div className="space-y-2">
      <p className="font-runde text-[11.8px] font-medium text-[#0f0f0f]">
        {label}{required && <span className="ml-0.5 text-[#ff6363]">*</span>}
      </p>
      <div className="flex flex-wrap gap-1.5">
        {options.map((o) => {
          const active = selected.includes(o)
          return (
            <button
              key={o}
              type="button"
              onClick={() => onToggle(o)}
              className={`font-runde rounded-full border px-3 py-1.5 text-[11.8px] font-medium transition-all ${
                active
                  ? "border-[#0f0f0f] bg-[#0f0f0f] text-white"
                  : "border-[#d8d8d8] bg-white text-[#666] hover:border-[#0f0f0f] hover:text-[#0f0f0f]"
              }`}
            >
              {o}
            </button>
          )
        })}
      </div>
      {error && <p className="font-runde text-[11px] text-[#ff6363]">{error}</p>}
    </div>
  )
}

// ─── Creator section ─────────────────────────────────────────────────────────

function CreatorFields({
  register, errors, selectedAdditionalPlatforms, selectedNiches, selectedFormats,
  goalCharCount, onTogglePlatform, onToggleNiche, onToggleFormat,
}: {
  register: ReturnType<typeof useForm<ParticipantPayload>>["register"]
  errors: FieldErrors<ParticipantPayload>
  selectedAdditionalPlatforms: string[]
  selectedNiches: string[]
  selectedFormats: string[]
  goalCharCount: number
  onTogglePlatform: (v: string) => void
  onToggleNiche: (v: string) => void
  onToggleFormat: (v: string) => void
}) {
  const e = errors as FieldErrors<CreatorPayload>
  const d = e.details

  return (
    <div className="space-y-5">
      <p className="font-runde text-[11.8px] font-semibold uppercase tracking-wide text-[#8d8d8d]">Your details</p>

      <div className="grid gap-4 sm:grid-cols-2">
        <Inp label="Full name" required placeholder="Your full name"
          {...register("fullName")} error={e.fullName?.message} />
        <Inp label="Email" required type="email" placeholder="you@example.com"
          {...register("email")} error={e.email?.message} />
        <Inp label="Phone" type="tel" placeholder="+234 800 000 0000"
          {...register("phone")} error={e.phone?.message} />
        <Sel label="State / location" required placeholder="Select your state"
          options={NIGERIAN_STATES} {...register("location")} error={e.location?.message} />
      </div>

      <p className="font-runde text-[11.8px] font-semibold uppercase tracking-wide text-[#8d8d8d]">Your creator profile</p>

      <div className="grid gap-4 sm:grid-cols-2">
        <Sel label="Primary platform" required placeholder="Select platform"
          options={CREATOR_PLATFORMS} {...register("details.primaryPlatform")} error={d?.primaryPlatform?.message} />
        <Inp label="Handle / username" required placeholder="@yourhandle"
          {...register("details.handle")} error={d?.handle?.message} />
        <Sel label="Follower / subscriber count" required placeholder="Select range"
          options={FOLLOWER_COUNTS} {...register("details.followerCount")} error={d?.followerCount?.message} />
        <Sel label="Average engagement rate" required placeholder="Select rate"
          options={ENGAGEMENT_RATES} {...register("details.engagementRate")} error={d?.engagementRate?.message} />
      </div>

      <Chips label="Other platforms you're active on"
        options={CREATOR_PLATFORMS} selected={selectedAdditionalPlatforms}
        onToggle={onTogglePlatform} />

      <Chips label="Content niche(s)" required
        options={CONTENT_NICHES} selected={selectedNiches}
        onToggle={onToggleNiche} error={d?.contentNiches?.message} />

      <Chips label="Content format(s)" required
        options={CONTENT_FORMATS} selected={selectedFormats}
        onToggle={onToggleFormat} error={d?.contentFormats?.message} />

      <div className="grid gap-4 sm:grid-cols-2">
        <Sel label="Audience location" required placeholder="Select location"
          options={AUDIENCE_LOCATIONS} {...register("details.audienceLocation")} error={d?.audienceLocation?.message} />
        <Sel label="Audience age range" required placeholder="Select age range"
          options={AUDIENCE_AGE_RANGES} {...register("details.audienceAgeRange")} error={d?.audienceAgeRange?.message} />
        <Sel label="Previous brand deals" required placeholder="Select experience"
          options={DEAL_EXPERIENCE} {...register("details.previousDeals")} error={d?.previousDeals?.message} />
        <Sel label="Minimum deal value" required placeholder="Select minimum"
          options={MIN_DEAL_VALUES} {...register("details.minDealValue")} error={d?.minDealValue?.message} />
      </div>

      <Inp label="Portfolio / media kit URL" type="url" placeholder="https://your-mediakit.com"
        {...register("details.portfolioUrl")} error={d?.portfolioUrl?.message} />

      <Field label="What do you want from Tehilla?" error={d?.creatorGoals?.message}>
        <textarea
          rows={3}
          maxLength={500}
          placeholder="More deals, better brands, escrow protection, all of the above..."
          className={`${inputClass} resize-none`}
          {...register("details.creatorGoals")}
        />
        <p className="mt-1 text-right font-runde text-[11px] text-[#8d8d8d]">{goalCharCount} / 500</p>
      </Field>
    </div>
  )
}

// ─── Brand section ───────────────────────────────────────────────────────────

function BrandFields({
  register, errors, selectedNiches, selectedPlatforms, onToggleNiche, onTogglePlatform,
}: {
  register: ReturnType<typeof useForm<ParticipantPayload>>["register"]
  errors: FieldErrors<ParticipantPayload>
  selectedNiches: string[]
  selectedPlatforms: string[]
  onToggleNiche: (v: string) => void
  onTogglePlatform: (v: string) => void
}) {
  const e = errors as FieldErrors<BrandPayload>
  const d = e.details

  return (
    <div className="space-y-5">
      <p className="font-runde text-[11.8px] font-semibold uppercase tracking-wide text-[#8d8d8d]">Company details</p>

      <div className="grid gap-4 sm:grid-cols-2">
        <Inp label="Company name" required placeholder="Acme Corp"
          {...register("companyName")} error={e.companyName?.message} />
        <Inp label="Contact name" required placeholder="Your name"
          {...register("contactName")} error={e.contactName?.message} />
        <Inp label="Work email" required type="email" placeholder="marketing@company.com"
          {...register("email")} error={e.email?.message} />
        <Inp label="Phone" type="tel" placeholder="+234 800 000 0000"
          {...register("phone")} error={e.phone?.message} />
      </div>

      <Sel label="Industry" required placeholder="Select your industry"
        options={BRAND_INDUSTRY_OPTIONS} {...register("industry")} error={e.industry?.message} />

      <p className="font-runde text-[11.8px] font-semibold uppercase tracking-wide text-[#8d8d8d]">Campaign details</p>

      <Sel label="Campaign type" required placeholder="Select campaign type"
        options={CAMPAIGN_TYPES} {...register("details.campaignType")} error={d?.campaignType?.message} />

      <Chips label="Target creator niche(s)" required
        options={CONTENT_NICHES} selected={selectedNiches}
        onToggle={onToggleNiche} error={d?.targetNiches?.message} />

      <Chips label="Platform preference(s)" required
        options={CREATOR_PLATFORMS} selected={selectedPlatforms}
        onToggle={onTogglePlatform} error={d?.platformPreferences?.message} />

      <div className="grid gap-4 sm:grid-cols-2">
        <Sel label="Creators needed" required placeholder="Select count"
          options={CREATOR_COUNTS} {...register("details.creatorCountNeeded")} error={d?.creatorCountNeeded?.message} />
        <Sel label="Target audience" required placeholder="Select audience"
          options={TARGET_AUDIENCES} {...register("details.targetAudience")} error={d?.targetAudience?.message} />
        <Sel label="Campaign budget" required placeholder="Select budget"
          options={CAMPAIGN_BUDGET_OPTIONS} {...register("details.campaignBudget")} error={d?.campaignBudget?.message} />
        <Sel label="Campaign timeline" required placeholder="Select timeline"
          options={CAMPAIGN_TIMELINES} {...register("details.campaignTimeline")} error={d?.campaignTimeline?.message} />
      </div>

      <Sel label="Previous influencer campaign experience" required placeholder="Select experience level"
        options={INFLUENCER_EXPERIENCE} {...register("details.influencerExperience")} error={d?.influencerExperience?.message} />

      <Field label="Campaign brief / goals" required error={d?.campaignBrief?.message}>
        <textarea
          rows={4}
          placeholder="What do you want creators to post or produce? Include key messages, tone, deliverables, and any restrictions..."
          className={`${inputClass} resize-none`}
          {...register("details.campaignBrief")}
        />
      </Field>
    </div>
  )
}

// ─── Main form ───────────────────────────────────────────────────────────────

export default function Register() {
  const [participantType, setParticipantType] = useState<ParticipantType>("creator")
  const [submitState, setSubmitState] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [lastType, setLastType] = useState<ParticipantType>("creator")
  const [errorMsg, setErrorMsg] = useState("")
  const [validationMsg, setValidationMsg] = useState("")
  const formRef = useRef<HTMLFormElement>(null)

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } =
    useForm<ParticipantPayload>({
      resolver: standardSchemaResolver(participantSchema),
      defaultValues: getDefaultValues("creator"),
      mode: "onTouched",
    })

  // Multi-select watches
  const additionalPlatforms = (watch("details.additionalPlatforms") as string[] | undefined) ?? []
  const contentNiches = (watch("details.contentNiches") as string[] | undefined) ?? []
  const contentFormats = (watch("details.contentFormats") as string[] | undefined) ?? []
  const targetNiches = (watch("details.targetNiches") as string[] | undefined) ?? []
  const platformPreferences = (watch("details.platformPreferences") as string[] | undefined) ?? []
  const goalCharCount = ((watch("details.creatorGoals") as string | undefined) ?? "").length

  function toggle<T extends string>(
    current: string[],
    value: T,
    field: Parameters<typeof setValue>[0]
  ) {
    const next = current.includes(value)
      ? current.filter((x) => x !== value)
      : [...current, value]
    setValue(field, next as never, { shouldValidate: true })
  }

  function handleTypeChange(next: ParticipantType) {
    setParticipantType(next)
    setValidationMsg("")
    setErrorMsg("")
    setSubmitState("idle")
    reset(getDefaultValues(next))
  }

  function onInvalid() {
    setValidationMsg("Please complete the required fields below, then try again.")
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const el = formRef.current?.querySelector<HTMLElement>("[aria-invalid='true'], .border-[\\#ff6363]")
        el?.scrollIntoView({ behavior: "smooth", block: "center" })
      })
    })
  }

  async function onSubmit(data: ParticipantPayload) {
    setSubmitState("loading")
    setErrorMsg("")
    setValidationMsg("")
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? "Submission failed.")
      setLastType(participantType)
      setSubmitState("success")
      reset(getDefaultValues(participantType))
      window.scrollTo({ top: 0, behavior: "smooth" })
    } catch (err) {
      setSubmitState("error")
      setErrorMsg(err instanceof Error ? err.message : "Something went wrong.")
    }
  }

  if (submitState === "success") {
    return (
      <div className="flex min-h-screen items-center justify-center p-4 bg-white">
        <div className="w-full max-w-sm rounded-2xl border border-[#d8d8d8] bg-white p-8 shadow-sm text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#f0fdf4]">
            <svg className="size-7 text-[#5d9c06]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="font-runde text-[18px] font-semibold text-[#0f0f0f]">
            {lastType === "creator" ? "You're on the list!" : "Brief received!"}
          </h2>
          <p className="mt-2 font-runde text-[12.7px] leading-relaxed text-[#666]">
            {lastType === "creator"
              ? "A member of the Tehilla team will review your creator profile and reach out within 48 hours to complete your onboarding."
              : "We'll match your campaign with vetted creators and get back to you within 48 hours with a curated shortlist."}
          </p>
          <button
            onClick={() => setSubmitState("idle")}
            className="mt-6 w-full rounded-full border border-[#d8d8d8] py-3.5 font-runde text-[12.7px] font-medium text-[#0f0f0f] transition-colors hover:bg-[#fafafa]"
          >
            Submit another application
          </button>
          <Link to="/login" className="mt-3 block font-runde text-[12.7px] text-[#5E5AA8] hover:text-[#5E5AA8]/80 transition-colors">
            Already have an account? Sign in
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white py-10">
      <div className="mx-auto w-full max-w-xl px-4 sm:px-6">

        {/* Logo + notice */}
        <div className="mb-8 text-center">
          <Link to="/" className="inline-block mb-6">
            <img src="/Tehilla_logo_new.svg" alt="Tehilla" className="size-9 rounded-[6px] object-cover mx-auto" />
          </Link>
          <div className="rounded-2xl border border-[#d8d8d8] bg-[#fafafa] px-5 py-5 text-left">
            <p className="font-runde mb-1 text-[10.5px] font-semibold uppercase tracking-[0.16em] text-[#5E5AA8]">
              We&rsquo;re growing fast
            </p>
            <p className="font-runde text-[12.7px] leading-relaxed text-[#0f0f0f]">
              Due to an extraordinary level of interest in the Tehilla platform, we are currently
              onboarding all new creators and brands through a guided, manual review process. This
              ensures every member receives the personalised attention and quality experience our
              community deserves.
            </p>
            <p className="font-runde mt-1.5 text-[12.7px] text-[#666]">
              Complete the form below and we&rsquo;ll be in touch within{" "}
              <span className="font-semibold text-[#0f0f0f]">48 hours</span>.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {[
                { icon: "🔍", label: "Personally reviewed" },
                { icon: "⏱", label: "Response within 48 hrs" },
                { icon: "🔒", label: "No payment required" },
              ].map(({ icon, label }) => (
                <span key={label} className="font-runde inline-flex items-center gap-1 rounded-full border border-[#d8d8d8] bg-white px-2.5 py-1 text-[11px] font-medium text-[#666]">
                  <span aria-hidden>{icon}</span>{label}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-[#d8d8d8] bg-white p-6 shadow-sm sm:p-8">
          {/* Tab switcher */}
          <div className="mb-6 space-y-2">
            <p className="font-runde text-[11.8px] font-medium text-[#666]">I am joining as a…</p>
            <div className="grid grid-cols-2 gap-2 rounded-xl bg-[#fafafa] p-1 border border-[#d8d8d8]/60">
              {(["creator", "brand"] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => handleTypeChange(t)}
                  className={`font-runde rounded-lg py-3 text-[11.8px] font-medium transition-all ${
                    participantType === t
                      ? "bg-white text-[#0f0f0f] shadow-xs border border-[#d8d8d8]"
                      : "text-[#666] hover:text-[#0f0f0f]"
                  }`}
                >
                  {PARTICIPANT_LABELS[t]}
                </button>
              ))}
            </div>
          </div>

          <form ref={formRef} onSubmit={handleSubmit(onSubmit, onInvalid)} noValidate>
            <input type="hidden" {...register("participantType")} />

            <AnimatePresence mode="wait">
              <motion.div
                key={participantType}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.2 }}
              >
                {participantType === "creator" ? (
                  <CreatorFields
                    register={register}
                    errors={errors}
                    selectedAdditionalPlatforms={additionalPlatforms}
                    selectedNiches={contentNiches}
                    selectedFormats={contentFormats}
                    goalCharCount={goalCharCount}
                    onTogglePlatform={(v) => toggle(additionalPlatforms, v, "details.additionalPlatforms")}
                    onToggleNiche={(v) => toggle(contentNiches, v, "details.contentNiches")}
                    onToggleFormat={(v) => toggle(contentFormats, v, "details.contentFormats")}
                  />
                ) : (
                  <BrandFields
                    register={register}
                    errors={errors}
                    selectedNiches={targetNiches}
                    selectedPlatforms={platformPreferences}
                    onToggleNiche={(v) => toggle(targetNiches, v, "details.targetNiches")}
                    onTogglePlatform={(v) => toggle(platformPreferences, v, "details.platformPreferences")}
                  />
                )}
              </motion.div>
            </AnimatePresence>

            {/* Error banners */}
            {submitState === "error" && (
              <div className="mt-5 rounded-xl border border-[#ff6363]/30 bg-[#ff6363]/5 px-4 py-3">
                <p className="font-runde text-[11.8px] text-[#ff6363]">
                  <span className="font-semibold">Submission failed.</span> {errorMsg}
                </p>
              </div>
            )}
            {validationMsg && submitState !== "error" && (
              <div className="mt-5 rounded-xl border border-[#d8d8d8] bg-[#fafafa] px-4 py-3">
                <p className="font-runde text-[11.8px] text-[#666]">{validationMsg}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={submitState === "loading"}
              className="mt-6 w-full rounded-full bg-[#0f0f0f] py-4 font-runde text-[12.7px] font-medium text-white transition-all hover:bg-[#1e1e1e] hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
            >
              {submitState === "loading"
                ? "Submitting…"
                : participantType === "creator"
                  ? "Join as a Creator"
                  : "Post a Campaign"}
            </button>

            <p className="mt-4 text-center font-runde text-[11px] text-[#8d8d8d]">
              Fields marked <span className="text-[#ff6363]">*</span> are required. Your information is handled with care.
            </p>
          </form>
        </div>

        <p className="mt-6 text-center font-runde text-[11.8px] text-[#666]">
          Already have an account?{" "}
          <Link to="/login" className="text-[#5E5AA8] hover:text-[#5E5AA8]/80 transition-colors font-medium">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
