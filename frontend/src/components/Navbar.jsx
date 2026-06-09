import { Bell, ChevronDown, LogOut, Menu, MessageSquare, Moon, Sun, ShieldCheck, ShieldAlert, ShieldX, WalletCards, X } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useAppData } from "../context/AppDataContext";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { initials } from "../utils/format";
import tehillaLogo from "../assets/tehilla-logo.png";

const pageTitles = {
  "/dashboard": ["Dashboard", "Track creator deals, payments, and brand demand"],
  "/discover": ["Discover", "Find Nigerian creators with campaign-ready audience data"],
  "/offers": ["Offers", "Send, accept, reject, and complete sponsorship briefs"],
  "/payments": ["Payments", "Monitor Paystack collections, payouts, and platform fees"],
  "/analytics": ["Analytics", "Understand revenue, creator categories, and campaign quality"],
};

const kycBadge = {
  NONE: { label: "ID not submitted", icon: ShieldAlert, modifier: "" },
  PENDING: { label: "ID under review", icon: ShieldAlert, modifier: "kyc-badge--pending" },
  VERIFIED: { label: "ID verified", icon: ShieldCheck, modifier: "kyc-badge--verified" },
  REJECTED: { label: "ID needs update", icon: ShieldX, modifier: "kyc-badge--rejected" },
};

export default function Navbar({ isMenuOpen, onToggleMenu }) {
  const { user, activeRole, isDemoApp, logout } = useAuth();
  const { brand, creator, notify } = useAppData();
  const { isLight, toggleTheme } = useTheme();
  const location = useLocation();
  const accountName = activeRole === "brand" ? brand.name : creator.name || user?.name;
  const accountAvatar = activeRole === "brand" ? brand.logo : creator.avatarSmall || creator.avatar;
  const kycState = kycBadge[user?.kycStatus || "NONE"];
  const KycIcon = kycState.icon;
  const [title, subtitle] = pageTitles[location.pathname] || pageTitles["/dashboard"];
  const ThemeIcon = isLight ? Moon : Sun;
  const nextThemeLabel = isLight ? "Switch to dark mode" : "Switch to light mode";

  const handleLogout = () => {
    notify(isDemoApp ? "Signed out. Use demo credentials to return." : "Signed out.");
    logout();
  };

  return (
    <>
      <div className="mobile-topbar">
        <Link className="brand-lockup" to="/dashboard">
          <img src={tehillaLogo} alt="Tehilla" className="brand-mark-img" />
          <div className="brand-name">
            <strong>Tehilla</strong>
            <span>{activeRole}</span>
          </div>
        </Link>
        <div className="mobile-actions">
          <button className="icon-button" type="button" onClick={toggleTheme} aria-label={nextThemeLabel} aria-pressed={isLight}>
            <ThemeIcon />
          </button>
          <button className="icon-button" type="button" onClick={onToggleMenu} aria-label="Toggle navigation" aria-expanded={isMenuOpen}>
            {isMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </div>

      <header className="topbar">
        <div className="topbar-title">
          <strong>{title}</strong>
          <span>{subtitle}</span>
        </div>

        <div className="topbar-actions">
          {!isDemoApp && user && (
            <span className={`kyc-badge ${kycState.modifier}`} title={kycState.label}>
              <KycIcon size={12} /> {kycState.label}
            </span>
          )}
          <button className="currency-button" type="button" aria-label="Currency NGN" onClick={() => notify("Currency is set to NGN for this marketplace.")}>
            <WalletCards /> NGN <ChevronDown />
          </button>
          <button className="icon-button" type="button" aria-label="Messages" onClick={() => notify("3 campaign messages are ready in Offers.")}>
            <MessageSquare />
          </button>
          <button className="icon-button" type="button" aria-label="Notifications" onClick={() => notify("Notifications cover payments, offers, and creator matches.")}>
            <Bell />
          </button>
          <button className="icon-button" type="button" onClick={toggleTheme} aria-label={nextThemeLabel} aria-pressed={isLight}>
            <ThemeIcon />
          </button>
          <button className="icon-button" type="button" onClick={handleLogout} aria-label="Log out">
            <LogOut />
          </button>
          <div className="user-chip">
            {accountAvatar ? <img className="avatar avatar-image" src={accountAvatar} alt="" /> : <div className="avatar">{initials(accountName)}</div>}
            <div>
              <strong>{accountName || "Guest"}</strong>
              <span>{activeRole === "brand" ? "Brand account" : "Creator account"}</span>
            </div>
            <ChevronDown />
          </div>
        </div>
      </header>
    </>
  );
}
