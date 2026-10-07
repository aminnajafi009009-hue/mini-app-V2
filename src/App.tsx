import { AnimatePresence } from "framer-motion";
import { Routes, Route } from "react-router-dom";
import { Suspense, lazy, useEffect } from "react";

import MainLayout from "@layouts/MainLayout";
import Skeleton from "@/shared/ui/Skeleton";
import BackgroundEffects from "@/shared/ui/BackgroundEffects";
import { useUserStore } from "@/shared/store/userStore";

// HomePage صفحه‌ی اول ورودی مینی‌اپه، پس همیشه eager لود می‌شه (بدون تأخیر
// اضافه‌ی chunk جدا). بقیه‌ی صفحات فقط وقتی کاربر واقعاً بهشون navigate کنه
// دانلود می‌شن (کد-اسپلیتینگ) تا حجم اولیه‌ی باندل و زمان لود اول کمتر بشه —
// این برای کاربرهایی که با فیلترشکن وصل می‌شن محسوس‌تره.
import HomePage from "@pages/Home/HomePage";
const WalletPage = lazy(() => import("@pages/Wallet/WalletPage"));
const ServicesPage = lazy(() => import("@pages/Services/ServicesPage"));
const SubscriptionPage = lazy(() => import("@pages/Subscription/SubscriptionPage"));
const ReferralPage = lazy(() => import("@pages/Referral/ReferralPage"));
const SupportPage = lazy(() => import("@pages/Support/SupportPage"));
const ProfilePage = lazy(() => import("@pages/Profile/ProfilePage"));
const SettingsPage = lazy(() => import("@pages/Settings/SettingsPage"));
const DiscountPage = lazy(() => import("@pages/Discount/DiscountPage"));
const FreeTrialPage = lazy(() => import("@pages/FreeTrial/FreeTrialPage"));
const CustomBuildPage = lazy(() => import("@pages/CustomBuild/CustomBuildPage"));
const AdminPage = lazy(() => import("@pages/Admin/AdminPage"));
const ResellerPage = lazy(() => import("@pages/Reseller/ResellerPage"));

function RouteFallback() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14, padding: "24px 4px" }}>
      <Skeleton height={120} radius={24} />
      <Skeleton height={60} radius={18} />
      <Skeleton height={60} radius={18} />
    </div>
  );
}

function AdminShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <BackgroundEffects />
      <main style={{ position: "relative", minHeight: "100vh", width: "100%", overflowX: "hidden" }}>
        <div style={{ width: "min(100%, 540px)", margin: "0 auto", padding: "24px 18px 32px", position: "relative", zIndex: 5 }}>
          {children}
        </div>
      </main>
    </>
  );
}


function RoleGate({ role, children }: { role: "admin" | "reseller"; children: React.ReactNode }) {
  const user = useUserStore((state) => state.user);
  const loading = useUserStore((state) => state.loading);
  const fetchUser = useUserStore((state) => state.fetchUser);
  const error = useUserStore((state) => state.error);
  // نکته: مقدار اولیه‌ی loading در store برابر true است؛ پس نباید منتظر false شدنش بمانیم
  // تا درخواست را شروع کنیم (قبلاً همین باعث می‌شد صفحه‌ی ادمین برای همیشه روی اسکلت بماند).
  // fetchUser خودش درخواست‌های هم‌زمان را یکی می‌کند.
  useEffect(() => {
    if (!user) void fetchUser();
  }, [user, fetchUser]);

  const allowed = role === "admin" ? !!user?.is_admin : !!user?.is_reseller;
  if (!user && loading) return <RouteFallback />;
  if (!allowed) {
    return (
      <AdminShell>
        <div style={{ padding: 32, textAlign: "center", direction: "rtl" }}>
          <h2>⛔ دسترسی غیرمجاز</h2>
          <p style={{ opacity: 0.7 }}>اطلاعات حساب ادمین از سرور دریافت نشد یا این حساب دسترسی ادمین ندارد.</p>
          {error && <p style={{ opacity: 0.65, fontSize: 12, marginTop: 12 }}>{error}</p>}
        </div>
      </AdminShell>
    );
  }
  return <>{children}</>;
}

function App() {
  return (
    <AnimatePresence mode="wait">
      <Suspense fallback={<RouteFallback />}>
        <Routes>

          <Route
            path="/admin-panel"
            element={<RoleGate role="admin"><AdminShell><AdminPage /></AdminShell></RoleGate>}
          />

          <Route
            path="/admin"
            element={<RoleGate role="admin"><AdminShell><AdminPage /></AdminShell></RoleGate>}
          />

          <Route
            path="/reseller"
            element={<RoleGate role="reseller"><AdminShell><ResellerPage /></AdminShell></RoleGate>}
          />

          <Route element={<MainLayout />}>

            <Route
              path="/"
              element={<HomePage />}
            />

            <Route
              path="/wallet"
              element={<WalletPage />}
            />

            <Route
              path="/services"
              element={<ServicesPage />}
            />

            <Route
              path="/subscription"
              element={<SubscriptionPage />}
            />

            <Route
              path="/referral"
              element={<ReferralPage />}
            />

            <Route
              path="/support"
              element={<SupportPage />}
            />

            <Route
              path="/profile"
              element={<ProfilePage />}
            />

            <Route
              path="/settings"
              element={<SettingsPage />}
            />

            <Route
              path="/discount"
              element={<DiscountPage />}
            />

            <Route
              path="/free-trial"
              element={<FreeTrialPage />}
            />

            <Route
              path="/custom-build"
              element={<CustomBuildPage />}
            />

          </Route>

        </Routes>
      </Suspense>
    </AnimatePresence>
  );
}

export default App;
