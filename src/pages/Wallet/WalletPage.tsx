import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import WebApp from "@twa-dev/sdk";
import { Coins, Paperclip, CheckCircle2, ArrowUpCircle, ArrowDownCircle, Tag, Globe2 } from "lucide-react";

import { createWalletCardInvoice, createWalletOnlinePayment, getOnlinePaymentStatus, getWallet, topupWallet } from "@/shared/api/services";
import type { Wallet as WalletType } from "@/shared/api/types";
import { ApiError, friendlyErrorMessage } from "@/shared/api/client";

import GlassCard from "@/shared/ui/GlassCard";
import { ExpiryCountdown } from "@/shared/ui/ExpiryCountdown";
import { StepIndicator } from "@/shared/ui/StepIndicator";
import PremiumButton from "@/shared/ui/PremiumButton";
import PremiumInput from "@/shared/ui/PremiumInput";
import Skeleton from "@/shared/ui/Skeleton";
import FadeIn from "@/shared/animations/FadeIn";

import styles from "./WalletPage.module.css";

const QUICK_AMOUNTS = [50000, 100000, 200000];

// این عدد فقط برای تصمیم UI (نمایش/عدم‌نمایش دکمه‌ی «پرداخت آنلاین») استفاده
// می‌شود؛ منبع اصلی حقیقت همیشه بک‌اند (data.online_payment_min_amount) است
// که از همان config.py ربات می‌آید. این مقدار پیش‌فرض فقط تا قبل از لود شدن
// اطلاعات کیف پول به کار می‌رود.
const DEFAULT_ONLINE_MIN_AMOUNT = 50000;

type TopupStep = "amount" | "method" | "card" | "online";

