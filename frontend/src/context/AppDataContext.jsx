import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import api, { fetchCursorPage, isDemoApp, postIdempotent } from "../services/api";
import { creators as mockCreators, demoBrand, demoCreator, initialOffers, initialTransactions } from "../data/mockData";
import { useAuth } from "./AuthContext";
import { calculateFees } from "../utils/format";

const AppDataContext = createContext(null);

const DEFAULT_BALANCE = 0;
const isUuid = (value) => /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(String(value || ""));

const listFromPayload = (payload, key) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.[key])) return payload[key];
  return [];
};

const dateString = (value) => {
  if (!value) return new Date().toISOString().slice(0, 10);
  return new Date(value).toISOString().slice(0, 10);
};

const fromKobo = (value) => Math.round(Number(value || 0)) / 100;
const moneyValue = (record, nairaKey, koboKey) => {
  if (record?.[nairaKey] !== undefined) return Number(record[nairaKey] || 0);
  if (record?.[koboKey] !== undefined) return fromKobo(record[koboKey]);
  return 0;
};

const normalizeCreator = (creator) => ({
  ...creator,
  name: creator?.name || "Creator",
  handle: creator?.handle || "creator",
  niche: creator?.niche || "Creator",
  bio: creator?.bio || "Bio pending.",
  location: creator?.location || "Nigeria",
  followers: Number(creator?.followers ?? 0),
  engagement: Number(creator?.engagement ?? 0),
  baseRate: Number(creator?.baseRate ?? 0),
  platforms: Array.isArray(creator?.platforms) ? creator.platforms : [],
  avatar: creator?.avatar || "",
  avatarSmall: creator?.avatarSmall || creator?.avatar || "",
  bank: creator?.bank || (creator?.bankAccountLast4 ? `${creator.bankBankName || "Bank"} ****${creator.bankAccountLast4}` : "No verified bank"),
});

const normalizeBrand = (brand) => ({
  ...brand,
  logo: brand?.logo || "",
  monthlySpend: Number(brand?.monthlySpend ?? 0),
});

const normalizeOffer = (offer) => {
  const brand = offer?.brand || {};
  const creator = offer?.creator || {};

  return {
    id: offer.id,
    brandId: offer.brandId,
    brandName: offer.brandName || brand.name || "Brand",
    creatorId: offer.creatorId,
    creatorName: offer.creatorName || creator.name || "Creator",
    title: offer.title || "Creator campaign",
    description: offer.description || "Campaign brief pending.",
    amount: moneyValue(offer, "amount", "amountKobo"),
    amountKobo: offer.amountKobo,
    platform: offer.platform || "Instagram Reels",
    deadline: dateString(offer.deadline),
    status: offer.status || "PENDING",
    createdAt: dateString(offer.createdAt),
    logo: offer.logo || brand.logo || "",
    badge: offer.badge,
    deliverableUrl: offer.deliverableUrl || "",
    deliverableNote: offer.deliverableNote || "",
    submittedAt: offer.submittedAt || null,
    approvedAt: offer.approvedAt || null,
  };
};

const normalizeTransaction = (transaction) => {
  const amount = moneyValue(transaction, "netAmount", "netKobo") || moneyValue(transaction, "amount", "amountKobo");
  const type = String(transaction.type || (amount < 0 ? "debit" : "credit")).toLowerCase();
  const brandLogo = transaction.offer?.brand?.logo;

  return {
    id: transaction.id,
    offerId: transaction.offerId,
    label: transaction.label || transaction.offer?.title || "Campaign transaction",
    counterparty: transaction.counterparty || transaction.offer?.brand?.name || "Tehilla",
    amount: Math.abs(amount),
    grossAmount: moneyValue(transaction, "grossAmount", "grossKobo") || moneyValue(transaction, "amount", "amountKobo"),
    platformFee: moneyValue(transaction, "platformFee", "feeKobo"),
    netAmount: moneyValue(transaction, "netAmount", "netKobo") || amount,
    grossKobo: transaction.grossKobo,
    feeKobo: transaction.feeKobo,
    netKobo: transaction.netKobo,
    type,
    status: String(transaction.status || "pending").toLowerCase(),
    date: dateString(transaction.date || transaction.createdAt),
    logo: transaction.logo || brandLogo || "",
  };
};

