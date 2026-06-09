export const PLATFORM_FEE_RATE = 0.1;

export function formatNaira(value) {
  const numeric = Number(value || 0);
  return `₦${Math.round(numeric).toLocaleString("en-NG")}`;
}

export function formatNairaDecimal(value) {
  const numeric = Number(value || 0);
  return `₦${numeric.toLocaleString("en-NG", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function formatCompactNumber(value) {
  const numeric = Number(value || 0);

  if (numeric >= 1000000) {
    return `${(numeric / 1000000).toFixed(numeric >= 10000000 ? 0 : 1)}M`;
  }

  if (numeric >= 1000) {
    return `${Math.round(numeric / 1000)}K`;
  }

  return String(numeric);
}

export function calculateFees(amount) {
  const grossAmount = Number(amount || 0);
  const platformFee = Math.round(grossAmount * PLATFORM_FEE_RATE);
  const netAmount = grossAmount - platformFee;

  return {
    grossAmount,
    platformFee,
    netAmount,
  };
}

export function initials(name) {
  return String(name || "NC")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}
