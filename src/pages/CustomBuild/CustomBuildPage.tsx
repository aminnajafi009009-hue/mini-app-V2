import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { CheckCircle2, Paperclip, Wrench, Package, Clock, Type } from "lucide-react";

import {
  customBuildCardInfo,
  customBuildCardReceipt,
  customBuildQuote,
  customBuildWallet,
  getCustomBuildLimits,
} from "@/shared/api/services";
import type { CustomBuildLimits, CustomBuildOrderType } from "@/shared/api/types";
import { ApiError, friendlyErrorMessage } from "@/shared/api/client";

import GlassCard from "@/shared/ui/GlassCard";
import { ExpiryCountdown } from "@/shared/ui/ExpiryCountdown";
import { StepIndicator } from "@/shared/ui/StepIndicator";
import PremiumButton from "@/shared/ui/PremiumButton";
import PremiumInput from "@/shared/ui/PremiumInput";
import FadeIn from "@/shared/animations/FadeIn";

import styles from "./CustomBuildPage.module.css";

type Step = "form" | "checkout" | "card-pay" | "done";

const LATIN_NAME_RE = /^[A-Za-z0-9]+$/;

interface NavState {
  orderType?: CustomBuildOrderType;
  targetConfigId?: number;
  planLabel?: string;
}

