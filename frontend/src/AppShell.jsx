import React, { Suspense, useState } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { CheckCircle2 } from "lucide-react";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import { useAppData } from "./context/AppDataContext";
import { useAuth } from "./context/AuthContext";
import { RouteFallback } from "./components/RouteFallback";

const Dashboard = React.lazy(() => import("./pages/Home.jsx"));
const Discover = React.lazy(() => import("./pages/Discover.jsx"));
const Offers = React.lazy(() => import("./pages/Offers.jsx"));
const Payments = React.lazy(() => import("./pages/Payments.jsx"));
const Analytics = React.lazy(() => import("./pages/Analytics.jsx"));

function RequireAuth({ children }) {
  const { isAuthReady, user } = useAuth();
  if (!isAuthReady) {
    return <RouteFallback label="Opening workspace" />;
  }
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

function AppLayout() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(
    () => localStorage.getItem("tehilla_sidebar") === "collapsed"
  );
  const { toast, dataError, isLoading } = useAppData();

  const toggleSidebarCollapse = () => {
    setIsSidebarCollapsed((current) => {
      const next = !current;
      localStorage.setItem("tehilla_sidebar", next ? "collapsed" : "expanded");
      return next;
    });
  };

  return (
    <div className={`app-shell ${isSidebarCollapsed ? "sidebar-collapsed" : ""}`}>
      <Sidebar
        isCollapsed={isSidebarCollapsed}
        isOpen={isMenuOpen}
        onNavigate={() => setIsMenuOpen(false)}
        onToggleCollapse={toggleSidebarCollapse}
      />
      <main className="app-main">
        <Navbar isMenuOpen={isMenuOpen} onToggleMenu={() => setIsMenuOpen((current) => !current)} />
        {isLoading ? (
          <div className="status-banner is-loading" role="status">
            <span className="status-pulse" aria-hidden="true" />
            Syncing live data...
          </div>
        ) : null}
        {dataError ? <div className="status-banner is-error" role="alert">{dataError}</div> : null}
        <Suspense fallback={<RouteFallback label="Loading" />}>
          <Routes>
            <Route path="/app" element={<Dashboard />} />
            <Route path="/discover" element={<Discover />} />
            <Route path="/offers" element={<Offers />} />
            <Route path="/payments" element={<Payments />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="*" element={<Navigate to="/app" replace />} />
          </Routes>
        </Suspense>
      </main>
      {toast ? (
        <div className="toast" role="status">
          <CheckCircle2 size={18} /> {toast}
        </div>
      ) : null}
    </div>
  );
}

export default function AppShell() {
  return (
    <RequireAuth>
      <AppLayout />
    </RequireAuth>
  );
}