export default function WalletPage() {
  const navigate = useNavigate();
  const [data, setData] = useState<WalletType | null>(null);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState<TopupStep | null>(null);
  const [amount, setAmount] = useState<string>("");
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [onlinePayment, setOnlinePayment] = useState<{ paymentId: number; paymentLink: string; price: number; expiresAt?: string } | null>(null);
  const [cardInvoice, setCardInvoice] = useState<{ invoiceId: number; expiresAt: string; cardNumber: string; cardHolder: string } | null>(null);

  function load() {
    setLoading(true);
    getWallet()
      .then(setData)
      .catch(() => toast.error("خطا در دریافت اطلاعات کیف پول"))
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  // در مرحله‌ی پرداخت آنلاین، هر ۵ ثانیه وضعیت اینوویس را خودکار چک می‌کنیم
  // تا کاربر مجبور نباشد خودش دستی دکمه بزند (دقیقاً مثل صفحه‌ی خرید پلن).
  useEffect(() => {
    if (step !== "online" || !onlinePayment) return;
    const interval = setInterval(async () => {
      try {
        const res = await getOnlinePaymentStatus(onlinePayment.paymentId);
        if (res.status === "paid") {
          clearInterval(interval);
          toast.success("✅ کیف پول شما شارژ شد");
          setStep(null);
          setAmount("");
          setOnlinePayment(null);
          load();
        }
      } catch {
        // خطای موقت شبکه؛ در تلاش بعدی دوباره چک می‌شود.
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [step, onlinePayment]);

  const onlineMinAmount = data?.online_payment_min_amount ?? DEFAULT_ONLINE_MIN_AMOUNT;
  const onlineEligible = !!data?.online_payment_enabled && Number(amount) > onlineMinAmount;

  function goToAmountStep() {
    setStep("amount");
  }

  async function goToCardStep() {
    if (!amount) return;
    setBusy(true);
    try {
      const inv = await createWalletCardInvoice(Number(amount));
      setCardInvoice({ invoiceId: inv.invoice_id, expiresAt: inv.expires_at, cardNumber: inv.card_number, cardHolder: inv.card_holder });
      setStep("card");
    } catch (e) {
      toast.error(friendlyErrorMessage(e, "خطا در ایجاد فاکتور شارژ کیف پول"));
    } finally {
      setBusy(false);
    }
  }

  function proceedFromAmount() {
    if (!amount) return;
    if (onlineEligible) setStep("method");
    else goToCardStep();
  }

  async function submitTopup() {
    if (!amount || !file) return;
    setBusy(true);
    try {
      await topupWallet(Number(amount), file, cardInvoice?.invoiceId);
      toast.success("✅ رسید ثبت شد. پس از تأیید ادمین، کیف پول شما شارژ می‌شود.");
      setStep(null);
      setAmount("");
      setFile(null);
      setCardInvoice(null);
      load();
    } catch (e) {
      // ممکن است ارسال رسید به ادمین در تلگرام شکست بخورد (telegram_delivery_failed)
      // یا فرمت فایل نامعتبر باشد (invalid_file_type)؛ باید کاربر دلیل واقعی را ببیند.
      toast.error(friendlyErrorMessage(e, "خطا در ارسال رسید"));
    } finally {
      setBusy(false);
    }
  }

  async function startOnlineTopup() {
    if (!amount) return;
    setBusy(true);
    try {
      const res = await createWalletOnlinePayment(Number(amount));
      setOnlinePayment({ paymentId: res.payment_id, paymentLink: res.payment_link, price: res.price, expiresAt: res.expires_at });
      setStep("online");
      try {
        WebApp.openLink(res.payment_link);
      } catch {
        window.open(res.payment_link, "_blank");
      }
    } catch (e) {
      // اگر مبلف بیش از سقف مجاز باشد (amount_too_high) یا درگاه فیرفعال/خطادار باشد
      // (gateway_disabled / gateway_error)، باید همان را نمایش داد، نه پیام حداقل مبلف را.
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

  async function checkOnlineTopup() {
    if (!onlinePayment) return;
    setBusy(true);
    try {
      const res = await getOnlinePaymentStatus(onlinePayment.paymentId);
      if (res.status === "paid") {
        toast.success("✅ کیف پول شما شارژ شد");
        setStep(null);
        setAmount("");
        setOnlinePayment(null);
        load();
      } else {
        toast.error("هنوز پرداختی برای این تراکنش ثبت نشده؛ چند لحظه بعد دوباره امتحان کنید");
      }
    } catch {
      toast.error("خطا در بررسی وضعیت پرداخت");
    } finally {
      setBusy(false);
    }
  }

  if (step === "online" && onlinePayment) {
    return (
      <div className={styles.page}>
        <StepIndicator step={2} total={2} label="شارژ کیف پول" />
        {onlinePayment.expiresAt && (
          <ExpiryCountdown
            expiresAt={onlinePayment.expiresAt}
            onExpire={() => {
              toast.error("⏰ مهلت پرداخت این فاکتور به پایان رسید. لطفاً دوباره از اول شروع کنید.");
              setOnlinePayment(null);
              setStep("method");
            }}
          />
        )}
        <FadeIn>
          <GlassCard className={styles.infoCard}>
            <p>مبلغ: <b>{onlinePayment.price.toLocaleString("fa-IR")} تومان</b></p>
            <p style={{ opacity: 0.75, fontSize: 13, marginTop: 8 }}>
              روی دکمه‌ی «رفتن به درگاه پرداخت» بزنید، مبلغ را واریز کنید. به‌محض تأیید
              بانک، کیف پول شما به‌صورت خودکار شارژ می‌شود.
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
        <PremiumButton fullWidth variant="secondary" loading={busy} onClick={checkOnlineTopup}>
          ✅ پرداخت را انجام دادم / بررسی کن
        </PremiumButton>
        <PremiumButton fullWidth variant="ghost" onClick={() => setStep("method")}>
          بازگشت
        </PremiumButton>
      </div>
    );
  }

  if (step === "method" && data) {
    return (
      <div className={styles.page}>
        <StepIndicator step={1} total={2} label="شارژ کیف پول" />
        <FadeIn>
          <GlassCard className={styles.infoCard}>
            <p>مبلغ: <b>{Number(amount).toLocaleString("fa-IR")} تومان</b></p>
            <p style={{ opacity: 0.75, fontSize: 13, marginTop: 8 }}>روش پرداخت را انتخاب کنید</p>
          </GlassCard>
        </FadeIn>

        <PremiumButton fullWidth loading={busy} onClick={startOnlineTopup}>
          <Globe2 size={18} /> پرداخت آنلاین (تایید خودکار)
        </PremiumButton>
        <PremiumButton fullWidth variant="secondary" loading={busy} onClick={goToCardStep}>
          💳 کارت به کارت
        </PremiumButton>
        <PremiumButton fullWidth variant="ghost" onClick={() => setStep("amount")}>
          🔙 بازگشت
        </PremiumButton>
      </div>
    );
  }

  if ((step === "amount" || step === "card") && data) {
    return (
      <div className={styles.page}>
        <StepIndicator step={step === "card" ? 2 : 1} total={2} label="شارژ کیف پول" />
        {step === "card" && file && (
          <img
            src={URL.createObjectURL(file)}
            alt="پیش‌نمایش رسید"
            style={{ width: "100%", maxHeight: 220, objectFit: "contain", borderRadius: 12, marginBottom: 8 }}
          />
        )}

        {step === "card" && cardInvoice && (
          <ExpiryCountdown
            expiresAt={cardInvoice.expiresAt}
            onExpire={() => {
              toast.error("⏰ مهلت این فاکتور به پایان رسید. لطفاً دوباره از اول شروع کنید.");
              setCardInvoice(null);
              setStep(onlineEligible ? "method" : "amount");
            }}
          />
        )}

        {step === "card" && (
          <FadeIn>
            <GlassCard className={styles.infoCard}>
              <div className={styles.infoInner}>
                <p>💳 شماره کارت:</p>
                <p className={styles.cardNumber}>{cardInvoice?.cardNumber ?? data.card_number}</p>
                <p>👤 {cardInvoice?.cardHolder ?? data.card_holder}</p>
              </div>
            </GlassCard>
          </FadeIn>
        )}

        <FadeIn delay={0.05}>
          <PremiumInput
            label="💵 مبلغ دلخواه (تومان)"
            type="number"
            placeholder="مثلا 100000"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </FadeIn>

        <div className={styles.quickAmounts}>
          {QUICK_AMOUNTS.map((a) => (
            <button
              key={a}
              type="button"
              className={styles.quickChip}
              onClick={() => setAmount(String(a))}
            >
              💰 {a.toLocaleString("fa-IR")} تومان
            </button>
          ))}
        </div>

        {step === "card" && (
          <FadeIn delay={0.1}>
            <label className={styles.fileDrop}>
              {file ? (
                <>
                  <CheckCircle2 size={18} /> {file.name}
                </>
              ) : (
                <>
                  <Paperclip size={18} /> 📸 عکس رسید را ارسال کنید
                </>
              )}
              <input
                type="file"
                accept="image/*"
                hidden
                onChange={(e) => setFile(e.target.files?.[0] || null)}
              />
            </label>
          </FadeIn>
        )}

        {step === "amount" ? (
          <PremiumButton fullWidth disabled={!amount} onClick={proceedFromAmount}>
            ادامه
          </PremiumButton>
        ) : (
          <PremiumButton
            fullWidth
            disabled={!amount || !file}
            loading={busy}
            onClick={submitTopup}
          >
            ارسال رسید برای تأیید
          </PremiumButton>
        )}

        <PremiumButton
          fullWidth
          variant="ghost"
          onClick={() => {
            setCardInvoice(null);
            if (step === "card" && onlineEligible) setStep("method");
            else setStep(null);
          }}
        >
          🔙 بازگشت
        </PremiumButton>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <FadeIn>
        <GlassCard glow className={`${styles.balanceCard} pulse-glow-gold`}>
          <div className={styles.balanceInner}>
            <div className={`${styles.balanceIcon} sphere-3d float`}>
              <Coins size={28} />
            </div>
            <span className={styles.balanceLabel}>💰 موجودی قابل استفاده</span>
            <span className={styles.balanceValue}>
              {loading || !data ? (
                <Skeleton width={100} height={20} style={{ verticalAlign: "middle" }} />
              ) : (
                `${data.wallet.toLocaleString("fa-IR")} تومان`
              )}
            </span>
            {data && data.locked_wallet > 0 && (
              <span className={styles.lockedNote}>
                🔒 موجودی در انتظار: {data.locked_wallet.toLocaleString("fa-IR")} تومان
              </span>
            )}

            <PremiumButton
              fullWidth
              className={styles.topupBtn}
              onClick={goToAmountStep}
            >
              💳 شارژ کیف پول
            </PremiumButton>

            <PremiumButton
              fullWidth
              variant="ghost"
              leftIcon={<Tag size={16} />}
              onClick={() => navigate("/discount")}
            >
              🎟 ثبت کد تخفیف
            </PremiumButton>
          </div>
        </GlassCard>
      </FadeIn>

      {data && data.locked_wallet > 0 && (
        <FadeIn delay={0.08}>
          <p className={styles.hintText}>
            ℹ️ موجودی در انتظار، پس از خرید حجم {data.min_purchase_gb.toLocaleString("fa-IR")} گیگ یا بیشتر
            توسط فردی که با لینک شما عضو شده، به‌صورت خودکار آزاد می‌شود.
          </p>
        </FadeIn>
      )}

      <FadeIn delay={0.1}>
        <h3 className={styles.sectionTitle}>📋 تراکنش‌های من</h3>
      </FadeIn>

      {loading ? (
        <p className={styles.emptyState}>در حال بارگذاری...</p>
      ) : !data || data.transactions.length === 0 ? (
        <p className={styles.emptyState}>📋 هنوز تراکنشی ندارید.</p>
      ) : (
        <div className={styles.txList}>
          {data.transactions.map((tx, i) => (
            <FadeIn key={i} delay={0.03 * i}>
              <GlassCard className={styles.txRow} hover={false}>
                <div className={styles.txRowInner}>
                  <div className={`${styles.txIcon} sphere-3d`}>
                    {tx.amount >= 0 ? (
                      <ArrowUpCircle size={20} color="#33F5A5" />
                    ) : (
                      <ArrowDownCircle size={20} color="#FF5470" />
                    )}
                  </div>
                  <div className={styles.txBody}>
                    <span className={styles.txTitle}>{tx.description}</span>
                    <span className={styles.txDate}>{tx.created_at}</span>
                  </div>
                  <span
                    className={styles.txAmount}
                    style={{ color: tx.amount >= 0 ? "#33F5A5" : "#FF5470" }}
                  >
                    {tx.amount >= 0 ? "+" : ""}
                    {tx.amount.toLocaleString("fa-IR")}
                  </span>
                </div>
              </GlassCard>
            </FadeIn>
          ))}
        </div>
      )}
    </div>
  );
}
