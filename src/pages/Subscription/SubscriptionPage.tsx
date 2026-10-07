import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import WebApp from "@twa-dev/sdk";
import { CheckCircle2, Paperclip, Wrench, ChevronLeft, ChevronRight, Rocket, Sparkles, Globe2 } from "lucide-react";

import {
  buyPlanWithWallet,
  createOnlinePayment,
  getCardInfo,
  getOnlinePaymentStatus,
  getPlans,
  uploadPlanReceipt,
  validateDiscount,
} from "@/shared/api/services";
import type { Plan, VipCategory } from "@/shared/api/types";
import { ApiError, friendlyErrorMessage } from "@/shared/api/client";

import GlassCard from "@/shared/ui/GlassCard";
import { ExpiryCountdown } from "@/shared/ui/ExpiryCountdown";
import { StepIndicator } from "@/shared/ui/StepIndicator";
import PremiumButton from "@/shared/ui/PremiumButton";
import PremiumInput from "@/shared/ui/PremiumInput";
import FadeIn from "@/shared/animations/FadeIn";

import styles from "./SubscriptionPage.module.css";

type Step = "list" | "checkout" | "card-pay" | "online-pay" | "done";

function formatDays(days: number): string {
  return days > 0 ? `${days} روز` : "زمان نامحدود";
}

