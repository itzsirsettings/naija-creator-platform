-- Performance indexes for hot query paths

-- Creator: filter by premiumTier (campaign discovery, featured creators)
CREATE INDEX "Creator_premiumTier_idx" ON "Creator"("premiumTier");

-- Creator: filter verified creators
CREATE INDEX "Creator_isVerified_idx" ON "Creator"("isVerified");

-- Offer: affiliate code lookup (already unique but index helps prefix scans)
CREATE INDEX "Offer_affiliateCode_idx" ON "Offer"("affiliateCode");

-- Campaign: sort by newest first without compound index
CREATE INDEX "Campaign_createdAt_idx" ON "Campaign"("createdAt");