export default function CustomBuildPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const navState = (location.state as NavState) || {};
  const orderType: CustomBuildOrderType = navState.orderType === "renew" ? "renew" : "new";

  const [limits, setLimits] = useState<CustomBuildLimits | null>(null);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState<Step>("form");

  const [volume, setVolume] = useState<number>(0);
  const [days, setDays] = useState<number>(0);
  const [name, setName] = useState("");
  const [nameError, setNameError] = useState("");
  const [renewMode, setRenewMode] = useState<"time" | "volume" | "both">("both");

  const [price, setPrice] = useState<number | null>(null);
  const [quoting, setQuoting] = useState(false);
  const [busy, setBusy] = useState(false);

  const [cardInfo, setCardInfo] = useState<{ card_number: string; card_holder: string; price: number; invoice_id?: number; expires_at?: string } | null>(null);
  const [receiptFile, setReceiptFile] = useState<File | null>(null);

  useEffect(() => {
    getCustomBuildLimits()
      .then((l) => {
        setLimits(l);
        setVolume(l.min_gb);
        setDays(l.min_days);
      })
      .catch(() => toast.error("خطا در دریافت محدودیت‌های ساخت سرویس"))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!limits || (orderType === "renew" && renewMode === "time" ? !days : orderType === "renew" && renewMode === "volume" ? !volume : (!volume || !days))) return;
    setQuoting(true);
    const t = setTimeout(() => {
      customBuildQuote(volume, days, orderType, orderType === "renew" ? renewMode : undefined)
        .then((r) => setPrice(r.price))
        .catch(() => setPrice(null))
        .finally(() => setQuoting(false));
    }, 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [volume, days, limits, renewMode, orderType]);

  const canContinue = useMemo(() => {
    if (orderType === "renew" && renewMode === "time" && !days) return false;
    if (orderType === "renew" && renewMode === "volume" && !volume) return false;
    if (orderType === "new" && (!volume || !days)) return false;
    if (orderType === "renew" && renewMode === "both" && (!volume || !days)) return false;
    if (orderType === "new" && (!name.trim() || !LATIN_NAME_RE.test(name.trim()))) return false;
    return true;
  }, [volume, days, name, orderType, renewMode]);

  function goToCheckout() {
    if (orderType === "new") {
      const trimmed = name.trim();
      if (!trimmed || !LATIN_NAME_RE.test(trimmed)) {
        setNameError("فقط حروف انگلیسی و عدد، بدون فاصله (مثال: aminvpn1)");
        return;
      }
    }
    setNameError("");
    setStep("checkout");
  }

  async function payWithWallet() {
    setBusy(true);
    try {
      await customBuildWallet({
        volumeGb: volume,
        days,
        name: orderType === "new" ? name.trim() : undefined,
        orderType,
        renewMode: orderType === "renew" ? renewMode : undefined,
        targetConfigId: navState.targetConfigId,
      });
      toast.success("پرداخت موفق! سرویس شما به‌زودی ساخته و ارسال می‌شود.");
      setStep("done");
    } catch (e) {
      const err = e as ApiError;
      if (err.code === "insufficient_balance") toast.error("موجودی کیف پول کافی نیست");
      else if (err.code === "orders_closed") toast.error("بخش سفارشات موقتاً بسته است");
      else toast.error("خطا در ثبت سفارش");
    } finally {
      setBusy(false);
    }
  }

  async function startCardPay() {
    setBusy(true);
    try {
      const info = await customBuildCardInfo(volume, days, orderType, undefined, navState.targetConfigId, orderType === "renew" ? renewMode : undefined);
      setCardInfo(info);
      setStep("card-pay");
    } catch {
      toast.error("خطا در دریافت اطلاعات پرداخت");
    } finally {
      setBusy(false);
    }
  }

  async function submitReceipt() {
    if (!receiptFile) return;
    setBusy(true);
    try {
      await customBuildCardReceipt({
        volumeGb: volume,
        days,
        name: orderType === "new" ? name.trim() : undefined,
        orderType,
        renewMode: orderType === "renew" ? renewMode : undefined,
        targetConfigId: navState.targetConfigId,
        file: receiptFile,
        invoiceId: cardInfo?.invoice_id,
      });
      toast.success("رسید ارسال شد؛ پس از تأیید ادمین سرویس ساخته می‌شود");
      setStep("done");
    } catch (e) {
      // ممکن است ارسال رسید به ادمین در تلگرام شکست بخورد (telegram_delivery_failed)
      // یا فرمت فایل نامعتبر باشد (invalid_file_type)؛ باید کاربر دلیل واقعی را ببیند.
      toast.error(friendlyErrorMessage(e, "خطا در ارسال رسید"));
    } finally {
      setBusy(false);
    }
  }

  const title = orderType === "renew" ? "🔁 تمدید سرویس" : "🛠 بساز سرویس خودت";

  if (loading || !limits) {
    return (
      <div className={styles.page}>
        <p className={styles.emptyState}>در حال بارگذاری...</p>
      </div>
    );
  }

  if (step === "done") {
    return (
      <div className={styles.page}>
        <StepIndicator step={3} total={3} label="تکمیل" />
        <FadeIn>
          <GlassCard className={styles.doneCard}>
            <div className={styles.doneInner}>
              <div className={styles.doneIcon}>
                <CheckCircle2 size={30} />
              </div>
              <h3>ثبت شد!</h3>
              <p>سرویس شما پس از بررسی ساخته و برایتان ارسال می‌شود.</p>
            </div>
          </GlassCard>
        </FadeIn>
        <PremiumButton fullWidth onClick={() => navigate("/services")}>
          مشاهده سرویس‌های من
        </PremiumButton>
        <PremiumButton fullWidth variant="ghost" onClick={() => navigate("/")}>
          بازگشت به خانه
        </PremiumButton>
      </div>
    );
  }

  if (step === "card-pay" && cardInfo) {
    return (
      <div className={styles.page}>
        <StepIndicator step={2} total={3} label="پرداخت" />
        {cardInfo.expires_at && (
          <ExpiryCountdown
            expiresAt={cardInfo.expires_at}
            onExpire={() => {
              toast.error("⏰ مهلت پرداخت این فاکتور به پایان رسید. لطفاً دوباره سفارش دهید.");
              setCardInfo(null);
              setStep("checkout");
            }}
          />
        )}
        <FadeIn>
          <GlassCard className={styles.infoCard}>
            <p>شماره کارت:</p>
            <p className={styles.cardNumber}>{cardInfo.card_number}</p>
            <p>
              به نام: <b>{cardInfo.card_holder}</b>
            </p>
            <p>
              مبلغ: <b>{cardInfo.price.toLocaleString("fa-IR")} تومان</b>
            </p>
          </GlassCard>
        </FadeIn>

        {receiptFile && (
          <img
            src={URL.createObjectURL(receiptFile)}
            alt="پیش‌نمایش رسید"
            style={{ width: "100%", maxHeight: 220, objectFit: "contain", borderRadius: 12, marginBottom: 8 }}
          />
        )}
        <label className={styles.fileDrop}>
          {receiptFile ? (
            <>
              <CheckCircle2 size={18} /> {receiptFile.name}
            </>
          ) : (
            <>
              <Paperclip size={18} /> برای انتخاب عکس رسید ضربه بزنید
            </>
          )}
          <input
            type="file"
            accept="image/*"
            hidden
            onChange={(e) => setReceiptFile(e.target.files?.[0] || null)}
          />
        </label>

        <PremiumButton fullWidth disabled={!receiptFile} loading={busy} onClick={submitReceipt}>
          ارسال رسید برای تأیید
        </PremiumButton>
        <PremiumButton fullWidth variant="ghost" onClick={() => setStep("checkout")}>
          بازگشت
        </PremiumButton>
      </div>
    );
  }

  if (step === "checkout") {
    return (
      <div className={styles.page}>
        <StepIndicator step={1} total={3} label="انتخاب" />
        <FadeIn>
          <GlassCard className={styles.summaryCard}>
            <div className={styles.summaryRow}>
              <span>📦 حجم</span>
              <b>{volume} گیگابایت</b>
            </div>
            <div className={styles.summaryRow}>
              <span>⏳ مدت</span>
              <b>{days} روز</b>
            </div>
            {orderType === "new" && (
              <div className={styles.summaryRow}>
                <span>🔤 نام سرویس</span>
                <b className={styles.ltr}>{name.trim()}</b>
              </div>
            )}
            <div className={styles.divider} />
            <div className={styles.summaryRowTotal}>
              <span>💰 قیمت نهایی</span>
              <b>{quoting ? "..." : price != null ? `${price.toLocaleString("fa-IR")} تومان` : "-"}</b>
            </div>
          </GlassCard>
        </FadeIn>

        <PremiumButton fullWidth loading={busy} onClick={payWithWallet}>
          پرداخت از کیف پول
        </PremiumButton>
        <PremiumButton fullWidth variant="secondary" loading={busy} onClick={startCardPay}>
          پرداخت کارت‌به‌کارت
        </PremiumButton>
        <PremiumButton fullWidth variant="ghost" onClick={() => setStep("form")}>
          بازگشت
        </PremiumButton>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <FadeIn>
        <div className={styles.hero}>
          <div className={`${styles.heroIcon} sphere-3d float`}>
            <Wrench size={30} />
          </div>
          <h2 className={styles.heroTitle}>{title}</h2>
          {orderType === "renew" && (
            <GlassCard className={styles.infoCard}>
              <p style={{fontWeight:700}}>نوع تمدید را انتخاب کنید</p>
              <div style={{display:"grid",gap:8}}>
                <PremiumButton variant={renewMode === "time" ? "primary" : "secondary"} onClick={() => {setRenewMode("time");setVolume(0);setDays(Math.max(30, limits.min_days));}}>⏳ تمدید زمان — حداقل ۳۰ روز</PremiumButton>
                <PremiumButton variant={renewMode === "volume" ? "primary" : "secondary"} onClick={() => {setRenewMode("volume");setVolume(5);setDays(0);}}>🗜 تمدید حجم — حداقل ۵ گیگ</PremiumButton>
                <PremiumButton variant={renewMode === "both" ? "primary" : "secondary"} onClick={() => {setRenewMode("both");setVolume(limits.min_gb);setDays(limits.min_days);}}>🔁 تمدید حجم و زمان</PremiumButton>
              </div>
            </GlassCard>
          )}
          <p className={styles.heroSubtitle}>
            💡 هر گیگابایت {limits.price_per_gb.toLocaleString("fa-IR")} تومان + هر ۳۰ روز{" "}
            {limits.price_per_30_days.toLocaleString("fa-IR")} تومان
          </p>
        </div>
      </FadeIn>

      {!(orderType === "renew" && renewMode === "time") && <FadeIn delay={0.05}>
        <GlassCard className={styles.fieldCard}>
          <label className={styles.fieldLabel}>
            <Package size={16} /> حجم (گیگابایت) — بین {limits.min_gb} تا {limits.max_gb}
          </label>
          <input
            type="range"
            min={orderType === "renew" && renewMode === "volume" ? 5 : limits.min_gb}
            max={limits.max_gb}
            value={volume}
            onChange={(e) => setVolume(Number(e.target.value))}
            className={styles.slider}
          />
          <div className={styles.sliderValue}>{volume} گیگ</div>
        </GlassCard>
      </FadeIn>}

      {!(orderType === "renew" && renewMode === "volume") && <FadeIn delay={0.1}>
        <GlassCard className={styles.fieldCard}>
          <label className={styles.fieldLabel}>
            <Clock size={16} /> مدت (روز) — بین {limits.min_days} تا {limits.max_days}
          </label>
          <input
            type="range"
            min={orderType === "renew" && renewMode === "time" ? 30 : limits.min_days}
            max={limits.max_days}
            value={days}
            onChange={(e) => setDays(Number(e.target.value))}
            className={styles.slider}
          />
          <div className={styles.sliderValue}>{days} روز</div>
        </GlassCard>
      </FadeIn>}

      {orderType === "new" && (
        <FadeIn delay={0.15}>
          <PremiumInput
            label="نام سرویس (فقط لاتین، بدون فاصله)"
            placeholder="مثال: aminvpn1"
            leftIcon={<Type size={16} />}
            value={name}
            error={nameError}
            onChange={(e) => {
              setName(e.target.value);
              setNameError("");
            }}
          />
        </FadeIn>
      )}

      <FadeIn delay={0.2}>
        <GlassCard className={styles.priceCard}>
          <span>قیمت تخمینی</span>
          <b>{quoting ? "..." : price != null ? `${price.toLocaleString("fa-IR")} تومان` : "-"}</b>
        </GlassCard>
      </FadeIn>

      <PremiumButton fullWidth disabled={!canContinue} onClick={goToCheckout}>
        ادامه
      </PremiumButton>
      <PremiumButton fullWidth variant="ghost" onClick={() => navigate(-1)}>
        انصراف
      </PremiumButton>
    </div>
  );
}
