import { z } from "zod";
import {
  AUDIENCE_AGE_RANGES, AUDIENCE_LOCATIONS, BRAND_INDUSTRY_OPTIONS,
  CAMPAIGN_BUDGET_OPTIONS, CAMPAIGN_TIMELINES, CAMPAIGN_TYPES,
  CONTENT_FORMATS, CONTENT_NICHES, CREATOR_COUNTS, CREATOR_PLATFORMS,
  DEAL_EXPERIENCE, ENGAGEMENT_RATES, FOLLOWER_COUNTS, INFLUENCER_EXPERIENCE,
  MIN_DEAL_VALUES, NIGERIAN_STATES, TARGET_AUDIENCES, type ParticipantType,
} from "./creator-constants";

function makeEnumValidator<T extends readonly string[]>(options: T, message: string) {
  return z
    .string()
    .min(1, message)
    .refine((v): v is T[number] => (options as readonly string[]).includes(v), { message });
}

const creatorDetailsSchema = z.object({
  primaryPlatform: makeEnumValidator(CREATOR_PLATFORMS, "Select your primary platform"),
  additionalPlatforms: z.array(z.enum(CREATOR_PLATFORMS)).default([]),
  handle: z.string().min(1, "Enter your primary handle or username"),
  followerCount: makeEnumValidator(FOLLOWER_COUNTS, "Select your follower / subscriber count"),
  engagementRate: makeEnumValidator(ENGAGEMENT_RATES, "Select your average engagement rate"),
  contentNiches: z.array(z.enum(CONTENT_NICHES)).min(1, "Select at least one niche"),
  contentFormats: z.array(z.enum(CONTENT_FORMATS)).min(1, "Select at least one format"),
  audienceLocation: makeEnumValidator(AUDIENCE_LOCATIONS, "Select your audience location"),
  audienceAgeRange: makeEnumValidator(AUDIENCE_AGE_RANGES, "Select your audience age range"),
  previousDeals: makeEnumValidator(DEAL_EXPERIENCE, "Select your deal experience"),
  minDealValue: makeEnumValidator(MIN_DEAL_VALUES, "Select your minimum deal value"),
  portfolioUrl: z.string().optional(),
  creatorGoals: z.string().max(500, "Keep this under 500 characters").optional(),
});

const brandDetailsSchema = z.object({
  campaignType: makeEnumValidator(CAMPAIGN_TYPES, "Select a campaign type"),
  targetNiches: z.array(z.enum(CONTENT_NICHES)).min(1, "Select at least one niche"),
  platformPreferences: z.array(z.enum(CREATOR_PLATFORMS)).min(1, "Select at least one platform"),
  creatorCountNeeded: makeEnumValidator(CREATOR_COUNTS, "Select how many creators you need"),
  targetAudience: makeEnumValidator(TARGET_AUDIENCES, "Select your target audience"),
  campaignBudget: makeEnumValidator(CAMPAIGN_BUDGET_OPTIONS, "Select a campaign budget"),
  campaignTimeline: makeEnumValidator(CAMPAIGN_TIMELINES, "Select a campaign timeline"),
  influencerExperience: makeEnumValidator(INFLUENCER_EXPERIENCE, "Select your experience level"),
  campaignBrief: z.string().min(20, "Describe your campaign goals (at least 20 characters)"),
});

export const creatorSubmissionSchema = z.object({
  participantType: z.literal("creator"),
  fullName: z.string().min(2, "Full name is required"),
  email: z.string().email("Enter a valid email address"),
  phone: z.string().optional(),
  location: makeEnumValidator(NIGERIAN_STATES, "Select your state or location"),
  details: creatorDetailsSchema,
});

export const brandSubmissionSchema = z.object({
  participantType: z.literal("brand"),
  companyName: z.string().min(2, "Company name is required"),
  contactName: z.string().min(2, "Contact name is required"),
  email: z.string().email("Enter a valid email address"),
  phone: z.string().optional(),
  industry: makeEnumValidator(BRAND_INDUSTRY_OPTIONS, "Select your industry"),
  details: brandDetailsSchema,
});

export const participantSchema = z.discriminatedUnion("participantType", [
  creatorSubmissionSchema,
  brandSubmissionSchema,
]);

export type ParticipantPayload = z.infer<typeof participantSchema>;
export type CreatorPayload = z.infer<typeof creatorSubmissionSchema>;
export type BrandPayload = z.infer<typeof brandSubmissionSchema>;

export function getDefaultValues(type: ParticipantType): ParticipantPayload {
  if (type === "creator") {
    return {
      participantType: "creator",
      fullName: "", email: "", phone: "",
      location: "" as (typeof NIGERIAN_STATES)[number],
      details: {
        primaryPlatform: "" as (typeof CREATOR_PLATFORMS)[number],
        additionalPlatforms: [],
        handle: "",
        followerCount: "" as (typeof FOLLOWER_COUNTS)[number],
        engagementRate: "" as (typeof ENGAGEMENT_RATES)[number],
        contentNiches: [],
        contentFormats: [],
        audienceLocation: "" as (typeof AUDIENCE_LOCATIONS)[number],
        audienceAgeRange: "" as (typeof AUDIENCE_AGE_RANGES)[number],
        previousDeals: "" as (typeof DEAL_EXPERIENCE)[number],
        minDealValue: "" as (typeof MIN_DEAL_VALUES)[number],
        portfolioUrl: "",
        creatorGoals: "",
      },
    } as ParticipantPayload;
  }
  return {
    participantType: "brand",
    companyName: "", contactName: "", email: "", phone: "",
    industry: "" as (typeof BRAND_INDUSTRY_OPTIONS)[number],
    details: {
      campaignType: "" as (typeof CAMPAIGN_TYPES)[number],
      targetNiches: [],
      platformPreferences: [],
      creatorCountNeeded: "" as (typeof CREATOR_COUNTS)[number],
      targetAudience: "" as (typeof TARGET_AUDIENCES)[number],
      campaignBudget: "" as (typeof CAMPAIGN_BUDGET_OPTIONS)[number],
      campaignTimeline: "" as (typeof CAMPAIGN_TIMELINES)[number],
      influencerExperience: "" as (typeof INFLUENCER_EXPERIENCE)[number],
      campaignBrief: "",
    },
  } as ParticipantPayload;
}
