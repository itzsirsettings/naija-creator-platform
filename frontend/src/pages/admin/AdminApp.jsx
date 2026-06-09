import { useCallback, useEffect, useMemo, useState } from "react";
import { NavLink, Navigate, Route, Routes } from "react-router-dom";
import { ShieldCheck } from "lucide-react";
import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import { RouteFallback } from "../../components/RouteFallback";

const tabs = [
  { to: "/admin/users", label: "Users" },
  { to: "/admin/offers", label: "Offers" },
  { to: "/admin/transactions", label: "Transactions" },
  { to: "/admin/webhooks", label: "Webhooks" },
  { to: "/admin/audit", label: "Audit log" },
];

function RequireAdmin({ children }) {
  const { isAuthReady, user } = useAuth();
  if (!isAuthReady) return <RouteFallback label="Checking access" />;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== "ADMIN") return <Navigate to="/app" replace />;
  return children;
}

function AdminShell() {
  const { user, logout } = useAuth();
  return (
    <div className="admin-shell">
      <header className="admin-header">
        <div className="admin-header-left">
          <ShieldCheck size={20} aria-hidden="true" />
          <div>
            <strong>Tehilla Admin</strong>
            <span>{user?.email}</span>
          </div>
        </div>
        <button className="compact-button" type="button" onClick={logout}>Sign out</button>
      </header>
      <nav className="admin-tabs" aria-label="Admin sections">
        {tabs.map((tab) => (
          <NavLink key={tab.to} to={tab.to} className={({ isActive }) => `admin-tab ${isActive ? "is-active" : ""}`}>
            {tab.label}
          </NavLink>
        ))}
      </nav>
      <main className="admin-main">
        <Routes>
          <Route index element={<Navigate to="/admin/users" replace />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="offers" element={<AdminOffers />} />
          <Route path="transactions" element={<AdminTransactions />} />
          <Route path="webhooks" element={<AdminWebhooks />} />
          <Route path="audit" element={<AdminAudit />} />
          <Route path="*" element={<Navigate to="/admin/users" replace />} />
        </Routes>
      </main>
    </div>
  );
}

function useAdminFetch(url, params = {}) {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const reload = useCallback(async () => {
    setIsLoading(true);
    setError("");
    try {
      const { data: response } = await api.get(url, { params });
      setData(response);
    } catch (err) {
      setError(err?.response?.data?.error || err?.message || "Could not load admin data.");
    } finally {
      setIsLoading(false);
    }
  }, [url, JSON.stringify(params)]);

  useEffect(() => { reload(); }, [reload]);

  return { data, error, isLoading, reload, setData };
}

function AdminUsers() {
  const [search, setSearch] = useState("");
  const { data, error, isLoading, reload } = useAdminFetch("/admin/users", { limit: 50 });
  const [busyId, setBusyId] = useState("");

  const handleToggleVerify = async (user) => {
    const current = user.profile?.isVerified;
    const action = current ? "unverify" : "verify";
    if (!window.confirm(`${action === "verify" ? "Verify" : "Unverify"} ${user.profile?.name || user.email} for payouts?`)) return;
    setBusyId(user.id);
    try {
      await api.post(`/admin/creators/${user.profile.id}/verify`, { verified: !current });
      await reload();
    } catch (err) {
      window.alert(err?.response?.data?.error || "Could not update verification.");
    } finally {
      setBusyId("");
    }
  };

  const handleSuspend = async (user) => {
    const reason = window.prompt(`Suspend ${user.email}? Add a reason (optional):`, "");
    if (reason === null) return;
    setBusyId(user.id);
    try {
      await api.post(`/admin/users/${user.id}/suspend`, { reason });
      await reload();
    } catch (err) {
      window.alert(err?.response?.data?.error || "Could not suspend user.");
    } finally {
      setBusyId("");
    }
  };

  const handleUnsuspend = async (user) => {
    if (!window.confirm(`Unsuspend ${user.email}?`)) return;
    setBusyId(user.id);
    try {
      await api.post(`/admin/users/${user.id}/unsuspend`);
      await reload();
    } catch (err) {
      window.alert(err?.response?.data?.error || "Could not unsuspend user.");
    } finally {
      setBusyId("");
    }
  };

  const handleReviewKyc = async (user) => {
    const decision = window.prompt(
      `Review KYC for ${user.email}.\nType "verified" or "rejected", then a comma and the note.\n\nExample: rejected, NIN mismatch`,
      "verified, ID looks good",
    );
    if (!decision) return;
    const [rawStatus, ...noteParts] = decision.split(",");
    const status = String(rawStatus || "").trim().toLowerCase();
    if (!["verified", "rejected"].includes(status)) {
      window.alert("Status must be 'verified' or 'rejected'.");
      return;
    }
    const note = noteParts.join(",").trim().slice(0, 500) || undefined;
    setBusyId(user.id);
    try {
      await api.post(`/admin/users/${user.id}/kyc/review`, { status: status === "verified" ? "VERIFIED" : "REJECTED", note });
      await reload();
    } catch (err) {
      window.alert(err?.response?.data?.error || "Could not review KYC.");
    } finally {
      setBusyId("");
    }
  };

  const kycLabel = (status) => {
    if (!status || status === "NONE") return "Not submitted";
    if (status === "PENDING") return "Pending";
    if (status === "VERIFIED") return "Verified";
    if (status === "REJECTED") return "Rejected";
    return status;
  };

  const filtered = useMemo(() => {
    const list = data?.users || [];
    if (!search) return list;
    const q = search.toLowerCase();
    return list.filter((u) => u.email.toLowerCase().includes(q) || u.profile?.name?.toLowerCase().includes(q));
  }, [data, search]);

  return (
    <section className="admin-panel">
      <header className="admin-panel-header">
        <h2>Users</h2>
        <input
          className="input"
          placeholder="Search email or name"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </header>
      {error ? <div className="status-banner is-error" role="alert">{error}</div> : null}
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr><th>Email</th><th>Role</th><th>Profile</th><th>Email</th><th>KYC</th><th>Status</th><th>Created</th><th></th></tr>
          </thead>
          <tbody>
            {filtered.map((u) => {
              const kycStatus = u.kycStatus || "NONE";
              const isKycActionable = (kycStatus === "PENDING" || kycStatus === "REJECTED") && u.role !== "ADMIN";
              return (
                  <tr key={u.id}>
                    <td>{u.email}</td>
                    <td><span className="role-pill">{u.role}</span></td>
                    <td>{u.profile?.name || "—"}</td>
                    <td>{u.emailVerifiedAt ? "Yes" : "No"}</td>
                    <td>{kycLabel(kycStatus)}</td>
                    <td>{u.suspendedAt ? <span className="badge is-warn">Suspended</span> : <span className="badge is-ok">Active</span>}</td>
                    <td>{new Date(u.createdAt).toLocaleDateString("en-NG")}</td>
                    <td>
                      <div className="admin-row-actions">
                        {u.role === "CREATOR" && u.profile && (
                          <button className={`compact-button ${u.profile.isVerified ? "" : "success"}`} type="button" onClick={() => handleToggleVerify(u)} disabled={busyId === u.id}>
                            {u.profile.isVerified ? "Unverify" : "Verify"}
                          </button>
                        )}
                        {isKycActionable && (
                          <button className="compact-button" type="button" onClick={() => handleReviewKyc(u)} disabled={busyId === u.id}>
                            {kycStatus === "PENDING" ? "Review KYC" : "Re-review KYC"}
                          </button>
                        )}
                        {u.suspendedAt ? (
                          <button className="compact-button" type="button" onClick={() => handleUnsuspend(u)} disabled={busyId === u.id}>Unsuspend</button>
                        ) : u.role === "ADMIN" ? (
                          <span className="muted">—</span>
                        ) : (
                          <button className="compact-button reject" type="button" onClick={() => handleSuspend(u)} disabled={busyId === u.id}>Suspend</button>
                        )}
                      </div>
                    </td>
                  </tr>
              );
            })}
            {!isLoading && !filtered.length ? (
              <tr><td colSpan={8} className="muted">No users match the search.</td></tr>
            ) : null}
          </tbody>
        </table>
      </div>
      {isLoading ? <div className="muted">Loading…</div> : null}
    </section>
  );
}

function AdminOffers() {
  const { data, error, isLoading, reload } = useAdminFetch("/admin/offers", { limit: 50 });
  const [busyId, setBusyId] = useState("");

  const handleForceComplete = async (offer) => {
    const reason = window.prompt(`Force-complete "${offer.title}"? Add a reason (recorded in audit log):`, "Manual intervention after dispute");
    if (!reason) return;
    setBusyId(offer.id);
    try {
      await api.post(`/admin/offers/${offer.id}/force-complete`, { reason });
      await reload();
    } catch (err) {
      window.alert(err?.response?.data?.error || "Could not force-complete offer.");
    } finally {
      setBusyId("");
    }
  };

  return (
    <section className="admin-panel">
      <header className="admin-panel-header"><h2>Offers</h2></header>
      {error ? <div className="status-banner is-error" role="alert">{error}</div> : null}
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr><th>Title</th><th>Brand</th><th>Creator</th><th>Amount</th><th>Status</th><th>Updated</th><th></th></tr>
          </thead>
          <tbody>
            {(data?.offers || []).map((o) => (
              <tr key={o.id}>
                <td>{o.title}</td>
                <td>{o.brand?.name || "—"}</td>
                <td>{o.creator?.name || "—"}</td>
                <td>₦{Number(o.amount || 0).toLocaleString("en-NG")}</td>
                <td><span className="role-pill">{o.status}</span></td>
                <td>{new Date(o.updatedAt).toLocaleString("en-NG")}</td>
                <td>
                  {["APPROVED", "DISPUTED"].includes(o.status) ? (
                    <button className="compact-button" type="button" onClick={() => handleForceComplete(o)} disabled={busyId === o.id}>
                      {busyId === o.id ? "Working…" : "Force complete"}
                    </button>
                  ) : <span className="muted">—</span>}
                </td>
              </tr>
            ))}
            {!isLoading && !(data?.offers || []).length ? (
              <tr><td colSpan={7} className="muted">No offers yet.</td></tr>
            ) : null}
          </tbody>
        </table>
      </div>
      {isLoading ? <div className="muted">Loading…</div> : null}
    </section>
  );
}

function AdminTransactions() {
  const { data, error, isLoading } = useAdminFetch("/admin/transactions", { limit: 50 });
  return (
    <section className="admin-panel">
      <header className="admin-panel-header"><h2>Transactions</h2></header>
      {error ? <div className="status-banner is-error" role="alert">{error}</div> : null}
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr><th>Offer</th><th>Brand</th><th>Net (₦)</th><th>Status</th><th>Payout</th><th>Created</th></tr>
          </thead>
          <tbody>
            {(data?.transactions || []).map((t) => (
              <tr key={t.id}>
                <td>{t.offer?.title || t.offerId}</td>
                <td>{t.offer?.brand?.name || "—"}</td>
                <td>{(Number(t.netKobo || 0) / 100).toLocaleString("en-NG")}</td>
                <td><span className="role-pill">{t.status}</span></td>
                <td>{t.payout?.status || "—"}</td>
                <td>{new Date(t.createdAt).toLocaleString("en-NG")}</td>
              </tr>
            ))}
            {!isLoading && !(data?.transactions || []).length ? (
              <tr><td colSpan={6} className="muted">No transactions yet.</td></tr>
            ) : null}
          </tbody>
        </table>
      </div>
      {isLoading ? <div className="muted">Loading…</div> : null}
    </section>
  );
}

function AdminWebhooks() {
  const { data, error, isLoading } = useAdminFetch("/admin/webhooks", { limit: 50 });
  return (
    <section className="admin-panel">
      <header className="admin-panel-header">
        <h2>Webhook events</h2>
        {data?.summary ? (
          <div className="admin-summary">
            {Object.entries(data.summary).map(([key, value]) => (
              <span key={key} className="role-pill">{key}: {value}</span>
            ))}
          </div>
        ) : null}
      </header>
      {error ? <div className="status-banner is-error" role="alert">{error}</div> : null}
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr><th>Provider</th><th>Event</th><th>Status</th><th>Event ID</th><th>Processed</th></tr>
          </thead>
          <tbody>
            {(data?.webhooks || []).map((event) => (
              <tr key={event.id}>
                <td>{event.provider}</td>
                <td>{event.eventType}</td>
                <td><span className="role-pill">{event.status}</span></td>
                <td className="muted mono">{event.eventId}</td>
                <td>{event.processedAt ? new Date(event.processedAt).toLocaleString("en-NG") : "—"}</td>
              </tr>
            ))}
            {!isLoading && !(data?.webhooks || []).length ? (
              <tr><td colSpan={5} className="muted">No webhook events yet.</td></tr>
            ) : null}
          </tbody>
        </table>
      </div>
      {isLoading ? <div className="muted">Loading…</div> : null}
    </section>
  );
}

function AdminAudit() {
  const { data, error, isLoading } = useAdminFetch("/admin/audit", { limit: 100 });
  return (
    <section className="admin-panel">
      <header className="admin-panel-header"><h2>Audit log</h2></header>
      {error ? <div className="status-banner is-error" role="alert">{error}</div> : null}
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr><th>When</th><th>Actor</th><th>Action</th><th>Entity</th><th>Metadata</th></tr>
          </thead>
          <tbody>
            {(data?.logs || []).map((log) => (
              <tr key={log.id}>
                <td>{new Date(log.createdAt).toLocaleString("en-NG")}</td>
                <td>{log.actor?.email || "system"}</td>
                <td><span className="role-pill">{log.action}</span></td>
                <td>{log.entityType}{log.entityId ? ` · ${log.entityId.slice(0, 8)}` : ""}</td>
                <td className="muted mono">{log.metadata ? JSON.stringify(log.metadata) : ""}</td>
              </tr>
            ))}
            {!isLoading && !(data?.logs || []).length ? (
              <tr><td colSpan={5} className="muted">No audit entries yet.</td></tr>
            ) : null}
          </tbody>
        </table>
      </div>
      {isLoading ? <div className="muted">Loading…</div> : null}
    </section>
  );
}

export default function AdminApp() {
  return (
    <RequireAdmin>
      <AdminShell />
    </RequireAdmin>
  );
}
