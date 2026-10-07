import React from "react";
import ReactDOM from "react-dom/client";
// نکته‌ی مهم: از BrowserRouter استفاده می‌کنیم، نه HashRouter.
// تلگرام هنگام باز کردن مینی‌اپ، خودش یک هش مثل
// #tgWebAppData=...&tgWebAppVersion=...&tgWebAppPlatform=...
// به انتهای آدرس اضافه می‌کند. اگر از HashRouter استفاده کنیم، همین هش با
// مسیریابی داخلی اپ (که هم از # استفاده می‌کند) تداخل پیدا می‌کند و روتر
// هیچ مسیری را پیدا نمی‌کند، در نتیجه صفحه کاملاً خالی می‌ماند — دقیقاً
// چیزی که فقط داخل تلگرام (و نه در مرورگر معمولی) رخ می‌داد.
// برای جلوگیری از ۴۰۴ شدن مسیرهای داخلی (مثل /wallet) هنگام رفرش روی
// هاست استاتیک، به‌جای HashRouter از یک فایل public/_redirects استفاده
// می‌کنیم که به Render می‌گوید همه‌ی مسیرها را به index.html هدایت کند.
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "sonner";
import WebApp from "@twa-dev/sdk";

import App from "./App";
import { initSentry, Sentry } from "@/shared/sentry";

import "./styles/globals.css";


window.addEventListener("error", (event) => {
  const root = document.getElementById("root");
  if (root && !root.hasAttribute("data-app-mounted")) {
    root.innerHTML = `<div style="min-height:100vh;display:flex;align-items:center;justify-content:center;padding:24px;color:#fff;background:#05070F;font-family:sans-serif;text-align:center;direction:rtl"><div><div style="font-size:22px;margin-bottom:10px">⚠️ خطا در بارگذاری Mini App</div><div style="opacity:.7;font-size:13px">لطفاً Mini App را دوباره باز کنید.</div></div></div>`;
  }
  console.error("Mini App runtime error", event.error || event.message);
});

try {
  initSentry();
} catch {
  // اگر تنظیمات Sentry اشتباه باشه، نباید کل اپ رو از کار بندازه
}

// آماده‌سازی Telegram WebApp SDK. اگر خارج از تلگرام باز شود (مثلا در
// مرورگر معمولی موقع توسعه)، این متدها بی‌خطر نادیده گرفته می‌شوند.
try {
  WebApp.ready();
  WebApp.expand();
  WebApp.setHeaderColor("#05070F");
  WebApp.setBackgroundColor("#05070F");
  WebApp.BackButton.show();
} catch {
  // خارج از محیط تلگرام در حال اجراست (مثلا پیش‌نمایش مرورگر)
}

function ErrorFallback() {
  return (
    <div style={{ padding: 24, textAlign: "center", color: "#AAB3D0" }}>
      <p style={{ fontSize: 18, marginBottom: 8 }}>⚠️ یه خطای غیرمنتظره پیش اومد</p>
      <p style={{ fontSize: 13, marginBottom: 16 }}>لطفاً صفحه رو ببند و دوباره از منوی ربات باز کن.</p>
      <button
        onClick={() => window.location.reload()}
        style={{
          padding: "10px 20px",
          borderRadius: 12,
          border: "none",
          background: "#8B5CF6",
          color: "#fff",
        }}
      >
        تلاش دوباره
      </button>
    </div>
  );
}

const rootElement = document.getElementById("root")!;
rootElement.setAttribute("data-app-mounted", "true");
ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <Sentry.ErrorBoundary fallback={<ErrorFallback />}>
      <BrowserRouter>
        <App />

        <Toaster
          richColors
          position="top-center"
          expand
          closeButton
          duration={2500}
        />
      </BrowserRouter>
    </Sentry.ErrorBoundary>
  </React.StrictMode>
);
