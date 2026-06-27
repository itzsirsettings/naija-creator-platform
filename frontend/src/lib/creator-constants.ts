export const PARTICIPANT_TYPES = ["creator", "brand"] as const;
export type ParticipantType = (typeof PARTICIPANT_TYPES)[number];
export const PARTICIPANT_LABELS: Record<ParticipantType, string> = {
  creator: "Creator",
  brand: "Brand",
};

export const NIGERIAN_STATES = [
  "Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa", "Benue",
  "Borno", "Cross River", "Delta", "Ebonyi", "Edo", "Ekiti", "Enugu", "FCT",
  "Gombe", "Imo", "Jigawa", "Kaduna", "Kano", "Katsina", "Kebbi", "Kogi",
  "Kwara", "Lagos", "Nasarawa", "Niger", "Ogun", "Ondo", "Osun", "Oyo",
  "Plateau", "Rivers", "Sokoto", "Taraba", "Yobe", "Zamfara", "Diaspora",
] as const;

export const CREATOR_PLATFORMS = [
  "Instagram", "TikTok", "YouTube", "Twitter / X", "Facebook",
  "Snapchat", "LinkedIn", "Podcast / Spotify",
] as const;

export const FOLLOWER_COUNTS = [
  "Under 1K", "1K–10K", "10K–50K", "50K–100K", "100K–500K", "500K+",
] as const;

export const ENGAGEMENT_RATES = [
  "Under 1%", "1–3%", "3–6%", "6–10%", "10%+", "I'm not sure",
] as const;

export const CONTENT_NICHES = [
  "Lifestyle", "Fashion", "Beauty", "Food & Drink", "Tech", "Gaming",
  "Finance", "Comedy", "Music", "Sports", "Travel", "Education",
  "Parenting", "Health & Fitness", "Business", "Entertainment",
] as const;

export const CONTENT_FORMATS = [
  "Short-form video", "Long-form video", "Stories / Ephemeral", "Static posts",
  "Blog / Newsletter", "Podcast", "Live streams", "Twitter threads",
] as const;

export const AUDIENCE_LOCATIONS = [
  "Mostly Nigeria", "Nigeria + diaspora", "Mostly diaspora", "International",
] as const;

export const AUDIENCE_AGE_RANGES = [
  "Mostly 13–17", "Mostly 18–24", "Mostly 25–34", "Mostly 35–44", "Mixed",
] as const;

export const DEAL_EXPERIENCE = [
  "None yet", "1–5 deals", "6–20 deals", "20+ deals",
] as const;

export const MIN_DEAL_VALUES = [
  "Under ₦50K", "₦50K–₦150K", "₦150K–₦500K", "₦500K–₦1M", "₦1M+",
] as const;

export const CAMPAIGN_TYPES = [
  "Sponsored content", "Product seeding / gifting", "Brand ambassador",
  "Event coverage", "Social media takeover", "Affiliate / commission", "UGC creation",
] as const;

export const CREATOR_COUNTS = ["Just 1", "2–5", "5–10", "10–20", "20+"] as const;

export const TARGET_AUDIENCES = [
  "Gen Z Nigerians", "Millennials in Nigeria", "Nigerian diaspora",
  "Professionals / B2B", "Mass market Nigeria",
] as const;

export const CAMPAIGN_BUDGET_OPTIONS = [
  "Under ₦500K", "₦500K–₦2M", "₦2M–₦5M", "₦5M–₦10M", "₦10M+",
] as const;

export const CAMPAIGN_TIMELINES = [
  "Less than 1 month", "1–2 months", "2–3 months", "3–6 months", "6–12 months",
] as const;

export const INFLUENCER_EXPERIENCE = [
  "Yes, we have experience", "First time", "We've tried but need better structure",
] as const;

export const BRAND_INDUSTRY_OPTIONS = [
  "FMCG / Consumer goods", "Fashion & apparel", "Beauty & personal care",
  "Food & beverage", "Technology", "Fintech / Financial services",
  "Telecoms", "Media & entertainment", "Health & wellness", "Travel & hospitality",
  "Education", "Retail & e-commerce", "Real estate", "Automotive", "NGO / Non-profit", "Other",
] as const;
