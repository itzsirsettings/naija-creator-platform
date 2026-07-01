"use client";

import { useState, useEffect, useRef } from "react";
import { Link, NavLink, useLocation } from "@/lib/router";
import { Menu, X, ChevronDown } from "lucide-react";

interface DropdownItem {
  to: string;
  label: string;
  description: string;
}

interface NavItemType {
  to: string;
  label: string;
  dropdown: DropdownItem[];
}

const navItems: NavItemType[] = [
  {
    to: "/",
    label: "Resources",
    dropdown: [
      { to: "/blog", label: "Blog", description: "Tips and insights for creators" },
      { to: "/guides", label: "Creator Guides", description: "Step-by-step tutorials" },
      { to: "/help", label: "Help Center", description: "Answers to common questions" },
    ],
  },
  {
    to: "/for-creators",
    label: "For Creators",
    dropdown: [
      { to: "/for-creators", label: "How It Works", description: "See how Tehilla works for you" },
      { to: "/register", label: "Apply as Creator", description: "Join Nigeria's creator marketplace" },
      { to: "/login", label: "Creator Dashboard", description: "Manage your campaigns" },
    ],
  },
  {
    to: "/for-brands",
    label: "For Brands",
    dropdown: [
      { to: "/for-brands", label: "Brand Solutions", description: "Find the perfect creators" },
      { to: "/for-brands", label: "Campaign Management", description: "Run and track campaigns" },
      { to: "/for-brands", label: "Analytics & Reports", description: "Measure your ROI" },
    ],
  },
  {
    to: "/pricing",
    label: "Pricing",
    dropdown: [
      { to: "/pricing", label: "Creator Plans", description: "Plans for individual creators" },
      { to: "/pricing", label: "Brand Plans", description: "Plans for businesses" },
      { to: "/pricing", label: "Enterprise", description: "Custom solutions for agencies" },
    ],
  },
  {
    to: "/about",
    label: "Why Tehilla",
    dropdown: [
      { to: "/about", label: "Our Story", description: "How we started and why" },
      { to: "/about", label: "Our Mission", description: "Empowering African creators" },
      { to: "/about", label: "Meet the Team", description: "The people behind Tehilla" },
    ],
  },
];

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const location = useLocation();
  const [isDrawerOpen, setDrawerOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<number | null>(null);
  const [openMobileDropdown, setOpenMobileDropdown] = useState<number | null>(null);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setDrawerOpen(false);
    setOpenMobileDropdown(null);
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
  }, [location.pathname]);

  const handleMouseEnter = (index: number) => {
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    setOpenDropdown(index);
  };

  const handleMouseLeave = () => {
    closeTimerRef.current = setTimeout(() => setOpenDropdown(null), 150);
  };

  return (
    <div className="min-h-screen bg-white text-[#0f0f0f] font-runde antialiased selection:bg-[#5E5AA8]/10 selection:text-[#0f0f0f]">
      {/* NAVIGATION */}
      <header className="fixed top-0 left-0 right-0 z-50 flex justify-center px-4 pt-3">
        <div className="flex items-center justify-between w-full max-w-[900px] px-4 py-1.5 rounded-full border border-[#d8d8d8]/80 bg-white/80 backdrop-blur-[6px] shadow-xs">
          {/* Brand */}
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <img
              src="/Tehilla_logo_new.svg"
              alt="Tehilla"
              className="size-[22px] rounded-[5px] object-cover"
            />
            <span className="font-selecta text-[16px] font-medium tracking-tight text-[#0f0f0f]">
              Tehilla
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1" aria-label="Primary">
            {navItems.map((item, index) => (
              <div
                key={item.label}
                className="relative"
                onMouseEnter={() => handleMouseEnter(index)}
                onMouseLeave={handleMouseLeave}
              >
                <NavLink
                  to={item.to}
                  end={item.to === "/"}
                  className={({ isActive }) =>
                    `inline-flex items-center gap-1 px-3 py-1.5 text-[12px] font-medium rounded-full transition-colors ${
                      isActive
                        ? "bg-[#f0f0f0] text-[#0f0f0f]"
                        : "text-[#666] hover:text-[#0f0f0f] hover:bg-[#f5f5f5]"
                    }`
                  }
                >
                  {item.label}
                  <ChevronDown
                    className={`size-3 transition-transform duration-200 ${
                      openDropdown === index ? "rotate-180" : ""
                    }`}
                  />
                </NavLink>

                {openDropdown === index && (
                  <div
                    className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-[220px] bg-white rounded-2xl border border-[#d8d8d8]/80 shadow-lg p-2 z-50"
                    onMouseEnter={() => handleMouseEnter(index)}
                    onMouseLeave={handleMouseLeave}
                  >
                    {item.dropdown.map((dropdownItem) => (
                      <Link
                        key={dropdownItem.label}
                        to={dropdownItem.to}
                        onClick={() => setOpenDropdown(null)}
                        className="flex flex-col px-3 py-2.5 rounded-xl hover:bg-[#f5f5f5] transition-colors"
                      >
                        <span className="text-[12px] font-medium text-[#0f0f0f]">
                          {dropdownItem.label}
                        </span>
                        <span className="text-[11px] text-[#8d8d8d] mt-0.5">
                          {dropdownItem.description}
                        </span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-3">
            <Link
              to="/register"
              className="hidden sm:inline-flex text-[12px] font-medium text-[#666] hover:text-[#0f0f0f] transition-colors"
            >
              Log in
            </Link>
            <Link
              to="/register"
              className="inline-flex items-center justify-center rounded-full bg-[#0f0f0f] px-[18px] py-1.5 text-[12px] font-medium text-white shadow-xs hover:bg-[#1e1e1e] transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              Sign up free
            </Link>
            {/* Mobile menu toggle */}
            <button
              onClick={() => setDrawerOpen(!isDrawerOpen)}
              className="md:hidden flex items-center justify-center size-[34px] rounded-full text-[#666] hover:text-[#0f0f0f] hover:bg-[#f5f5f5] transition-colors active:bg-[#eee]"
              aria-label="Toggle navigation"
            >
              {isDrawerOpen ? <X className="size-4" /> : <Menu className="size-4" />}
            </button>
          </div>
        </div>

        {/* Mobile Drawer */}
        {isDrawerOpen && (
          <div className="md:hidden fixed inset-0 top-[72px] z-40 bg-white/95 backdrop-blur-md overflow-y-auto">
            <nav className="flex flex-col gap-1 p-6 pt-8" aria-label="Mobile">
              {navItems.map((item, index) => (
                <div key={item.label}>
                  <div className="flex items-center">
                    <NavLink
                      to={item.to}
                      end={item.to === "/"}
                      onClick={() => setDrawerOpen(false)}
                      className={({ isActive }) =>
                        `flex-1 px-4 py-4 text-[12px] font-medium rounded-xl transition-colors ${
                          isActive
                            ? "bg-[#f0f0f0] text-[#0f0f0f]"
                            : "text-[#666] hover:text-[#0f0f0f] active:bg-[#f5f5f5]"
                        }`
                      }
                    >
                      {item.label}
                    </NavLink>
                    <button
                      onClick={() =>
                        setOpenMobileDropdown(
                          openMobileDropdown === index ? null : index
                        )
                      }
                      className="p-4 text-[#666] hover:text-[#0f0f0f] transition-colors"
                      aria-label={`Expand ${item.label}`}
                    >
                      <ChevronDown
                        className={`size-4 transition-transform duration-200 ${
                          openMobileDropdown === index ? "rotate-180" : ""
                        }`}
                      />
                    </button>
                  </div>

                  {openMobileDropdown === index && (
                    <div className="ml-4 mb-1 flex flex-col">
                      {item.dropdown.map((dropdownItem) => (
                        <Link
                          key={dropdownItem.label}
                          to={dropdownItem.to}
                          onClick={() => setDrawerOpen(false)}
                          className="px-4 py-3 rounded-xl transition-colors active:bg-[#f5f5f5]"
                        >
                          <span className="block text-[12px] font-medium text-[#0f0f0f]">
                            {dropdownItem.label}
                          </span>
                          <span className="block text-[11px] text-[#8d8d8d] mt-0.5">
                            {dropdownItem.description}
                          </span>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              <hr className="my-4 border-[#d8d8d8]" />
              <Link
                to="/register"
                onClick={() => setDrawerOpen(false)}
                className="px-4 py-4 text-[14.6px] font-medium text-[#666] hover:text-[#0f0f0f] rounded-xl active:bg-[#f5f5f5] transition-colors"
              >
                Log in
              </Link>
              <Link
                to="/register"
                onClick={() => setDrawerOpen(false)}
                className="mt-2 px-4 py-4 text-[12px] font-medium text-center text-white bg-[#0f0f0f] rounded-full hover:bg-[#1e1e1e] transition-colors active:bg-[#333]"
              >
                Sign up free
              </Link>
            </nav>
          </div>
        )}
      </header>

      {/* Main content */}
      <main className="w-full pt-[72px]">{children}</main>

      {/* FOOTER */}
      <footer className="bg-[#fafafa] border-t border-[#d8d8d8]">
        <div className="mx-auto max-w-[1200px] px-6 py-16 border-x border-[#d8d8d8]/40">
          <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-4 pb-12 border-b border-[#d8d8d8]/60">
            <div className="space-y-4">
              <span className="font-selecta text-[18px] font-medium text-[#0f0f0f] block">
                <img
                  src="/Tehilla_logo_new.svg"
                  alt=""
                  className="size-6 rounded-[6px] object-cover inline-block mr-1.5 -mt-0.5"
                />
                Tehilla
              </span>
              <p className="text-[12px] text-[#666] leading-relaxed max-w-xs">
                Africa's creator marketplace. Connect with brands, get
                sponsored, and earn from your influence.
              </p>
              <div className="text-[12px] text-[#8d8d8d] font-medium">
                Made with <span className="text-[#ff6363]">♥</span> from Africa
              </div>
            </div>

            <div className="space-y-4">
              <h6 className="font-runde text-[12px] font-semibold text-[#0f0f0f] uppercase tracking-wider">
                Product
              </h6>
              <ul className="space-y-2.5 text-[12px] text-[#666]">
                <li>
                  <Link to="/for-creators" className="hover:text-[#5E5AA8] transition-colors">
                    For Creators
                  </Link>
                </li>
                <li>
                  <Link to="/for-brands" className="hover:text-[#5E5AA8] transition-colors">
                    For Brands
                  </Link>
                </li>
                <li>
                  <Link to="/pricing" className="hover:text-[#5E5AA8] transition-colors">
                    Pricing
                  </Link>
                </li>
              </ul>
            </div>

            <div className="space-y-4">
              <h6 className="font-runde text-[12px] font-semibold text-[#0f0f0f] uppercase tracking-wider">
                Company
              </h6>
              <ul className="space-y-2.5 text-[12px] text-[#666]">
                <li>
                  <Link to="/about" className="hover:text-[#5E5AA8] transition-colors">
                    About
                  </Link>
                </li>
                <li>
                  <a href="mailto:hello@tehilla.work" className="hover:text-[#5E5AA8] transition-colors">
                    Contact
                  </a>
                </li>
                <li>
                  <a href="mailto:support@tehilla.work" className="hover:text-[#5E5AA8] transition-colors">
                    Support
                  </a>
                </li>
              </ul>
            </div>

            <div className="space-y-4">
              <h6 className="font-runde text-[12px] font-semibold text-[#0f0f0f] uppercase tracking-wider">
                Legal
              </h6>
              <ul className="space-y-2.5 text-[12px] text-[#666]">
                <li>
                  <Link to="/legal" className="hover:text-[#5E5AA8] transition-colors">
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link to="/legal" className="hover:text-[#5E5AA8] transition-colors">
                    Privacy Policy
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between pt-8 text-[12px] text-[#8d8d8d]">
            <div>&copy; {new Date().getFullYear()} Tehilla. All rights reserved.</div>
            <div className="flex items-center gap-6 mt-4 sm:mt-0 font-medium">
              <Link to="/legal" className="hover:text-[#0f0f0f]">Privacy Policy</Link>
              <Link to="/legal" className="hover:text-[#0f0f0f]">Terms of Service</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
