import {
  BarChart3,
  Bell,
  Building2,
  ChevronDown,
  ChevronsLeft,
  ChevronsRight,
  HelpCircle,
  Handshake,
  LayoutDashboard,
  MessageCircle,
  Search,
  Settings,
  ShieldCheck,
  UserRound,
  Wallet,
} from "lucide-react";
import { NavLink } from "react-router-dom";
import { useAppData } from "../context/AppDataContext";
import { useAuth } from "../context/AuthContext";
import { initials } from "../utils/format";
import tehillaLogo from "../assets/tehilla-logo.png";

const navItems = [
  { label: "Dashboard", to: "/dashboard", icon: LayoutDashboard },
  { label: "Discover", to: "/discover", icon: Search },
  { label: "Offers", to: "/offers", icon: Handshake },
  { label: "Payments", to: "/payments", icon: Wallet },
  { label: "Analytics", to: "/analytics", icon: BarChart3 },
];

const utilityItems = [
  { label: "Messages", icon: MessageCircle, to: "/offers", count: 3, message: "Campaign messages are available from active offers." },
  { label: "Notifications", icon: Bell, to: "/dashboard", count: 8, message: "Marketplace notifications are tied to offers, payouts, and support events." },
  { label: "Settings", icon: Settings, to: "/dashboard", message: "Settings are represented by role, theme, and payment controls in this MVP." },
  { label: "Help & Support", icon: HelpCircle, to: "/dashboard", message: "Support handoff ready: connect help desk or WhatsApp in production." },
];

export default function Sidebar({ isCollapsed, isOpen, onNavigate, onToggleCollapse }) {
  const { activeRole, isDemoApp, setActiveRole, user } = useAuth();
  const { creator, notify, submitSupportTicket } = useAppData();
  const avatar = creator.avatarSmall || creator.avatar;
  const CollapseIcon = isCollapsed ? ChevronsRight : ChevronsLeft;
  const isAdmin = !isDemoApp && user?.role === "ADMIN";

  return (
    <aside className={`sidebar ${isOpen ? "is-open" : ""} ${isCollapsed ? "is-collapsed" : ""}`}>
      <div className="sidebar-header">
        <NavLink className="brand-lockup" to="/dashboard" onClick={onNavigate} title="Tehilla dashboard">
          <img src={tehillaLogo} alt="Tehilla" className="brand-mark-img" />
          <div className="brand-name">
            <strong>Tehilla</strong>
          </div>
        </NavLink>
        <button
          className="icon-button sidebar-collapse-button"
          type="button"
          onClick={onToggleCollapse}
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          aria-expanded={!isCollapsed}
          title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <CollapseIcon />
        </button>
      </div>

      <div className="role-switch" aria-label={isDemoApp ? "View as" : "Account role"}>
        <div className="rail-label">{isDemoApp ? "Switch Role" : "Account Role"}</div>
        <button
          className={`role-button ${activeRole === "creator" ? "is-active" : ""}`}
          type="button"
          onClick={() => setActiveRole("creator")}
          disabled={!isDemoApp && activeRole !== "creator"}
          title="Creator role"
        >
          <UserRound />
          <span className="sidebar-label">Creator</span>
          <ChevronDown className="role-caret" />
        </button>
        <button
          className={`role-button ${activeRole === "brand" ? "is-active" : ""}`}
          type="button"
          onClick={() => setActiveRole("brand")}
          disabled={!isDemoApp && activeRole !== "brand"}
          title="Brand role"
        >
          <Building2 />
          <span className="sidebar-label">Brand</span>
        </button>
      </div>

      <nav className="nav-stack" aria-label="Primary navigation">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`} key={item.to} to={item.to} onClick={onNavigate} title={item.label}>
              <Icon />
              <span className="sidebar-label">{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="quick-stack utility-stack">
        {isAdmin ? (
          <NavLink
            className="quick-action"
            to="/admin/users"
            onClick={onNavigate}
            title="Admin console"
          >
            <ShieldCheck />
            <span className="sidebar-label">Admin</span>
          </NavLink>
        ) : null}
        {utilityItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              className="quick-action"
              key={item.label}
              to={item.to}
              onClick={() => {
                if (item.label === "Help & Support") {
                  submitSupportTicket({ subject: "Sidebar help request", message: item.message });
                } else {
                  notify(item.message);
                }
                onNavigate?.();
              }}
              title={item.label}
            >
              <Icon />
              <span className="sidebar-label">{item.label}</span>
              {item.count ? <span className="side-count">{item.count}</span> : null}
            </NavLink>
          );
        })}
      </div>

      <div className="platform-fee-panel" title="Platform fee: 10%">
        <span>Platform Fee</span>
        <strong>10%</strong>
        <span>We only succeed when you do.</span>
        <span className="learn-more">Learn more</span>
      </div>

      <div className="sidebar-user">
        {avatar ? <img src={avatar} alt="" /> : <div className="avatar-sm">{initials(creator.name)}</div>}
        <div>
          <strong>{creator.name}</strong>
          <span>@{creator.handle}</span>
        </div>
        <ChevronDown />
      </div>
    </aside>
  );
}