export function AppDataProvider({ children }) {
  const { activeRole, sessionMode, user } = useAuth();
  const [marketCreators, setMarketCreators] = useState(isDemoApp ? mockCreators : []);
  const [creatorProfile, setCreatorProfile] = useState(isDemoApp ? demoCreator : {});
  const [brandProfile, setBrandProfile] = useState(isDemoApp ? demoBrand : {});
  const [offers, setOffers] = useState(isDemoApp ? initialOffers : []);
  const [transactions, setTransactions] = useState(isDemoApp ? initialTransactions : []);
  const [balance, setBalance] = useState(isDemoApp ? 245600 : 0);
  const [banks, setBanks] = useState([]);
  const [toast, setToast] = useState("");
  const [dataMode, setDataMode] = useState(isDemoApp ? "demo" : "api");
  const [dataError, setDataError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const notify = useCallback((message) => {
    setToast(message);
    window.clearTimeout(window.__tehillaToast);
    window.__tehillaToast = window.setTimeout(() => setToast(""), 3200);
  }, []);

  const reloadData = useCallback(async () => {
    if (!user || sessionMode !== "api") {
      setDataMode(isDemoApp ? "demo" : "api");
      return;
    }

    setIsLoading(true);
    setDataError("");

    try {
      const [meResult, creatorsResult] = await Promise.all([
        api.get("/auth/me"),
        fetchCursorPage("/creators", { limit: 50 }),
      ]);

      const apiUser = meResult.data.user || user;
      const apiCreators = listFromPayload(creatorsResult.data, "creators");
      const normalizedCreators = apiCreators.map((creator) => normalizeCreator(creator));
      if (normalizedCreators.length) {
        setMarketCreators(normalizedCreators);
      }

      const profile = apiUser.profile;
      const role = String(apiUser.role || user.role || "").toUpperCase();

      if (role === "CREATOR" && profile) {
        const nextCreator = normalizeCreator(profile);
        setCreatorProfile(nextCreator);
        setBalance(moneyValue(profile, "balance", "balanceKobo"));

        if (isUuid(profile.id)) {
          const [offersResult, transactionsResult, balanceResult] = await Promise.allSettled([
            api.get(`/offers/creator/${profile.id}`),
            api.get(`/payments/transactions/${profile.id}`),
            api.get(`/creators/${profile.id}/balance`),
          ]);

          if (offersResult.status === "fulfilled") {
            setOffers(listFromPayload(offersResult.value.data, "offers").map(normalizeOffer));
          }
          if (transactionsResult.status === "fulfilled") {
            setTransactions(listFromPayload(transactionsResult.value.data, "transactions").map(normalizeTransaction));
          }
          if (balanceResult.status === "fulfilled") {
            setBalance(Number(balanceResult.value.data.balance ?? moneyValue(profile, "balance", "balanceKobo") ?? 0));
          }
        }
      }

      if (role === "BRAND" && profile) {
        const nextBrand = normalizeBrand(profile);
        setBrandProfile(nextBrand);

        if (isUuid(profile.id)) {
          const offersResult = await api.get(`/offers/brand/${profile.id}`);
          setOffers(listFromPayload(offersResult.data, "offers").map(normalizeOffer));
        }
      }

      setDataMode("api");
    } catch (error) {
      setDataError(error?.response?.data?.message || error?.response?.data?.error || "Could not load backend data.");
      setDataMode("api-error");
    } finally {
      setIsLoading(false);
    }
  }, [sessionMode, user]);

  useEffect(() => {
    reloadData();
  }, [reloadData, activeRole]);

  const updateOfferStatus = useCallback(
    async (offerId, status) => {
      const previousOffers = offers;
      setOffers((current) => current.map((offer) => (offer.id === offerId ? { ...offer, status } : offer)));

      if (sessionMode !== "api" || !isUuid(offerId) || user?.role !== "CREATOR") {
        setOffers(previousOffers);
        notify("This offer action must be saved through the live API.");
        return null;
      }

      try {
        const endpoint = status === "ACCEPTED" ? "accept" : "reject";
        const { data } = await api.put(`/offers/${offerId}/${endpoint}`);
        setOffers((current) => current.map((offer) => (offer.id === offerId ? normalizeOffer(data) : offer)));
        notify(`Offer marked ${status.toLowerCase()}`);
        return data;
      } catch (error) {
        setOffers(previousOffers);
        notify(error?.response?.data?.message || error?.response?.data?.error || "Could not update offer status.");
        return null;
      }
    },
    [notify, offers, sessionMode, user?.role],
  );

  const sendOffer = useCallback(
    async (payload) => {
      if (sessionMode !== "api" || user?.role !== "BRAND" || !isUuid(payload.creatorId)) {
        notify("Sending offers requires an authenticated brand account.");
        return null;
      }

      try {
        const { data } = await postIdempotent("/offers", payload);
        const nextOffer = normalizeOffer(data);
        setOffers((current) => [nextOffer, ...current]);
        notify(`Offer sent to ${nextOffer.creatorName}`);
        return nextOffer;
      } catch (error) {
        notify(error?.response?.data?.message || error?.response?.data?.error || "Could not send offer.");
        return null;
      }
    },
    [notify, sessionMode, user?.role],
  );

  const payOffer = useCallback(
    async (offerId) => {
      const offer = offers.find((item) => item.id === offerId);
      if (!offer) return null;

      if (sessionMode !== "api" || user?.role !== "BRAND" || !isUuid(offerId)) {
        notify("Live payments require an accepted API-backed offer.");
        return null;
      }

      try {
        const { data } = await postIdempotent("/payments/initiate", { offerId });

        if (data.mode === "paystack" && data.checkoutUrl) {
          notify("Opening Paystack Checkout for secure brand payment.");
          window.location.assign(data.checkoutUrl);
          return data;
        }

        notify("Payment is already recorded for this offer.");
        await reloadData();
        return data;
      } catch (error) {
        notify(error?.response?.data?.message || error?.response?.data?.error || "Could not process payment.");
        return null;
      }
    },
    [notify, offers, reloadData, sessionMode, user?.role],
  );

  const verifyPayment = useCallback(
    async (reference) => {
      if (sessionMode !== "api" || user?.role !== "BRAND" || !reference) {
        return null;
      }

      try {
        const { data } = await postIdempotent("/payments/verify", { reference });
        if (data.transaction) {
          const transaction = normalizeTransaction(data.transaction);
          setTransactions((current) => [transaction, ...current.filter((item) => item.id !== transaction.id)]);
        }
        notify("Paystack payment verified. Offer is funded.");
        await reloadData();
        return data;
      } catch (error) {
        notify(error?.response?.data?.message || error?.response?.data?.error || "Could not verify Paystack payment yet.");
        return null;
      }
    },
    [notify, reloadData, sessionMode, user?.role],
  );

  const submitOffer = useCallback(
    async (offerId, payload = {}) => {
      const previousOffers = offers;
      setOffers((current) => current.map((offer) => (offer.id === offerId ? { ...offer, status: "SUBMITTED" } : offer)));

      if (sessionMode !== "api" || user?.role !== "CREATOR" || !isUuid(offerId)) {
        setOffers(previousOffers);
        notify("Live submissions require an API-backed funded offer.");
        return null;
      }

      try {
        const { data } = await api.put(`/offers/${offerId}/submit`, payload);
        setOffers((current) => current.map((offer) => (offer.id === offerId ? normalizeOffer(data) : offer)));
        notify("Work submitted for brand approval.");
        return data;
      } catch (error) {
        setOffers(previousOffers);
        notify(error?.response?.data?.message || error?.response?.data?.error || "Could not submit work.");
        return null;
      }
    },
    [notify, offers, sessionMode, user?.role],
  );

  const approveOffer = useCallback(
    async (offerId) => {
      const previousOffers = offers;
      setOffers((current) => current.map((offer) => (offer.id === offerId ? { ...offer, status: "APPROVED" } : offer)));

      if (sessionMode !== "api" || user?.role !== "BRAND" || !isUuid(offerId)) {
        setOffers(previousOffers);
        notify("Live approval requires an API-backed submitted offer.");
        return null;
      }

      try {
        const { data } = await api.put(`/offers/${offerId}/approve`);
        setOffers((current) => current.map((offer) => (offer.id === offerId ? normalizeOffer(data) : offer)));

        const payoutResult = await postIdempotent("/payments/payout", { offerId });
        const transaction = normalizeTransaction(payoutResult.data.transaction || payoutResult.data);
        setTransactions((current) => [transaction, ...current.filter((item) => item.id !== transaction.id)]);
        notify("Work approved. Paystack payout is processing.");
        await reloadData();
        return payoutResult.data;
      } catch (error) {
        setOffers(previousOffers);
        notify(error?.response?.data?.message || error?.response?.data?.error || "Could not approve or queue payout.");
        return null;
      }
    },
    [notify, offers, reloadData, sessionMode, user?.role],
  );

  const disputeOffer = useCallback(
    async (offerId) => {
      const previousOffers = offers;
      setOffers((current) => current.map((offer) => (offer.id === offerId ? { ...offer, status: "DISPUTED" } : offer)));

      if (sessionMode !== "api" || !isUuid(offerId)) {
        setOffers(previousOffers);
        notify("Live disputes require an API-backed offer.");
        return null;
      }

      try {
        const { data } = await api.put(`/offers/${offerId}/dispute`);
        setOffers((current) => current.map((offer) => (offer.id === offerId ? normalizeOffer(data) : offer)));
        notify("Offer marked disputed for support review.");
        return data;
      } catch (error) {
        setOffers(previousOffers);
        notify(error?.response?.data?.message || error?.response?.data?.error || "Could not dispute offer.");
        return null;
      }
    },
    [notify, offers, sessionMode],
  );

  const loadBanks = useCallback(async () => {
    if (sessionMode !== "api") {
      setBanks([]);
      return [];
    }
    try {
      const { data } = await api.get("/payments/banks");
      setBanks(data.banks || []);
      return data.banks || [];
    } catch (error) {
      notify(error?.response?.data?.message || error?.response?.data?.error || "Could not load banks.");
      return [];
    }
  }, [notify, sessionMode]);

  const setupBankAccount = useCallback(
    async (payload) => {
      if (sessionMode !== "api" || user?.role !== "CREATOR" || !isUuid(creatorProfile.id)) {
        notify("Log in as a creator before adding bank details.");
        return null;
      }

      try {
        const { data } = await api.post(`/creators/${creatorProfile.id}/bank`, payload);
        setCreatorProfile((current) => ({
          ...current,
          bankAccountName: data.accountName,
          bankAccountLast4: data.bankLast4,
          bankBankName: data.bankName,
          bankVerifiedAt: data.bankVerifiedAt,
          bank: `${data.bankName || "Bank"} ****${data.bankLast4}`,
        }));
        notify("Bank account verified for Paystack payouts.");
        return data;
      } catch (error) {
        notify(error?.response?.data?.message || error?.response?.data?.error || "Could not verify bank account.");
        return null;
      }
    },
    [creatorProfile.id, notify, sessionMode, user?.role],
  );

  const withdrawFunds = useCallback(async () => {
    notify("Payouts are released from approved sponsorship offers after Paystack confirms transfer success.");
    return null;
  }, [notify]);

  const submitSupportTicket = useCallback(
    async (payload = {}) => {
      if (sessionMode !== "api") {
        notify("Support requests require an authenticated session.");
        return false;
      }

      const ticket = {
        name: payload.name || user?.name || "",
        email: payload.email || user?.email || "",
        subject: payload.subject || "Support request",
        message: payload.message || "",
      };

      try {
        await api.post("/support/tickets", ticket);
        notify("Support request logged.");
        return true;
      } catch (error) {
        notify(error?.response?.data?.message || error?.response?.data?.error || "Could not log support request.");
        return false;
      }
    },
    [notify, sessionMode, user?.email, user?.name],
  );

  const totals = useMemo(() => {
    const creditTransactions = transactions.filter((transaction) => transaction.type === "credit");
    const gross = creditTransactions.reduce((sum, transaction) => sum + Number(transaction.grossAmount || transaction.amount || 0), 0);
    const platformFees = creditTransactions.reduce((sum, transaction) => sum + Number(transaction.platformFee || 0), 0);
    const activeDeals = offers.filter((offer) => ["PENDING", "ACCEPTED", "FUNDED", "SUBMITTED", "APPROVED", "DISPUTED"].includes(offer.status)).length;
    const pendingCreatorOffers = offers.filter((offer) => offer.creatorId === creatorProfile.id && offer.status === "PENDING").length;

    return {
      gross,
      platformFees,
      activeDeals,
      pendingCreatorOffers,
      totalEarned: creditTransactions.reduce((sum, transaction) => sum + Number(transaction.netAmount || transaction.amount || 0), 0),
      brandSpend: brandProfile.monthlySpend + offers.filter((offer) => offer.brandId === brandProfile.id).reduce((sum, offer) => sum + offer.amount, 0),
    };
  }, [brandProfile.id, brandProfile.monthlySpend, creatorProfile.id, offers, transactions]);

  const value = useMemo(
    () => ({
      creators: marketCreators,
      creator: creatorProfile,
      brand: brandProfile,
      offers,
      transactions,
      banks,
      balance,
      totals,
      toast,
      dataMode,
      dataError,
      isLoading,
      notify,
      reloadData,
      approveOffer,
      disputeOffer,
      loadBanks,
      sendOffer,
      setupBankAccount,
      submitOffer,
      verifyPayment,
      updateOfferStatus,
      payOffer,
      withdrawFunds,
      submitSupportTicket,
    }),
    [
      balance,
      banks,
      brandProfile,
      creatorProfile,
      dataError,
      dataMode,
      approveOffer,
      disputeOffer,
      isLoading,
      loadBanks,
      marketCreators,
      notify,
      offers,
      payOffer,
      reloadData,
      sendOffer,
      setupBankAccount,
      submitSupportTicket,
      submitOffer,
      toast,
      totals,
      transactions,
      updateOfferStatus,
      verifyPayment,
      withdrawFunds,
    ],
  );

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
}

export function useAppData() {
  const context = useContext(AppDataContext);
  if (!context) {
    throw new Error("useAppData must be used within AppDataProvider");
  }
  return context;
}