export default function SubscriptionPage() {
  const navigate = useNavigate();


  const [vipCategories, setVipCategories] = useState<VipCategory[]>([]);
  const [activeCategory, setActiveCategory] = useState<VipCategory | null>(null);
  const [agentPercent, setAgentPercent] = useState(0);
  const [loading, setLoading] = useState(true);
  const [ordersEnabled, setOrdersEnabled] = useState(true);
  const [onlinePaymentEnabled, setOnlinePaymentEnabled] = useState(false);

  const [step, setStep] = useState<Step>("list");
  const [selected, setSelected] = useState<Plan | null>(null);
  const [discountCode, setDiscountCode] = useState("");
  const [discountPercent, setDiscountPercent] = useState<number | null>(null);
  const [checkingDiscount, setCheckingDiscount] = useState(false);
  const [busy, setBusy] = useState(false);

  const [cardInfo, setCardInfo] = useState<{ card_number: string; card_holder: string; price: number; invoice_id?: number; expires_at?: string } | null>(null);
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [onlinePayment, setOnlinePayment] = useState<{ paymentId: number; paymentLink: string; price: number; expiresAt?: string } | null>(null);

  useEffect(() => {
    getPlans()
      .then((res) => {
        setVipCategories(res.vip_categories || []);
        setOrdersEnabled(res.orders_enabled);
        setAgentPercent(res.agent_discount_percent || 0);
        setOnlinePaymentEnabled(!!res.online_payment_enabled);
      })
      .catch(() => toast.error("خطا در دریافت لیست پلن‌ها"))
      .finally(() => setLoading(false));
  }, []);

  // وقتی وارد مرحله‌ی پرداخت آنلاین می‌شویم، هر ۵ ثانیه وضعیت اینوویس را
  // به‌صورت خودکار چک می‌کنیم تا کاربر مجبور نباشد خودش دستی دکمه بزند؛
  // به‌محض تایید بانک، بدون هیچ کاری از سمت کاربر به مرحله‌ی "done" می‌رویم.
  useEffect(() => {
    if (step !== "online-pay" || !onlinePayment) return;
    const interval = setInterval(async () => {
      try {
        const res = await getOnlinePaymentStatus(onlinePayment.paymentId);
        if (res.status === "paid") {
          clearInterval(interval);
          toast.success("پرداخت با موفقیت تأیید شد");
          setStep("done");
        }
      } catch {
        // خطای موقت شبکه؛ در تلاش بعدی دوباره چک می‌شود.
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [step, onlinePayment]);

  const [discountMeta, setDiscountMeta] = useState<{ type: "percent" | "amount"; amount: number } | null>(null);

  // نکته: قیمت نهایی باید دقیقاً همان منطق بک‌اند را دنبال کند
  // (webapp_api._compute_final_price) — بهترین قیمت بین کد تخفیف کاربر و
  // تخفیف خودکار نمایندگی (فقط روی VIP)، وگرنه برای کاربران نماینده، عددی
  // که موقع پرداخت واقعاً کسر می‌شود با عددی که این‌جا نمایش داده می‌شود
  // فرق می‌کند.
  const codePrice = selected
    ? discountMeta?.type === "amount"
      ? Math.max(0, selected.price - discountMeta.amount)
      : Math.round(selected.price * (1 - (discountPercent || 0) / 100))
    : 0;
  const agentPrice =
    selected && selected.type === "vip" && agentPercent > 0
      ? Math.round(selected.price * (1 - agentPercent / 100))
      : selected?.price ?? 0;
  const finalPrice = selected ? Math.min(codePrice, agentPrice) : 0;
  const agentDiscountWins = selected ? agentPrice < codePrice : false;

  async function checkDiscount() {
    if (!discountCode.trim()) {
      setDiscountPercent(null);
      setDiscountMeta(null);
      return;
    }
    setCheckingDiscount(true);
    try {
      const res = await validateDiscount(discountCode.trim(), selected?.key);
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
        else if (res.reason === "min_order_amount")
          toast.error(
            `این کد فقط برای سفارش‌های بالای ${(res.min_order_amount || 0).toLocaleString("fa-IR")} تومان قابل استفاده است`
          );
        else toast.error("کد تخفیف نامعتبر است");
      }
    } catch {
      toast.error("خطا در بررسی کد تخفیف");
    } finally {
      setCheckingDiscount(false);
    }
  }

  async function payWithWallet() {
    if (!selected) return;
    setBusy(true);
    try {
      await buyPlanWithWallet(selected.key, discountCode.trim());
      toast.success("خرید با موفقیت انجام شد");
      setStep("done");
    } catch (e) {
      const err = e as ApiError;
      if (err.code === "insufficient_balance") toast.error("موجودی کیف پول کافی نیست");
      else if (err.code === "orders_closed") toast.error("بخش سفارشات موقتاً بسته است");
      else toast.error("خطا در ثبت خرید");
    } finally {
      setBusy(false);
    }
  }

  async function startCardPay() {
    if (!selected) return;
    setBusy(true);
    try {
      const info = await getCardInfo(selected.key, discountCode.trim());
      setCardInfo(info);
      setStep("card-pay");
    } catch {
      toast.error("خطا در دریافت اطلاعات پرداخت");
    } finally {
      setBusy(false);
    }
  }

  async function startOnlinePay() {
    if (!selected) return;
    setBusy(true);
    try {
      const res = await createOnlinePayment(selected.key, discountCode.trim());
      setOnlinePayment({ paymentId: res.payment_id, paymentLink: res.payment_link, price: res.price, expiresAt: res.expires_at });
      setStep("online-pay");
      try {
        WebApp.openLink(res.payment_link);
      } catch {
        window.open(res.payment_link, "_blank");
      }
    } catch (e) {
      // دلیل واقعی ممکن است فیرفعال بودن درگاه (gateway_disabled)، خطای ارتباط با درگاه
      // (gateway_error) یا مبلـ کم بودن مبلـ (amount_too_low) باشد؛ باید هرکدام با پیام درست نمایش داده شود.
      const err = e as ApiError;
      if (err.code === "amount_too_low")
        toast.error(
          "❌ برای مبالف ۵۰ هزار تومان و کمتر امکان استفاده از درگاه پرداخت آنلاین نیست. لطفاً از کارت‌به‌کارت یا کیف پول استفاده کنید.",
        );
      else
        toast.error(friendlyErrorMessage(e, "خطا در اتصال به درگاه پرداخت"));
    } finally {
      setBusy(false);
    }
  }

  async function checkOnlinePayment() {
    if (!onlinePayment) return;
    setBusy(true);
    try {
      const res = await getOnlinePaymentStatus(onlinePayment.paymentId);
      if (res.status === "paid") {
        toast.success("پرداخت با موفقیت تأیید شد");
        setStep("done");
      } else {
        toast.error("هنوز پرداختی برای این تراکنش ثبت نشده؛ چند لحظه بعد دوباره امتحان کنید");
      }
    } catch {
      toast.error("خطا در بررسی وضعیت پرداخت");
    } finally {
      setBusy(false);
    }
  }

  async function submitReceipt() {
    if (!selected || !receiptFile) return;
    setBusy(true);
    try {
      await uploadPlanReceipt(selected.key, discountCode.trim(), receiptFile, cardInfo?.invoice_id);
      toast.success("رسید ارسال شد؛ پس از تأیید ادمین سرویس برایتان ارسال می‌شود");
      setStep("done");
    } catch (e) {
      // ممکن است ارسال رسید به ادمین در تلگرام شکست بخورد (telegram_delivery_failed)
      // یا فرمت فایل نامعتبر باشد (invalid_file_type)؛ باید کاربر دلیل واقعی را ببیند.
      toast.error(friendlyErrorMessage(e, "خطا در ارسال رسید"));
    } finally {
      setBusy(false);
    }
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

  if (step === "online-pay" && selected && onlinePayment) {
    return (
      <div className={styles.page}>
        <StepIndicator step={2} total={3} label="پرداخت" />
        {onlinePayment.expiresAt && (
          <ExpiryCountdown
            expiresAt={onlinePayment.expiresAt}
            onExpire={() => {
              toast.error("⏰ مهلت پرداخت این فاکتور به پایان رسید. لطفاً دوباره سفارش دهید.");
              setOnlinePayment(null);
              setStep("checkout");
            }}
          />
        )}
        <FadeIn>
          <GlassCard className={styles.infoCard}>
            <p>پلن: <b>{selected.name}</b></p>
            <p>مبلغ: <b>{onlinePayment.price.toLocaleString("fa-IR")} تومان</b></p>
            <p style={{ opacity: 0.75, fontSize: 13, marginTop: 8 }}>
              روی دکمه‌ی «رفتن به درگاه پرداخت» بزنید، مبلغ را واریز کنید. به‌محض تأیید
              بانک، به‌صورت خودکار سفارش شما ثبت می‌شود؛ اگر خواستید می‌توانید خودتان هم
              دستی وضعیت را بررسی کنید.
            </p>
          </GlassCard>
        </FadeIn>

        <PremiumButton
          fullWidth
          onClick={() => {
            try {
              WebApp.openLink(onlinePayment.paymentLink);
            } catch {
              window.open(onlinePayment.paymentLink, "_blank");
            }
          }}
        >
          <Globe2 size={18} /> رفتن به درگاه پرداخت
        </PremiumButton>
        <PremiumButton fullWidth variant="secondary" loading={busy} onClick={checkOnlinePayment}>
          ✅ پرداخت را انجام دادم / بررسی کن
        </PremiumButton>
        <PremiumButton fullWidth variant="ghost" onClick={() => setStep("checkout")}>
          بازگشت
        </PremiumButton>
      </div>
    );
  }

  if (step === "card-pay" && selected && cardInfo) {
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
            <p>به نام: <b>{cardInfo.card_holder}</b></p>
            <p>مبلغ: <b>{cardInfo.price.toLocaleString("fa-IR")} تومان</b></p>
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
        <PremiumButton fullWidth variant="ghost" onClick={() => setStep("checkout")}>
          بازگشت
        </PremiumButton>
      </div>
    );
  }

  if (step === "checkout" && selected) {
    return (
      <div className={styles.page}>
        <StepIndicator step={1} total={3} label="انتخاب" />
        <FadeIn>
          <GlassCard className={styles.planSummary}>
            <div className={styles.planSummaryInner}>
              <span className={styles.planName}>{selected.name}</span>
              <span className={styles.planDays}>{formatDays(selected.days)}</span>
            </div>
          </GlassCard>
        </FadeIn>

        <div className={styles.discountRow}>
          <PremiumInput
            placeholder="کد تخفیف (اختیاری)"
            value={discountCode}
            onChange={(e) => setDiscountCode(e.target.value)}
          />
          <PremiumButton
            variant="secondary"
            onClick={checkDiscount}
            loading={checkingDiscount}
          >
            اعمال
          </PremiumButton>
        </div>

        <GlassCard className={styles.priceCard}>
          <div className={styles.priceLine}>
            <span>قیمت پایه</span>
            <span>{selected.price.toLocaleString("fa-IR")} تومان</span>
          </div>
          {finalPrice < selected.price && agentDiscountWins ? (
            <div className={styles.priceLine} style={{ color: "#33F5A5" }}>
              <span>تخفیف نمایندگی</span>
              <span>٪{agentPercent}-</span>
            </div>
          ) : discountMeta?.type === "amount" ? (
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
        </GlassCard>

        <PremiumButton fullWidth loading={busy} onClick={payWithWallet}>
          پرداخت از کیف پول
        </PremiumButton>
        {onlinePaymentEnabled && (
          <PremiumButton fullWidth variant="secondary" loading={busy} onClick={startOnlinePay}>
            🌐 پرداخت آنلاین (تایید خودکار)
          </PremiumButton>
        )}
        <PremiumButton fullWidth variant="secondary" loading={busy} onClick={startCardPay}>
          پرداخت کارت‌به‌کارت
        </PremiumButton>
        <PremiumButton fullWidth variant="ghost" onClick={() => setStep("list")}>
          بازگشت به لیست پلن‌ها
        </PremiumButton>
      </div>
    );
  }

  const CATEGORY_TONES = [
    { grad: "radial-gradient(circle at 32% 28%,#C4A6FF,#8B5CF6 65%,#3A1B8E)", shadow: "rgba(139,92,246,.5)" },
    { grad: "radial-gradient(circle at 32% 28%,#8FC4FF,#2F7BFF 65%,#0F2C8E)", shadow: "rgba(47,123,255,.5)" },
    { grad: "radial-gradient(circle at 32% 28%,#FFB0EC,#FF3D9A 65%,#8A1F63)", shadow: "rgba(255,61,154,.5)" },
    { grad: "radial-gradient(circle at 32% 28%,#9DFFD9,#39FFB0 65%,#07603F)", shadow: "rgba(57,255,176,.4)" },
    { grad: "radial-gradient(circle at 32% 28%,#B0F3FF,#00D9FF 65%,#075E7E)", shadow: "rgba(0,217,255,.5)" },
  ];

  const categories = vipCategories;
  const list = activeCategory ? activeCategory.plans : [];
  const bestKey =
    list.length > 1 ? list.reduce((a, b) => (b.days > a.days ? b : a)).key : null;
  const showCategoryGrid = !activeCategory;

  function openPlan(plan: Plan) {
    if (!ordersEnabled) return;
    setSelected(plan);
    setDiscountCode("");
    setDiscountPercent(null);
    setDiscountMeta(null);
    setStep("checkout");
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

      {agentPercent > 0 && (
        <FadeIn delay={0.04}>
          <GlassCard className={`${styles.agentBanner} glass-premium pulse-glow-gold`}>
            <Sparkles size={18} />
            <span>
              🎖 به‌عنوان نماینده، <b>{agentPercent}٪</b> تخفیف خودکار روی همه‌ی پلن‌های VIP داری
            </span>
          </GlassCard>
        </FadeIn>
      )}

      <FadeIn>
        <GlassCard
          className={styles.customBuildCard}
          onClick={() => ordersEnabled && navigate("/custom-build")}
        >
          <div className={styles.customBuildInner}>
            <div className={`${styles.customBuildIcon} sphere-3d float`}>
              <Wrench size={22} />
            </div>
            <div className={styles.customBuildText}>
              <span className={styles.customBuildTitle}>کانفیگ خودتو بساز (ویژه VIP)</span>
              <span className={styles.customBuildSub}>حجم و مدت دلخواه خودتو انتخاب کن</span>
            </div>
            <ChevronLeft size={18} className={styles.chevron} />
          </div>
        </GlassCard>
      </FadeIn>

      <div className={styles.tabs}>
        <button
          className={`${styles.tabBtn} ${styles.tabActive}`}
          onClick={() => {
          }}
        >
          <Rocket size={16} /> VIP (V2Ray)
        </button>
      </div>

      {loading ? (
        <p className={styles.emptyState}>در حال بارگذاری پلن‌ها...</p>
      ) : showCategoryGrid ? (
        categories.length === 0 ? (
          <p className={styles.emptyState}>
            فعلاً دسته‌بندی‌ای برای VIP تعریف نشده.
          </p>
        ) : (
          <div className={styles.categoryGrid}>
            {categories.map((cat, i) => {
              const tone = CATEGORY_TONES[i % CATEGORY_TONES.length];
              const cheapest = cat.plans.length
                ? Math.min(...cat.plans.map((p) => p.price))
                : 0;
              const isHero = i === 0;
              return (
                <FadeIn key={cat.key} delay={0.05 * i}>
                  <GlassCard
                    glow
                    className={
                      isHero
                        ? `${styles.categoryCard} ${styles.categoryCardHero}`
                        : styles.categoryCard
                    }
                    onClick={() => setActiveCategory(cat)}
                  >
                    <div
                      className={`${styles.categoryIcon} sphere-3d float`}
                      style={{
                        background: tone.grad,
                        boxShadow: `0 10px 28px ${tone.shadow}, 0 0 22px ${tone.shadow}`,
                      }}
                    >
                      <Rocket size={isHero ? 26 : 20} />
                    </div>
                    <div className={styles.categoryText}>
                      <span className={styles.categoryName}>{cat.name}</span>
                      <span className={styles.categoryMeta}>
                        {cat.plans.length} پلن
                        {cheapest ? ` · از ${cheapest.toLocaleString("fa-IR")} ت` : ""}
                      </span>
                    </div>
                    <ChevronLeft size={18} className={styles.categoryChevron} />
                  </GlassCard>
                </FadeIn>
              );
            })}
          </div>
        )
      ) : (
        <>
          {activeCategory && (
            <button
              className={styles.backRow}
              onClick={() => setActiveCategory(null)}
            >
              <ChevronRight size={16} />
              بازگشت به دسته‌بندی‌ها
              <span className={styles.backRowTitle}>{activeCategory.name}</span>
            </button>
          )}

          {list.length === 0 ? (
            <p className={styles.emptyState}>فعلاً پلنی برای این بخش تعریف نشده.</p>
          ) : (
            list.map((plan, i) => (
              <FadeIn key={plan.key} delay={0.04 * i}>
                <div
                  className={plan.key === bestKey ? styles.bestWrap : undefined}
                >
                  {plan.key === bestKey && (
                    <span className={styles.bestBadge}>
                      ⭐ پیشنهاد ویژه کهکشان
                    </span>
                  )}
                  <GlassCard
                    className={
                      plan.key === bestKey
                        ? `${styles.planRow} ${styles.planRowBest} glass-premium pulse-glow-gold`
                        : styles.planRow
                    }
                    onClick={() => openPlan(plan)}
                  >
                    <div className={styles.planRowInner}>
                      <div
                        className={
                          plan.key === bestKey
                            ? `${styles.planIcon} ${styles.planIconGold} sphere-3d float`
                            : `${styles.planIcon} sphere-3d float`
                        }
                      >
                        <Rocket size={20} />
                      </div>
                      <div className={styles.planRowText}>
                        <span className={styles.planRowTitle}>{plan.name}</span>
                        <span className={styles.planRowSub}>
                          {formatDays(plan.days)}
                          {plan.volume_gb ? ` · ${plan.volume_gb} گیگ` : ""}
                        </span>
                      </div>
                      <span
                        className={
                          plan.key === bestKey
                            ? `${styles.planPrice} ${styles.planPriceGold}`
                            : styles.planPrice
                        }
                      >
                        {plan.price.toLocaleString("fa-IR")} ت
                      </span>
                    </div>
                  </GlassCard>
                </div>
              </FadeIn>
            ))
          )}
        </>
      )}
    </div>
  );
}
