import React, { Suspense, lazy } from "react";
import { Route, Routes, BrowserRouter } from "react-router-dom";
import { ThemeProvider } from "./context/ThemeContext";
import { AuthProvider } from "./context/AuthContext";
import { AppDataProvider } from "./context/AppDataContext";
import MarketingHome from "./pages/marketing/Home";
import { RouteFallback } from "./components/RouteFallback";
import { installServiceWorker } from "./lib/serviceWorker";

const MarketingForCreators = lazy(() => import("./pages/marketing/ForCreators.jsx"));
const MarketingForBrands = lazy(() => import("./pages/marketing/ForBrands.jsx"));
const MarketingPricing = lazy(() => import("./pages/marketing/Pricing.jsx"));
const MarketingAbout = lazy(() => import("./pages/marketing/About.jsx"));

const Login = lazy(() => import("./pages/Login.jsx"));
const Register = lazy(() => import("./pages/Register.jsx"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword.jsx"));
const ResetPassword = lazy(() => import("./pages/ResetPassword.jsx"));
const VerifyEmail = lazy(() => import("./pages/VerifyEmail.jsx"));
const Legal = lazy(() => import("./pages/Legal.jsx"));
const AdminApp = lazy(() => import("./pages/admin/AdminApp.jsx"));

const AppShell = lazy(() => import("./AppShell.jsx"));

export default function App() {
  React.useEffect(() => {
    installServiceWorker();
  }, []);

  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <ThemeProvider>
        <AuthProvider>
          <AppDataProvider>
            <Suspense fallback={<RouteFallback />}>
              <Routes>
                <Route path="/" element={<MarketingHome />} />
                <Route
                  path="/for-creators"
                  element={
                    <Suspense fallback={<RouteFallback label="For Creators" />}>
                      <MarketingForCreators />
                    </Suspense>
                  }
                />
                <Route
                  path="/for-brands"
                  element={
                    <Suspense fallback={<RouteFallback label="For Brands" />}>
                      <MarketingForBrands />
                    </Suspense>
                  }
                />
                <Route
                  path="/pricing"
                  element={
                    <Suspense fallback={<RouteFallback label="Pricing" />}>
                      <MarketingPricing />
                    </Suspense>
                  }
                />
                <Route
                  path="/about"
                  element={
                    <Suspense fallback={<RouteFallback label="About" />}>
                      <MarketingAbout />
                    </Suspense>
                  }
                />
                <Route
                  path="/login"
                  element={
                    <Suspense fallback={<RouteFallback label="Log in" />}>
                      <Login />
                    </Suspense>
                  }
                />
                <Route
                  path="/register"
                  element={
                    <Suspense fallback={<RouteFallback label="Create your account" />}>
                      <Register />
                    </Suspense>
                  }
                />
                <Route
                  path="/forgot-password"
                  element={
                    <Suspense fallback={<RouteFallback label="Reset password" />}>
                      <ForgotPassword />
                    </Suspense>
                  }
                />
                <Route
                  path="/reset-password"
                  element={
                    <Suspense fallback={<RouteFallback label="Reset password" />}>
                      <ResetPassword />
                    </Suspense>
                  }
                />
                <Route
                  path="/verify-email"
                  element={
                    <Suspense fallback={<RouteFallback label="Verifying" />}>
                      <VerifyEmail />
                    </Suspense>
                  }
                />
                <Route
                  path="/terms"
                  element={
                    <Suspense fallback={<RouteFallback label="Terms of Service" />}>
                      <Legal type="terms" />
                    </Suspense>
                  }
                />
                <Route
                  path="/privacy"
                  element={
                    <Suspense fallback={<RouteFallback label="Privacy Policy" />}>
                      <Legal type="privacy" />
                    </Suspense>
                  }
                />
                <Route
                  path="/admin/*"
                  element={
                    <Suspense fallback={<RouteFallback label="Opening admin console" />}>
                      <AdminApp />
                    </Suspense>
                  }
                />
                <Route
                  path="/*"
                  element={
                    <Suspense fallback={<RouteFallback label="Opening workspace" />}>
                      <AppShell />
                    </Suspense>
                  }
                />
              </Routes>
            </Suspense>
          </AppDataProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}
