import { useState, useEffect } from "react"
import { Link, NavLink, useLocation } from "@/lib/router"
import { Menu, X } from "lucide-react"

const navItems = [
  { to: "/", label: "Home" },
  { to: "/for-creators", label: "For Creators" },
  { to: "/for-brands", label: "For Brands" },
  { to: "/pricing", label: "Pricing" },
  { to: "/about", label: "About" },
]

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  const location = useLocation()
  const [isDrawerOpen, setDrawerOpen] = useState(false)

  useEffect(() => {
    setDrawerOpen(false)
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior })
  }, [location.pathname])

  return (
    <div className="min-h-screen bg-white text-[#0f0f0f] font-runde antialiased selection:bg-[#0098f2]/10 selection:text-[#0f0f0f]">
      
      {/* NAVIGATION */}
      <header className="fixed top-0 left-0 right-0 z-50 flex justify-center px-4 pt-4">
        <div className="flex items-center justify-between w-full max-w-[1200px] px-5 py-2.5 rounded-full border border-[#d8d8d8]/80 bg-white/80 backdrop-blur-[6px] shadow-xs">
          
          {/* Brand */}
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <img src="/Tehilla_logo_new.svg" alt="Tehilla" className="size-7 rounded-[6px] object-cover" />
            <span className="font-selecta text-[18.2px] font-medium tracking-tight text-[#0f0f0f]">Tehilla</span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1" aria-label="Primary">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === "/"}
                className={({ isActive }) =>
                  `px-4 py-2 text-[12.7px] font-medium rounded-full transition-colors ${
                    isActive ? "bg-[#f0f0f0] text-[#0f0f0f]" : "text-[#666] hover:text-[#0f0f0f] hover:bg-[#f5f5f5]"
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="hidden sm:inline-flex text-[12.7px] font-medium text-[#666] hover:text-[#0f0f0f] transition-colors"
            >
              Log in
            </Link>
            <Link
              to="/register"
              className="inline-flex items-center justify-center rounded-full bg-[#0f0f0f] px-6 py-2.5 text-[12.7px] font-medium text-white shadow-xs hover:bg-[#1e1e1e] transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              Sign up free
            </Link>
            {/* Mobile menu toggle */}
            <button
              onClick={() => setDrawerOpen(!isDrawerOpen)}
              className="md:hidden flex items-center justify-center size-11 rounded-full text-[#666] hover:text-[#0f0f0f] hover:bg-[#f5f5f5] transition-colors active:bg-[#eee]"
              aria-label="Toggle navigation"
            >
              {isDrawerOpen ? <X className="size-5" /> : <Menu className="size-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Drawer */}
        {isDrawerOpen && (
          <div className="md:hidden fixed inset-0 top-[72px] z-40 bg-white/95 backdrop-blur-md">
            <nav className="flex flex-col gap-1 p-6 pt-8" aria-label="Mobile">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === "/"}
                  onClick={() => setDrawerOpen(false)}
                  className={({ isActive }) =>
                    `px-4 py-4 text-[14.6px] font-medium rounded-xl transition-colors ${
                      isActive ? "bg-[#f0f0f0] text-[#0f0f0f]" : "text-[#666] hover:text-[#0f0f0f] active:bg-[#f5f5f5]"
                    }`
                  }
                >
                  {item.label}
                </NavLink>
              ))}
              <hr className="my-4 border-[#d8d8d8]" />
              <Link
                to="/login"
                onClick={() => setDrawerOpen(false)}
                className="px-4 py-4 text-[14.6px] font-medium text-[#666] hover:text-[#0f0f0f] rounded-xl active:bg-[#f5f5f5] transition-colors"
              >
                Log in
              </Link>
              <Link
                to="/register"
                onClick={() => setDrawerOpen(false)}
                className="mt-2 px-4 py-4 text-[14.6px] font-medium text-center text-white bg-[#0f0f0f] rounded-full hover:bg-[#1e1e1e] transition-colors active:bg-[#333]"
              >
                Sign up free
              </Link>
            </nav>
          </div>
        )}
      </header>

      {/* Main content */}
      <main className="w-full pt-[72px]">
        {children}
      </main>

      {/* FOOTER */}
      <footer className="bg-[#fafafa] border-t border-[#d8d8d8]">
        <div className="mx-auto max-w-[1200px] px-6 py-16 border-x border-[#d8d8d8]/40">

          <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-4 pb-12 border-b border-[#d8d8d8]/60">
            <div className="space-y-4">
              <span className="font-selecta text-[18.2px] font-medium text-[#0f0f0f] block">
                <img src="/Tehilla_logo_new.svg" alt="" className="size-6 rounded-[6px] object-cover inline-block mr-1.5 -mt-0.5" />
                Tehilla
              </span>
              <p className="text-[11.8px] text-[#666] leading-relaxed max-w-xs">
                Nigeria's creator marketplace. Connect with brands, get sponsored, and earn from your influence.
              </p>
              <div className="text-[10px] text-[#8d8d8d] font-medium">
                Made with <span className="text-[#ff6363]">♥</span> from Nigeria
              </div>
            </div>

            <div className="space-y-4">
              <h6 className="font-runde text-[11.8px] font-semibold text-[#0f0f0f] uppercase tracking-wider">Product</h6>
              <ul className="space-y-2.5 text-[11.8px] text-[#666]">
                <li><Link to="/for-creators" className="hover:text-[#0098f2] transition-colors">For Creators</Link></li>
                <li><Link to="/for-brands" className="hover:text-[#0098f2] transition-colors">For Brands</Link></li>
                <li><Link to="/pricing" className="hover:text-[#0098f2] transition-colors">Pricing</Link></li>
              </ul>
            </div>

            <div className="space-y-4">
              <h6 className="font-runde text-[11.8px] font-semibold text-[#0f0f0f] uppercase tracking-wider">Company</h6>
              <ul className="space-y-2.5 text-[11.8px] text-[#666]">
                <li><Link to="/about" className="hover:text-[#0098f2] transition-colors">About</Link></li>
                <li><a href="mailto:hello@tehilla.work" className="hover:text-[#0098f2] transition-colors">Contact</a></li>
                <li><a href="mailto:support@tehilla.work" className="hover:text-[#0098f2] transition-colors">Support</a></li>
              </ul>
            </div>

            <div className="space-y-4">
              <h6 className="font-runde text-[11.8px] font-semibold text-[#0f0f0f] uppercase tracking-wider">Legal</h6>
              <ul className="space-y-2.5 text-[11.8px] text-[#666]">
                <li><Link to="/legal" className="hover:text-[#0098f2] transition-colors">Terms of Service</Link></li>
                <li><Link to="/legal" className="hover:text-[#0098f2] transition-colors">Privacy Policy</Link></li>
              </ul>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between pt-8 text-[10.9px] text-[#8d8d8d]">
            <div>&copy; {new Date().getFullYear()} Tehilla. All rights reserved.</div>
            <div className="flex items-center gap-6 mt-4 sm:mt-0 font-medium">
              <Link to="/legal" className="hover:text-[#0f0f0f]">Privacy Policy</Link>
              <Link to="/legal" className="hover:text-[#0f0f0f]">Terms of Service</Link>
            </div>
          </div>

        </div>
      </footer>

    </div>
  )
}
