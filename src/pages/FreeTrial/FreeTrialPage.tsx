import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import WebApp from "@twa-dev/sdk";
import { CheckCircle2, Paperclip, Gift } from "lucide-react";

import {
  buyPlanWithWallet,
  getCardInfo,
  getFreeTrial,
  uploadPlanReceipt,
  validateDiscount,
} from "@/shared/api/services";
import type { Plan } from "@/shared/api/types";
import { ApiError } from "@/shared/api/client";

import GlassCard from "@/shared/ui/GlassCard";
import PremiumButton from "@/shared/ui/PremiumButton";
import PremiumInput from "@/shared/ui/PremiumInput";
import FadeIn from "@/shared/animations/FadeIn";

import styles from "@/pages/Subscription/SubscriptionPage.module.css";
import heroStyles from "@/pages/CustomBuild/CustomBuildPage.module.css";

type Step = "info" | "card-pay" | "done";

export default function FreeTrialPage() {
  const navigate = useNavigate();

  const [plan, setPlan] = useState<Plan | null>(null);
  const [wallet, setWallet] = useState(0);
  const [ordersEnabled, setOrdersEnabled] = useState(true);
  const [loading, setLoading] = useState(true);

  const [step, setStep] = useState<Step>("info");
  const [discountCode, setDiscountCode] = useState("");
  const [discountPercent, setDiscountPercent] = useState<number | null>(null);
  const [discountMeta, setDiscountMeta] = useState<{ type: "percent" | "amount"; amount: number } | null>(null);
  const [checkingDiscount, setCheckingDiscount] = useState(false);
  const [busy, setBusy] = useState(false);

  const [cardInfo, setCardInfo] = useState<{ card_number: string; card_holder: string; price: number } | null>(null);
  const [receiptFile, setReceiptFile] = useState<File | null>(null);

  useEffect(() => {
    getFreeTrial()
      .then((res) => {
        setPlan(res.plan);
        setWallet(res.wallet);
        setOrdersEnabled(res.orders_enabled);
      })
      .catch(() => toast.error("خطا در دریافت اطلاعات تست رایگان"))
      .finally(() => setLoading(false));
  }, []);

  const finalPrice = plan
    ? discountMeta?.type === "amount"
      ? Math.max(0, plan.price - discountMeta.amount)
      : Math.round(plan.price * (1 - (discountPercent || 0) / 100))
    : 0;

  async function checkDiscount() {
    if (!discountCode.trim()) {
      setDiscountPercent(null);
      setDiscountMeta(null);
      return;
    }
    setCheckingDiscount(true);
    try {
      const res = await validateDiscount(discountCode.trim(), plan?.key);
      if (res.valid) {
        if (res.discount_type === "amount") {
          setDiscountMeta({ type: "amount", amount: res.amount || 0 });
          setDiscountPercent(null);
          toast.success(`کد تخفیف ${(res.amount || 0).toLocaleString("fa-IR")} تومانی اعمال شد`);
        } else {
          setDiscountMeta({ type: "percent", amount: 0 });
          setDiscountPercent(res.percent || 0);
          toast.success(`کد تخفیف ${res.percent}٪ اعمال شد`);
        }
      } else {
        setDiscountPercent(null);
        setDiscountMeta(null);
        if (res.reason === "wrong_plan") toast.error("این کد روی این پلن قابل استفاده نیست");
        else if (res.reason === "user_limit_reached") toast.error("سهمیه‌ی شما از این کد تمام شده");
        else if (res.reason === "not_allowed") toast.error("شما مجاز به استفاده از این کد تخفیف نیستید");
        else toast.error("کد تخفیف نامعتبر است");
      }
    } catch {
      toast.error("خطا در بررسی کد تخفیف");
    } finally {
      setCheckingDiscount(false);
    }
  }

  function handleAlreadyUsedFreeTrial() {
    WebApp.showAlert(
      "⚠️ شما قبلاً از «تست رایگان» استفاده کرده‌اید. هر کاربر فقط یک‌بار می‌تواند این پلن را دریافت کند."
    );
  }

  async function payWithWallet() {
    if (!plan) return;
    setBusy(true);
    try {
      await buyPlanWithWallet(plan.key, discountCode.trim());
      toast.success("خرید با موفقیت انجام شد");
      setStep("done");
    } catch (e) {
      const err = e as ApiError;
      if (err.code === "free_test_already_used") handleAlreadyUsedFreeTrial();
      else if (err.code === "insufficient_balance") toast.error("موجودی کیف پول کافی نیست");
      else if (err.code === "orders_closed") toast.error("بخش سفارشات موقتاً بسته است");
      else toast.error("خطا در ثبت خرید");
    } finally {
      setBusy(false);
    }
  }

  async function startCardPay() {
    if (!plan) return;
    setBusy(true);
    try {
      const info = await getCardInfo(plan.key, discountCode.trim());
      setCardInfo(info);
      setStep("card-pay");
    } catch (e) {
      const err = e as ApiError;
      if (err.code === "free_test_already_used") handleAlreadyUsedFreeTrial();
      else toast.error("خطا در دریافت اطلاعات پرداخت");
    } finally {
      setBusy(false);
    }
  }

  async function submitReceipt() {
    if (!plan || !receiptFile) return;
    setBusy(true);
    try {
      await uploadPlanReceipt(plan.key, discountCode.trim(), receiptFile);
      toast.success("رسید ارسال شد؛ پس از تأیید ادمین سرویس برایتان ارسال می‌شود");
      setStep("done");
    } catch (e) {
      const err = e as ApiError;
      if (err.code === "free_test_already_used") handleAlreadyUsedFreeTrial();
      else toast.error("خطا در ارسال رسید");
    } finally {
      setBusy(false);
    }
  }

  if (loading || !plan) {
    return (
      <div className={styles.page}>
        <p className={styles.emptyState}>در حال بارگذاری...</p>
      </div>
    );
  }

  if (step === "done") {
    return (
      <div className={styles.page}>
        <FadeIn>
          <GlassCard className={styles.doneCard}>
            <div className={styles.doneInner}>
              <div className={styles.doneIcon}>
                <CheckCircle2 size={30} />
              </div>
              <h3>ثبت شد!</h3>
              <p>نتیجه به‌زودی برایتان اطلاع‌رسانی می‌شود.</p>
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
        <FadeIn>
          <GlassCard className={styles.infoCard}>
            <p>شماره کارت:</p>
            <p className={styles.cardNumber}>{cardInfo.card_number}</p>
            <p>به نام: <b>{cardInfo.card_holder}</b></p>
            <p>مبلغ: <b>{cardInfo.price.toLocaleString("fa-IR")} تومان</b></p>
          </GlassCard>
        </FadeIn>

        <label className={styles.fileDrop}>
          {receiptFile ? (
            <><CheckCircle2 size={18} /> {receiptFile.name}</>
          ) : (
            <><Paperclip size={18} /> برای انتخاب عکس رسید ضربه بزنید</>
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
        <PremiumButton fullWidth variant="ghost" onClick={() => setStep("info")}>
          بازگشت
        </PremiumButton>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      {!ordersEnabled && (
        <FadeIn>
          <GlassCard className={styles.noticeCard}>
            🔴 ربات به دلیل حجم سفارشات بالا موقتاً بسته می‌باشد.
            <br />
            روشن شدن دوباره‌ی آن اطلاع‌رسانی خواهد شد.
          </GlassCard>
        </FadeIn>
      )}

      <FadeIn>
        <div className={heroStyles.hero}>
          <div className={`${heroStyles.heroIcon} sphere-3d float`}>
            <Gift size={30} />
          </div>
          <h2 className={heroStyles.heroTitle}>🎁 تست رایگان</h2>
          <p className={heroStyles.heroSubtitle}>یک نمونه‌ی کوچک برای امتحان کیفیت سرویس، با قیمتی نمادین</p>
        </div>
      </FadeIn>

      <FadeIn delay={0.05}>
        <GlassCard className={styles.planSummary}>
          <div className={styles.planSummaryInner}>
            <span className={styles.planName}>{plan.name}</span>
            <span className={styles.planDays}>
              {plan.days > 0 ? `${plan.days} روز` : "زمان نامحدود"}
              {plan.volume_gb ? ` · ${plan.volume_gb} گیگ` : ""}
            </span>
          </div>
        </GlassCard>
      </FadeIn>

      <FadeIn delay={0.08}>
        <div className={styles.discountRow}>
          <PremiumInput
            placeholder="کد تخفیف (اختیاری)"
            value={discountCode}
            onChange={(e) => setDiscountCode(e.target.value)}
          />
          <PremiumButton variant="secondary" onClick={checkDiscount} loading={checkingDiscount}>
            اعمال
          </PremiumButton>
        </div>
      </FadeIn>

      <FadeIn delay={0.1}>
        <GlassCard className={styles.priceCard}>
          <div className={styles.priceLine}>
            <span>قیمت پایه</span>
            <span>{plan.price.toLocaleString("fa-IR")} تومان</span>
          </div>
          {discountMeta?.type === "amount" ? (
            <div className={styles.priceLine} style={{ color: "#33F5A5" }}>
              <span>تخفیف</span>
              <span>-{discountMeta.amount.toLocaleString("fa-IR")} ت</span>
            </div>
          ) : discountPercent ? (
            <div className={styles.priceLine} style={{ color: "#33F5A5" }}>
              <span>تخفیف</span>
              <span>٪{discountPercent}-</span>
            </div>
          ) : null}
          <div className={styles.divider} />
          <div className={styles.priceLineTotal}>
            <span>مبلغ نهایی</span>
            <span>{finalPrice.toLocaleString("fa-IR")} تومان</span>
          </div>
          <p style={{ marginTop: 8, opacity: 0.7, fontSize: 13 }}>
            👛 موجودی کیف پول شما: {wallet.toLocaleString("fa-IR")} تومان
          </p>
        </GlassCard>
      </FadeIn>

      <PremiumButton fullWidth disabled={!ordersEnabled} loading={busy} onClick={payWithWallet}>
        پرداخت از کیف پول
      </PremiumButton>
      <PremiumButton fullWidth variant="secondary" disabled={!ordersEnabled} loading={busy} onClick={startCardPay}>
        پرداخت کارت‌به‌کارت
      </PremiumButton>
      <PremiumButton fullWidth variant="ghost" onClick={() => navigate(-1)}>
        بازگشت
      </PremiumButton>
    </div>
  );
}
