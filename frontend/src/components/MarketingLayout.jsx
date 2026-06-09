import { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { Moon, Sun, Menu, X, ArrowUpRight } from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import tehillaLogo from "../assets/tehilla-logo.png";

const navItems = [
  { to: "/", label: "Home" },
  { to: "/for-creators", label: "For Creators" },
  { to: "/for-brands", label: "For Brands" },
  { to: "/pricing", label: "Pricing" },
  { to: "/about", label: "About" },
];

function MarketingBrand({ onClick, label = "Tehilla home" }) {
  return (
    <Link to="/" className="marketing-logo" aria-label={label} onClick={onClick}>
      <img src={tehillaLogo} alt="Tehilla" className="brand-mark-img" />
      <span className="marketing-logo-text">
        <strong>Tehilla</strong>
        <span>Creator Commerce</span>
      </span>
    </Link>
  );
}

function MarketingHeader() {
  const { isLight, toggleTheme } = useTheme();
  const location = useLocation();
  const [isDrawerOpen, setDrawerOpen] = useState(false);
  const ThemeIcon = isLight ? Moon : Sun;

  useEffect(() => {
    setDrawerOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!isDrawerOpen) return undefined;
    const handleKey = (event) => {
      if (event.key === "Escape") setDrawerOpen(false);
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [isDrawerOpen]);

  return (
    <>
      <header className="marketing-header">
        <div className="marketing-container marketing-header-inner">
          <MarketingBrand />

          <nav className="marketing-nav" aria-label="Primary">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === "/"}
                className={({ isActive }) => `marketing-nav-link ${isActive ? "is-active" : ""}`}
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="marketing-nav-actions">
            <button
              type="button"
              className="marketing-theme-toggle"
              onClick={toggleTheme}
              aria-label={isLight ? "Switch to dark mode" : "Switch to light mode"}
              aria-pressed={isLight}
            >
              <ThemeIcon />
            </button>
            <Link to="/login" className="btn btn-ghost btn-sm">
              Log in
            </Link>
            <Link to="/register" className="btn btn-primary btn-sm">
              Get started <ArrowUpRight />
            </Link>
            <button
              type="button"
              className="marketing-menu-toggle"
              onClick={() => setDrawerOpen((current) => !current)}
              aria-label="Toggle navigation"
              aria-expanded={isDrawerOpen}
            >
              {isDrawerOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>
      </header>

      <div className={`marketing-drawer ${isDrawerOpen ? "is-open" : ""}`} onClick={() => setDrawerOpen(false)}>
        <div className="marketing-drawer-panel" onClick={(event) => event.stopPropagation()}>
          <div className="marketing-drawer-head">
            <MarketingBrand onClick={() => setDrawerOpen(false)} />
            <button
              type="button"
              className="marketing-theme-toggle"
              onClick={toggleTheme}
              aria-label={isLight ? "Switch to dark mode" : "Switch to light mode"}
            >
              <ThemeIcon />
            </button>
          </div>
          <nav aria-label="Mobile">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === "/"}
                onClick={() => setDrawerOpen(false)}
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
          <div className="drawer-actions">
            <Link to="/login" className="btn btn-secondary" onClick={() => setDrawerOpen(false)}>
              Log in
            </Link>
            <Link to="/register" className="btn btn-primary" onClick={() => setDrawerOpen(false)}>
              Get started <ArrowUpRight />
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}

function MarketingFooter() {
  return (
    <footer className="marketing-footer">
      <div className="marketing-container marketing-footer-inner">
        <div>
          <MarketingBrand />
          <p className="marketing-footer-tagline">
            The creator commerce platform for sponsorships that move money, fairly and on time.
          </p>
        </div>
        <div className="marketing-footer-col">
          <h4>Product</h4>
          <ul>
            <li><Link to="/for-creators">For Creators</Link></li>
            <li><Link to="/for-brands">For Brands</Link></li>
            <li><Link to="/pricing">Pricing</Link></li>
            <li><Link to="/login">Log in</Link></li>
            <li><Link to="/register">Create account</Link></li>
          </ul>
        </div>
        <div className="marketing-footer-col">
          <h4>Company</h4>
          <ul>
            <li><Link to="/about">About</Link></li>
            <li><a href="mailto:hello@tehilla.work">Contact</a></li>
            <li><a href="mailto:support@tehilla.work">Support</a></li>
          </ul>
        </div>
        <div className="marketing-footer-col">
          <h4>Legal</h4>
          <ul>
            <li><Link to="/terms">Terms of Service</Link></li>
            <li><Link to="/privacy">Privacy Policy</Link></li>
          </ul>
        </div>
      </div>
      <div className="marketing-container marketing-footer-meta">
        <span>© {new Date().getFullYear()} Tehilla. Built for creators, by creators.</span>
        <span>Payments processed by Paystack. NDPR-aligned.</span>
      </div>
    </footer>
  );
}

export default function MarketingLayout({ children }) {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, []);

  return (
    <div className="marketing-shell">
      <MarketingHeader />
      <main className="marketing-container" style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        {children}
      </main>
      <MarketingFooter />
    </div>
  );
}
